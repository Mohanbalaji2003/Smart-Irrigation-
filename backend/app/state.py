import time
from datetime import datetime, timezone
from typing import List, Dict, Any

class IrrigationState:
    def __init__(self):
        self.mode: str = "AI_AUTONOMOUS"  # "AI_AUTONOMOUS", "MANUAL_OVERRIDE", "WEATHER_ECO"
        self.emergency_stop: bool = False
        self.simulation_active: bool = True
        self.simulation_speed: float = 1.0  # multiplier
        self.last_ai_evaluation_time: float = time.time()
        self.total_water_consumed_liters: float = 8450.0
        self.water_saved_vs_baseline_pct: float = 38.6
        
        # Indian Agricultural Economic & Energy Metrics (DISCOM Agricultural Tariff + PM-KUSUM)
        self.electricity_tariff_inr_kwh: float = 7.50  # Average State DISCOM Commercial/Agri Tariff (INR)
        self.rupees_saved_today: float = 1845.0  # Total INR saved via AI pulse scheduling + solar offset
        self.solar_generation_kw: float = 4.85  # PM-KUSUM 5.5kW Agri Solar Pump generation
        self.solar_utilization_pct: float = 82.0

        # 3-Phase Indian Agricultural Grid Telemetry
        self.power_telemetry = {
            "grid_status": "3-PHASE NOMINAL (DISCOM FEED ONLINE)",
            "voltage_r_y_v": 414.2,
            "voltage_y_b_v": 416.8,
            "voltage_b_r_v": 412.5,
            "frequency_hz": 50.02,
            "pump_motor_hp": 7.5,
            "pump_motor_type": "7.5 HP Submersible Borewell Motor (3-Phase)",
            "current_draw_a": 11.4,
            "power_factor": 0.88,
            "dry_run_protection": "ARMED_OK (Water Table at 42m Depth)",
            "motor_temperature_c": 44.5,
            "overload_trip": False,
            "pm_kusum_solar_active": True,
            "solar_feed_kw": 4.85
        }

        # 3 Authentic Indian Commercial Agriculture Parcels
        self.parcels: List[Dict[str, Any]] = [
            {
                "id": 0,
                "code": "ZONE-01-PADDY",
                "name": "Basmati Paddy & Sugarcane Block",
                "sector": "Sector A-1 (Cauvery-Gangetic Basin)",
                "crop": "Pusa Basmati-1121 & Sugarcane (Co-0238)",
                "area_acres": 12.5,
                "area_hectares": 5.06,
                "soil_type": "Deep Indo-Gangetic Alluvial Loam (High Retention)",
                "valve_status": 0,  # 0 = OFF, 1 = ON
                "manual_override": False,
                "flow_rate_lpm": 140.0,
                "dispensed_liters_today": 3250.0,
                "target_moisture_min": 0.38,
                "target_moisture_max": 0.75,
                "valve_health": 99.2,
                "solenoid_voltage_v": 24.1,
                "motor_current_a": 11.2,
                "last_cycle_start": datetime.now(timezone.utc).isoformat(),
                "sensor_indices": [0, 1, 2, 3, 4, 5, 6],
                "ai_confidence": 0.89,
                "ai_decision": "Standby - Alluvial Rootzone Moisture Optimal for Basmati Tillering"
            },
            {
                "id": 1,
                "code": "ZONE-02-HORTI",
                "name": "Pomegranate & Drip Vineyard Block",
                "sector": "Sector B-3 (Deccan Semi-Arid Plateau)",
                "crop": "Bhagwa Pomegranate & Export Seedless Grapes",
                "area_acres": 8.2,
                "area_hectares": 3.32,
                "soil_type": "Black Cotton Soil / Regur (High Swelling Clay)",
                "valve_status": 0,
                "manual_override": False,
                "flow_rate_lpm": 90.0,
                "dispensed_liters_today": 1820.0,
                "target_moisture_min": 0.30,
                "target_moisture_max": 0.55,
                "valve_health": 98.6,
                "solenoid_voltage_v": 23.9,
                "motor_current_a": 9.8,
                "last_cycle_start": datetime.now(timezone.utc).isoformat(),
                "sensor_indices": [7, 8, 9, 10, 11, 12, 13],
                "ai_confidence": 0.94,
                "ai_decision": "Standby - Regulated Deficit Irrigation Target Maintained for Fruit Sweetness"
            },
            {
                "id": 2,
                "code": "ZONE-03-COTTON",
                "name": "Bt Cotton & Groundnut Rain-Gun Zone",
                "sector": "Sector C-2 (Southern Peninsular Zone)",
                "crop": "Bt Cotton (Bollgard II) & High-Yield Groundnut",
                "area_acres": 18.0,
                "area_hectares": 7.28,
                "soil_type": "Red Sandy Loam / Alfisol (Rapid Percolation)",
                "valve_status": 0,
                "manual_override": False,
                "flow_rate_lpm": 250.0,
                "dispensed_liters_today": 3380.0,
                "target_moisture_min": 0.35,
                "target_moisture_max": 0.68,
                "valve_health": 96.4,
                "solenoid_voltage_v": 24.2,
                "motor_current_a": 12.1,
                "last_cycle_start": datetime.now(timezone.utc).isoformat(),
                "sensor_indices": [14, 15, 16, 17, 18, 19],
                "ai_confidence": 0.85,
                "ai_decision": "Standby - Sub-surface Moisture Buffer Adequate for Boll Development"
            }
        ]

        # 20 Soil Moisture & Agronomic Sensors (0.0 to 1.0 scaled)
        self.sensors: List[Dict[str, Any]] = []
        depths = [15, 30, 45, 60]  # cm (Surface, Upper Rootzone, Active Rootzone, Sub-soil percolation)
        probe_locations = [
            "Paddy SRI Plot S1", "Paddy SRI Plot S2", "Sugarcane Trench T1", "Sugarcane Trench T2",
            "Borewell Recharge Infiltration", "Alluvial Sub-plot A5", "Canal Lateral Inlet",
            "Pomegranate Row R1", "Pomegranate Row R2", "Pomegranate Rootzone", "Drip Line Vineyard V1",
            "Vineyard Lateral V2", "Black Cotton Soil Node", "Deccan Horticultural Sensor",
            "Cotton Bollgard Sector C1", "Cotton Rootzone C2", "Groundnut Furrow G1",
            "Groundnut Pod Depth G2", "Red Soil Lateral Perimeter", "Deep Drainage Monitor"
        ]

        for i in range(20):
            assigned_parcel = 0 if i <= 6 else (1 if i <= 13 else 2)
            base_val = 0.46 + ((i * 7) % 17) * 0.015 - 0.04
            base_val = max(0.20, min(0.78, round(base_val, 3)))
            self.sensors.append({
                "id": i,
                "tag": f"IN-SNSR-{i:02d}",
                "name": f"Krishi Probe #{i:02d} ({probe_locations[i]})",
                "parcel_id": assigned_parcel,
                "parcel_name": self.parcels[assigned_parcel]["name"],
                "value": base_val,
                "depth_cm": depths[i % len(depths)],
                "temperature_c": round(26.8 + (i % 5) * 0.8, 1),
                "salinity_ec": round(0.75 + (i % 4) * 0.12, 2),  # dS/m (Indian soil salinity threshold)
                "battery_pct": int(91 + (i % 9)),
                "rssi_dbm": int(-64 - (i % 14)),
                "status": "ONLINE",
                "last_reading": datetime.now(timezone.utc).isoformat()
            })

        # History buffer for Indian dashboard charts
        self.history: List[Dict[str, Any]] = []
        self._init_history()

        # Audit logs
        self.logs: List[Dict[str, Any]] = []
        self.add_log(
            category="SYSTEM",
            severity="INFO",
            message="AegisCrop Krishi™ OS v2.4 initialized. Connected to 20 In-situ IoT Probes and 3-Phase DISCOM Power Feeder."
        )
        self.add_log(
            category="POWER_GRID",
            severity="SUCCESS",
            message="3-Phase 415V Agricultural Bus Synchronized. PM-KUSUM 5.5kW Solar Array generating 4.85 kW."
        )
        self.add_log(
            category="AI_ENGINE",
            severity="INFO",
            message="Farm_Irrigation_System.pkl Scikit-Learn Random Forest armed for multi-parcel actuation."
        )

        # Indian Agricultural Irrigation Schedules (optimized for off-peak DISCOM power & dawn evapotranspiration)
        self.schedules = [
            {
                "id": 1,
                "name": "Brahma Muhurta (Dawn) Basmati & Sugarcane Soak",
                "parcel_ids": [0],
                "time_window": "04:00 - 05:30 IST",
                "status": "ARMED",
                "smart_weather_skip": True,
                "max_duration_min": 50,
                "days": ["Mon", "Wed", "Fri", "Sun"],
                "power_source": "Off-Peak DISCOM Night Tariff (₹3.50/unit)"
            },
            {
                "id": 2,
                "name": "PM-KUSUM Solar Window Horticulture Drip",
                "parcel_ids": [1],
                "time_window": "11:30 - 13:00 IST",
                "status": "ACTIVE_CONDITIONAL",
                "smart_weather_skip": True,
                "max_duration_min": 35,
                "days": ["Daily"],
                "power_source": "100% PM-KUSUM Solar Generation (Zero Grid Cost)"
            },
            {
                "id": 3,
                "name": "Godhuli (Dusk) Bt Cotton Pulse Cycle",
                "parcel_ids": [2],
                "time_window": "18:00 - 19:15 IST",
                "status": "ARMED",
                "smart_weather_skip": True,
                "max_duration_min": 45,
                "days": ["Tue", "Thu", "Sat"],
                "power_source": "Solar Battery + Normal Grid"
            }
        ]

    def _init_history(self):
        now = time.time()
        for i in range(25):
            t = now - (25 - i) * 60
            self.history.append({
                "timestamp": datetime.fromtimestamp(t, tz=timezone.utc).strftime("%H:%M"),
                "parcel_0_moisture": round(0.52 + 0.02 * ((i % 5) - 2), 3),
                "parcel_1_moisture": round(0.44 + 0.025 * ((i % 4) - 2), 3),
                "parcel_2_moisture": round(0.48 + 0.03 * ((i % 6) - 3), 3),
                "total_flow_lpm": 0.0 if i < 18 else 140.0,
                "power_draw_kw": 0.0 if i < 18 else 5.8,
                "avg_moisture": round(0.48 + 0.015 * ((i % 3) - 1), 3)
            })

    def add_log(self, category: str, severity: str, message: str):
        log_entry = {
            "id": len(self.logs) + 1,
            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S IST"),
            "category": category,
            "severity": severity,
            "message": message
        }
        self.logs.insert(0, log_entry)
        if len(self.logs) > 150:
            self.logs.pop()

    def get_sensor_values(self) -> List[float]:
        return [s["value"] for s in self.sensors]

    def set_sensor_value(self, sensor_id: int, value: float):
        if 0 <= sensor_id < len(self.sensors):
            clamped = max(0.0, min(1.0, float(round(value, 3))))
            self.sensors[sensor_id]["value"] = clamped
            self.sensors[sensor_id]["last_reading"] = datetime.now(timezone.utc).isoformat()

    def apply_scenario(self, scenario_name: str):
        """Authentic Indian Agro-Climatic scenarios."""
        if scenario_name == "NORTH_WEST_HEATWAVE":
            for s in self.sensors:
                s["value"] = round(0.14 + (s["id"] % 5) * 0.025, 3)
            self.add_log("SCENARIO", "CRITICAL", "Scenario Applied: 42°C Pre-Monsoon Loo Heatwave. High crop moisture stress detected.")
        elif scenario_name == "MONSOON_CLOUDBURST":
            for s in self.sensors:
                s["value"] = round(0.82 + (s["id"] % 4) * 0.03, 3)
            self.add_log("SCENARIO", "SUCCESS", "Scenario Applied: 65mm Active Monsoon Influx. Soils at full field capacity; valves suppressed.")
        elif scenario_name == "POMEGRANATE_DEFICIT":
            for s in self.sensors:
                if s["parcel_id"] == 1:
                    s["value"] = round(0.18 + (s["id"] % 3) * 0.02, 3)
                else:
                    s["value"] = round(0.56 + (s["id"] % 4) * 0.025, 3)
            self.add_log("SCENARIO", "WARNING", "Scenario Applied: Targeted Deccan Horticultural Deficit. Initiating fruit-sizing pulse.")
        elif scenario_name == "OPTIMAL_RABI_EQUILIBRIUM":
            for s in self.sensors:
                s["value"] = round(0.50 + ((s["id"] * 3) % 7) * 0.02, 3)
            self.add_log("SCENARIO", "SUCCESS", "Scenario Applied: Optimal Rabi Season Equilibrium restored.")

system_state = IrrigationState()
