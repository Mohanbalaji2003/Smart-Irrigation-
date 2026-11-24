import { 
  SystemStatus, 
  Parcel, 
  Sensor, 
  WeatherCondition, 
  ForecastDay, 
  TelemetryPoint, 
  LogEntry, 
  Schedule, 
  MLModelInfo, 
  PredictionResult 
} from '../types';

const API_BASE = '/api';

export const api = {
  async getStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  async setMode(mode: 'AI_AUTONOMOUS' | 'MANUAL_OVERRIDE' | 'WEATHER_ECO'): Promise<{ status: string; mode: string }> {
    const res = await fetch(`${API_BASE}/system/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    if (!res.ok) throw new Error('Failed to update system mode');
    return res.json();
  },

  async toggleEmergencyStop(): Promise<{ emergency_stop: boolean }> {
    const res = await fetch(`${API_BASE}/system/emergency-stop`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle emergency stop');
    return res.json();
  },

  async toggleSimulation(): Promise<{ simulation_active: boolean }> {
    const res = await fetch(`${API_BASE}/system/simulation-toggle`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle simulation');
    return res.json();
  },

  async applyScenario(scenario: string): Promise<any> {
    const res = await fetch(`${API_BASE}/system/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    if (!res.ok) throw new Error('Failed to apply scenario');
    return res.json();
  },

  async setParcelValve(parcelId: number, status: number): Promise<{ status: string; parcel: Parcel }> {
    const res = await fetch(`${API_BASE}/parcels/${parcelId}/valve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to control valve');
    return res.json();
  },

  async updateSensor(sensorId: number, value: number): Promise<{ status: string; sensor: Sensor }> {
    const res = await fetch(`${API_BASE}/sensors/${sensorId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    if (!res.ok) throw new Error('Failed to update sensor');
    return res.json();
  },

  async predict(sensorValues: number[]): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sensor_values: sensorValues })
    });
    if (!res.ok) throw new Error('Model inference failed');
    return res.json();
  },

  async getMLInfo(): Promise<MLModelInfo> {
    const res = await fetch(`${API_BASE}/ml/info`);
    if (!res.ok) throw new Error('Failed to load ML info');
    return res.json();
  },

  async getWeather(): Promise<{ current: WeatherCondition; forecast: ForecastDay[] }> {
    const res = await fetch(`${API_BASE}/weather`);
    if (!res.ok) throw new Error('Failed to load weather');
    return res.json();
  },

  async getHistory(): Promise<{ data_points: TelemetryPoint[]; total_water_liters: number; water_saved_vs_baseline_pct: number }> {
    const res = await fetch(`${API_BASE}/analytics/history`);
    if (!res.ok) throw new Error('Failed to load history');
    return res.json();
  },

  async getSchedules(): Promise<Schedule[]> {
    const res = await fetch(`${API_BASE}/schedules`);
    if (!res.ok) throw new Error('Failed to load schedules');
    return res.json();
  },

  async addSchedule(schedule: Omit<Schedule, 'id' | 'status'>): Promise<{ status: string; schedule: Schedule }> {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    if (!res.ok) throw new Error('Failed to add schedule');
    return res.json();
  },

  async getLogs(): Promise<LogEntry[]> {
    const res = await fetch(`${API_BASE}/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },

  downloadAuditReport(): void {
    window.open(`${API_BASE}/analytics/export-csv`, '_blank');
  }
};
