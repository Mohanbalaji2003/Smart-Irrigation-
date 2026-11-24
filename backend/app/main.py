import asyncio
import os
import io
import csv
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field

from app.state import system_state
from app.model import ml_service
from app.weather import weather_service
from app.simulation import simulator

@asynccontextmanager
async def lifespan(app: FastAPI):
    simulator.start()
    yield
    simulator.stop()

app = FastAPI(
    title="AegisCrop Krishi™ Enterprise - Indian Smart Irrigation & Precision Agritech API",
    version="2.5.0",
    description="Enterprise Precision Irrigation API integrating ICAR/IMD Agromet protocols, Scikit-Learn Multi-Output inference, 3-Phase agricultural power telemetry, and PM-KUSUM solar integration.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Request / Response Schemas
# -------------------------------------------------------------

class ModeRequest(BaseModel):
    mode: str = Field(..., description="Operating mode: AI_AUTONOMOUS, MANUAL_OVERRIDE, or WEATHER_ECO")

class ValveRequest(BaseModel):
    status: int = Field(..., ge=0, le=1, description="0 for OFF, 1 for ON")

class SensorUpdateRequest(BaseModel):
    value: float = Field(..., ge=0.0, le=1.0, description="Scaled moisture fraction between 0.0 and 1.0")

class PredictRequest(BaseModel):
    sensor_values: List[float] = Field(..., min_length=20, max_length=20, description="Array of 20 scaled sensor values")

class ScenarioRequest(BaseModel):
    scenario: str = Field(..., description="NORTH_WEST_HEATWAVE, MONSOON_CLOUDBURST, POMEGRANATE_DEFICIT, OPTIMAL_RABI_EQUILIBRIUM")

class ScheduleItem(BaseModel):
    name: str
    parcel_ids: List[int]
    time_window: str
    max_duration_min: int
    days: List[str]
    smart_weather_skip: bool = True
    power_source: str = "3-Phase Agricultural Grid"

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.get("/api/health")
def get_health():
    return {
        "status": "HEALTHY",
        "service": "AegisCrop Krishi™ Enterprise Irrigation Engine",
        "version": "2.5.0-Bharat",
        "agro_zone": "Indo-Gangetic & Deccan Agronet",
        "model_loaded": ml_service.model is not None,
        "active_sensors": len(system_state.sensors),
        "active_parcels": len(system_state.parcels),
        "power_grid": system_state.power_telemetry["grid_status"]
    }

@app.get("/api/system/status")
def get_system_status():
    active_valves = sum(1 for p in system_state.parcels if p["valve_status"] == 1)
    total_flow = sum(p["flow_rate_lpm"] for p in system_state.parcels if p["valve_status"] == 1)
    avg_moisture = round(sum(s["value"] for s in system_state.sensors) / len(system_state.sensors), 3)

    return {
        "mode": system_state.mode,
        "emergency_stop": system_state.emergency_stop,
        "simulation_active": system_state.simulation_active,
        "simulation_speed": system_state.simulation_speed,
        "total_water_consumed_liters": system_state.total_water_consumed_liters,
        "water_saved_vs_baseline_pct": system_state.water_saved_vs_baseline_pct,
        "rupees_saved_today": system_state.rupees_saved_today,
        "solar_generation_kw": system_state.solar_generation_kw,
        "active_valves_count": active_valves,
        "current_total_flow_lpm": total_flow,
        "average_soil_moisture": avg_moisture,
        "power_telemetry": system_state.power_telemetry,
        "parcels": system_state.parcels,
        "sensors": system_state.sensors,
        "weather_summary": weather_service.get_current_conditions()
    }

@app.post("/api/system/mode")
def set_system_mode(req: ModeRequest):
    valid_modes = ["AI_AUTONOMOUS", "MANUAL_OVERRIDE", "WEATHER_ECO"]
    if req.mode not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Must be one of {valid_modes}")

    system_state.mode = req.mode
    system_state.add_log(
        category="SYSTEM",
        severity="INFO",
        message=f"System operation mode switched to {req.mode} by farm agronomist."
    )
    return {"status": "SUCCESS", "mode": system_state.mode}

@app.post("/api/system/emergency-stop")
def toggle_emergency_stop():
    system_state.emergency_stop = not system_state.emergency_stop
    if system_state.emergency_stop:
        for p in system_state.parcels:
            p["valve_status"] = 0
            p["manual_override"] = False
        system_state.add_log(
            category="VALVE_CONTROL",
            severity="CRITICAL",
            message="EMERGENCY SHUTOFF ENGAGED! Borewell pump de-energized. All solenoids sealed."
        )
    else:
        system_state.add_log(
            category="VALVE_CONTROL",
            severity="WARNING",
            message="Emergency shutoff cleared. Resuming nominal agricultural schedule."
        )
    return {"emergency_stop": system_state.emergency_stop}

@app.post("/api/system/simulation-toggle")
def toggle_simulation():
    system_state.simulation_active = not system_state.simulation_active
    status = "RESUMED" if system_state.simulation_active else "PAUSED"
    system_state.add_log("SYSTEM", "INFO", f"IoT sensor physics simulation loop {status}.")
    return {"simulation_active": system_state.simulation_active}

@app.post("/api/system/scenario")
def apply_scenario(req: ScenarioRequest):
    system_state.apply_scenario(req.scenario)
    return {"status": "SUCCESS", "scenario": req.scenario, "sensors": system_state.sensors}

@app.get("/api/parcels")
def list_parcels():
    return system_state.parcels

@app.post("/api/parcels/{parcel_id}/valve")
def control_parcel_valve(parcel_id: int, req: ValveRequest):
    if parcel_id < 0 or parcel_id >= len(system_state.parcels):
        raise HTTPException(status_code=404, detail="Parcel not found")

    if system_state.emergency_stop:
        raise HTTPException(status_code=403, detail="Cannot actuate valves while Emergency Stop is engaged.")

    parcel = system_state.parcels[parcel_id]
    parcel["valve_status"] = req.status
    parcel["manual_override"] = True

    status_str = "OPENED (ENERGIZED)" if req.status == 1 else "CLOSED (STANDBY)"
    system_state.add_log(
        category="VALVE_CONTROL",
        severity="WARNING" if req.status == 1 else "INFO",
        message=f"Manual Override: {parcel['name']} solenoid {status_str} by agronomist."
    )
    return {"status": "SUCCESS", "parcel": parcel}

@app.get("/api/sensors")
def list_sensors():
    return system_state.sensors

@app.post("/api/sensors/{sensor_id}")
def update_sensor_reading(sensor_id: int, req: SensorUpdateRequest):
    if sensor_id < 0 or sensor_id >= len(system_state.sensors):
        raise HTTPException(status_code=404, detail="Sensor not found")

    system_state.set_sensor_value(sensor_id, req.value)
    return {"status": "SUCCESS", "sensor": system_state.sensors[sensor_id]}

@app.post("/api/predict")
def predict_irrigation(req: PredictRequest):
    result = ml_service.predict(req.sensor_values)
    return {
        "status": "SUCCESS",
        "input_sensor_count": len(req.sensor_values),
        "predictions": result["predictions"],
        "probabilities": result["probabilities"],
        "reasons": result["reasons"],
        "top_influencers": result["top_influencers"]
    }

@app.get("/api/ml/info")
def get_ml_info():
    return {
        "model_type": "MultiOutputClassifier(RandomForestClassifier)",
        "estimators_count": len(ml_service.model.estimators_) if ml_service.model else 0,
        "input_features": 20,
        "output_targets": ["parcel_0", "parcel_1", "parcel_2"],
        "feature_importances": ml_service.feature_importances,
        "training_dataset": "irrigation_machine.csv",
        "description": "Multi-label Random Forest calibrated for high-precision rootzone VWC management across 3 Indian agro-zones."
    }

@app.get("/api/weather")
def get_weather():
    return {
        "current": weather_service.get_current_conditions(),
        "forecast": weather_service.get_forecast()
    }

@app.get("/api/analytics/history")
def get_history():
    return {
        "data_points": system_state.history,
        "total_water_liters": system_state.total_water_consumed_liters,
        "water_saved_vs_baseline_pct": system_state.water_saved_vs_baseline_pct,
        "rupees_saved_today": system_state.rupees_saved_today,
        "solar_generation_kw": system_state.solar_generation_kw
    }

@app.get("/api/schedules")
def get_schedules():
    return system_state.schedules

@app.post("/api/schedules")
def add_schedule(item: ScheduleItem):
    new_schedule = {
        "id": len(system_state.schedules) + 1,
        "name": item.name,
        "parcel_ids": item.parcel_ids,
        "time_window": item.time_window,
        "status": "ARMED",
        "smart_weather_skip": item.smart_weather_skip,
        "max_duration_min": item.max_duration_min,
        "days": item.days,
        "power_source": item.power_source
    }
    system_state.schedules.append(new_schedule)
    system_state.add_log("SYSTEM", "INFO", f"New schedule registered: {item.name}")
    return {"status": "SUCCESS", "schedule": new_schedule}

@app.get("/api/logs")
def get_system_logs():
    return system_state.logs

@app.get("/api/analytics/export-csv")
def export_csv_report():
    """Generates an enterprise agronomic CSV audit report."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Event_ID", "Timestamp", "Category", "Severity", "Message"])
    for l in system_state.logs:
        writer.writerow([l["id"], l["timestamp"], l["category"], l["severity"], l["message"]])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=aegiscrop_krishi_audit_report.csv"}
    )

# -------------------------------------------------------------
# Static Frontend Serving
# -------------------------------------------------------------
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
