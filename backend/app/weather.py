from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

class WeatherService:
    def __init__(self):
        self.station_name = "IMD Agromet Agro-Meteorological Station (DAMU Node #412)"
        self.location = "Indo-Gangetic & Deccan Precision Agricultural Zone (Tamil Nadu / Maharashtra / Punjab Agro-Climatic Hub)"
        self.elevation_m = 320
        self.agro_zone = "Zone VI - Trans-Gangetic & Southern Plateau Semi-Arid"

    def get_current_conditions(self) -> Dict[str, Any]:
        return {
            "station": self.station_name,
            "location": self.location,
            "elevation_m": self.elevation_m,
            "agro_zone": self.agro_zone,
            "season": "Rabi / Zaid Inter-season Precision Cycle",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "temperature_c": 31.8,
            "temperature_f": 89.2,
            "relative_humidity_pct": 54.0,
            "wind_speed_kmh": 11.2,
            "wind_gust_kmh": 16.5,
            "wind_direction": "ENE (Monsoon Drift)",
            "solar_radiation_wm2": 825.0,
            "uv_index": 8.4,
            "evapotranspiration_et0_mm_day": 5.8,
            "dew_point_c": 19.4,
            "barometric_pressure_hpa": 1011.8,
            "rain_today_mm": 0.0,
            "precipitation_probability_pct": 15,
            "smart_irrigation_recommendation": "OPTIMAL_CONDITIONS - Normal Micro-Irrigation Permitted",
            "kisan_advisory": (
                "IMD Gramin Krishi Mausam Seva (GKMS) Advisory: Basmati Rice & Sugarcane rootzones "
                "currently maintain 48% Volumetric Water Content. High solar irradiance (825 W/m²) "
                "is driving 5.8 mm/day evapotranspiration. Moderate irrigation cycles recommended; "
                "withhold flood cycles as convective thunder-cells are detected for Thursday."
            )
        }

    def get_forecast(self) -> List[Dict[str, Any]]:
        today = datetime.now(timezone.utc)
        forecast_days = []
        days_meta = [
            ("Today", 32.5, 21.0, 52, 15, 5.8, "Clear & Sunny (Tropical)", "Regular Drip Pulse for Basmati & Drip Orchard"),
            ("Tomorrow", 33.8, 22.2, 48, 10, 6.2, "Hot & Dry (High Evap)", "+15% Micro-irrigation pulse recommended"),
            ("Wednesday", 31.0, 20.5, 68, 45, 4.2, "Humid with Convective Clouds", "Pre-irrigate Pomegranate; Monitor Rain Radar"),
            ("Thursday", 26.5, 18.0, 85, 80, 1.8, "Heavy Thunderstorm (42mm Rain)", "SMART SKIP ARMED: Suspend All Pumping Cycles"),
            ("Friday", 28.2, 19.4, 74, 25, 3.4, "Post-Rain Clearing", "Soak Buffer Active - Natural Field Capacity")
        ]
        for idx, (label, high, low, humidity, rain_pct, et0, condition, advice) in enumerate(days_meta):
            forecast_days.append({
                "day_offset": idx,
                "label": label,
                "date": (today + timedelta(days=idx)).strftime("%b %d"),
                "temp_high_c": high,
                "temp_low_c": low,
                "relative_humidity_pct": humidity,
                "precipitation_probability_pct": rain_pct,
                "et0_mm": et0,
                "condition": condition,
                "agronomic_advice": advice
            })
        return forecast_days

weather_service = WeatherService()
