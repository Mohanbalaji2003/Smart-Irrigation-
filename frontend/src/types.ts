export interface Parcel {
  id: number;
  code: string;
  name: string;
  sector: string;
  crop: string;
  area_acres?: number;
  area_hectares: number;
  soil_type: string;
  valve_status: number; // 0 = OFF, 1 = ON
  manual_override: boolean;
  flow_rate_lpm: number;
  dispensed_liters_today: number;
  target_moisture_min: number;
  target_moisture_max: number;
  valve_health: number;
  solenoid_voltage_v: number;
  motor_current_a?: number;
  last_cycle_start: string;
  sensor_indices: number[];
  ai_confidence: number;
  ai_decision: string;
}

export interface Sensor {
  id: number;
  tag: string;
  name: string;
  parcel_id: number;
  parcel_name: string;
  value: number; // 0.0 - 1.0
  depth_cm: number;
  temperature_c: number;
  salinity_ec: number;
  battery_pct: number;
  rssi_dbm: number;
  status: string;
  last_reading: string;
}

export interface WeatherCondition {
  station: string;
  location: string;
  elevation_m: number;
  agro_zone?: string;
  season?: string;
  updated_at: string;
  temperature_c: number;
  temperature_f: number;
  relative_humidity_pct: number;
  wind_speed_kmh: number;
  wind_gust_kmh: number;
  wind_direction: string;
  solar_radiation_wm2: number;
  uv_index: number;
  evapotranspiration_et0_mm_day: number;
  dew_point_c: number;
  barometric_pressure_hpa: number;
  rain_today_mm: number;
  precipitation_probability_pct: number;
  smart_irrigation_recommendation: string;
  kisan_advisory?: string;
}

export interface ForecastDay {
  day_offset: number;
  label: string;
  date: string;
  temp_high_c: number;
  temp_low_c: number;
  relative_humidity_pct: number;
  precipitation_probability_pct: number;
  et0_mm: number;
  condition: string;
  agronomic_advice: string;
}

export interface TelemetryPoint {
  timestamp: string;
  parcel_0_moisture: number;
  parcel_1_moisture: number;
  parcel_2_moisture: number;
  total_flow_lpm: number;
  power_draw_kw?: number;
  avg_moisture: number;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  category: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  message: string;
}

export interface Schedule {
  id: number;
  name: string;
  parcel_ids: number[];
  time_window: string;
  status: string;
  smart_weather_skip: boolean;
  max_duration_min: number;
  days: string[];
  power_source?: string;
}

export interface PowerTelemetry {
  grid_status: string;
  voltage_r_y_v: number;
  voltage_y_b_v: number;
  voltage_b_r_v: number;
  frequency_hz: number;
  pump_motor_hp: number;
  pump_motor_type: string;
  current_draw_a: number;
  power_factor: number;
  dry_run_protection: string;
  motor_temperature_c: number;
  overload_trip: boolean;
  pm_kusum_solar_active: boolean;
  solar_feed_kw: number;
}

export interface SystemStatus {
  mode: 'AI_AUTONOMOUS' | 'MANUAL_OVERRIDE' | 'WEATHER_ECO';
  emergency_stop: boolean;
  simulation_active: boolean;
  simulation_speed: number;
  total_water_consumed_liters: number;
  water_saved_vs_baseline_pct: number;
  rupees_saved_today?: number;
  solar_generation_kw?: number;
  active_valves_count: number;
  current_total_flow_lpm: number;
  average_soil_moisture: number;
  power_telemetry?: PowerTelemetry;
  parcels: Parcel[];
  sensors: Sensor[];
  weather_summary: WeatherCondition;
}

export interface MLFeatureImportance {
  sensor: string;
  sensor_id: number;
  importance: number;
}

export interface MLModelInfo {
  model_type: string;
  estimators_count: number;
  input_features: number;
  output_targets: string[];
  feature_importances: Record<string, MLFeatureImportance[]>;
  training_dataset: string;
  description: string;
}

export interface PredictionResult {
  status: string;
  input_sensor_count: number;
  predictions: number[];
  probabilities: number[];
  reasons: string[];
  top_influencers: Array<{
    parcel_id: number;
    parcel_name: string;
    status: string;
    probability_on: number;
    key_sensors: MLFeatureImportance[];
  }>;
}
