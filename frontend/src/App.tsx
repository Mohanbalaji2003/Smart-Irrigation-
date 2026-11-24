import React, { useState, useEffect, useCallback } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  KPIRibbon 
} from './components/KPIRibbon';
import { 
  PowerStationPanel 
} from './components/PowerStationPanel';
import { 
  FarmMap 
} from './components/FarmMap';
import { 
  ParcelCard 
} from './components/ParcelCard';
import { 
  SensorMatrix 
} from './components/SensorMatrix';
import { 
  TelemetryChart 
} from './components/TelemetryChart';
import { 
  WeatherWidget 
} from './components/WeatherWidget';
import { 
  ScheduleManager 
} from './components/ScheduleManager';
import { 
  AuditLog 
} from './components/AuditLog';
import { 
  QuickScenarios 
} from './components/QuickScenarios';
import { 
  ModelDiagnosticsModal 
} from './components/ModelDiagnosticsModal';
import { 
  SystemStatus, 
  WeatherCondition, 
  ForecastDay, 
  TelemetryPoint, 
  LogEntry, 
  Schedule, 
  MLModelInfo 
} from './types';
import { api } from './services/api';

export function App() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [weatherCurrent, setWeatherCurrent] = useState<WeatherCondition | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<ForecastDay[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [mlInfo, setMlInfo] = useState<MLModelInfo | null>(null);
  
  const [selectedParcelId, setSelectedParcelId] = useState<number | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll system status and telemetry every 2.5s
  const fetchTelemetry = useCallback(async () => {
    try {
      const [sysStatus, histRes, sysLogs] = await Promise.all([
        api.getStatus(),
        api.getHistory(),
        api.getLogs()
      ]);
      setStatus(sysStatus);
      setHistory(histRes.data_points);
      setLogs(sysLogs);
      setError(null);
    } catch (err: any) {
      console.warn('Telemetry fetch error:', err.message);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTelemetry();
    
    api.getWeather().then(w => {
      setWeatherCurrent(w.current);
      setWeatherForecast(w.forecast);
    }).catch(console.error);

    api.getMLInfo().then(setMlInfo).catch(console.error);
    api.getSchedules().then(setSchedules).catch(console.error);

    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Actions
  const handleSetMode = async (mode: 'AI_AUTONOMOUS' | 'MANUAL_OVERRIDE' | 'WEATHER_ECO') => {
    try {
      await api.setMode(mode);
      fetchTelemetry();
    } catch (err: any) {
      alert(`Error setting mode: ${err.message}`);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await api.toggleEmergencyStop();
      fetchTelemetry();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleSimulation = async () => {
    try {
      await api.toggleSimulation();
      fetchTelemetry();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleValve = async (parcelId: number, currentStatus: number) => {
    try {
      const nextStatus = currentStatus === 1 ? 0 : 1;
      await api.setParcelValve(parcelId, nextStatus);
      fetchTelemetry();
    } catch (err: any) {
      alert(`Valve actuation failed: ${err.message}`);
    }
  };

  const handleUpdateSensor = async (sensorId: number, value: number) => {
    try {
      if (status) {
        const updatedSensors = [...status.sensors];
        updatedSensors[sensorId] = { ...updatedSensors[sensorId], value };
        setStatus({ ...status, sensors: updatedSensors });
      }
      await api.updateSensor(sensorId, value);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleApplyScenario = async (scenario: string) => {
    try {
      await api.applyScenario(scenario);
      fetchTelemetry();
    } catch (err: any) {
      alert(`Failed to apply scenario: ${err.message}`);
    }
  };

  const handleAddSchedule = async (schedule: Omit<Schedule, 'id' | 'status'>) => {
    try {
      await api.addSchedule(schedule);
      const updated = await api.getSchedules();
      setSchedules(updated);
    } catch (err: any) {
      alert(`Failed to add schedule: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Corporate Navigation */}
      <Header
        status={status}
        onSetMode={handleSetMode}
        onEmergencyStop={handleEmergencyStop}
        onToggleSimulation={handleToggleSimulation}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Top Agronomic & Financial KPI Ribbon */}
        <KPIRibbon status={status} />

        {/* 3-Phase Agricultural Power & PM-KUSUM Solar Feeder Panel */}
        {status?.power_telemetry && (
          <PowerStationPanel
            power={status.power_telemetry}
            rupeesSaved={status.rupees_saved_today}
            solarKw={status.solar_generation_kw}
          />
        )}

        {/* Geospatial Farm Zone Overview */}
        {status && (
          <FarmMap
            parcels={status.parcels}
            sensors={status.sensors}
            selectedParcelId={selectedParcelId}
            onSelectParcel={setSelectedParcelId}
          />
        )}

        {/* 3 Core Commercial Parcel Cards */}
        {status && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white tracking-tight">
                Active Irrigation Parcels & Solenoid Status
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Multi-Output Inference Active (3 Parcels / 20 Sensors)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {status.parcels.map(parcel => (
                <ParcelCard
                  key={parcel.id}
                  parcel={parcel}
                  sensors={status.sensors}
                  isEmergency={status.emergency_stop}
                  onToggleValve={handleToggleValve}
                />
              ))}
            </div>
          </div>
        )}

        {/* Agronomic Scenario Stress Lab */}
        <QuickScenarios onApplyScenario={handleApplyScenario} />

        {/* Dual Column Layout: Left (Charts & Sensor Matrix), Right (Weather, Schedules, Audit) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 cols): Real-time Telemetry Graph & 20-Sensor Matrix */}
          <div className="lg:col-span-7 space-y-6">
            <TelemetryChart history={history} />
            
            {status && (
              <SensorMatrix
                sensors={status.sensors}
                onUpdateSensor={handleUpdateSensor}
              />
            )}
          </div>

          {/* Right Column (5 cols): Weather Station, Schedules, Audit Log */}
          <div className="lg:col-span-5 space-y-6">
            <WeatherWidget
              current={weatherCurrent}
              forecast={weatherForecast}
            />

            {status && (
              <ScheduleManager
                schedules={schedules}
                parcels={status.parcels}
                onAddSchedule={handleAddSchedule}
              />
            )}

            <AuditLog logs={logs} />
          </div>

        </div>

      </main>

      {/* AI Explainability & Diagnostic Sandbox Modal */}
      {status && (
        <ModelDiagnosticsModal
          isOpen={isDiagnosticsOpen}
          onClose={() => setIsDiagnosticsOpen(false)}
          mlInfo={mlInfo}
          currentSensors={status.sensors}
        />
      )}

      {/* Corporate Platform Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 lg:px-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AegisCrop Krishi™ OS</span>
            <span>•</span>
            <span>Indian Precision Agritech Platform</span>
            <span>•</span>
            <span className="text-emerald-500 font-mono">Backend API: ONLINE (Port 8000)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>IMD Agromet GKMS Node #412</span>
            <span>•</span>
            <span>PM-KUSUM 5.5kW Solar Integrated</span>
            <span>•</span>
            <span>v2.5.0-Bharat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
