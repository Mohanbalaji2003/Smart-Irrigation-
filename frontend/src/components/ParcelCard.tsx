import React from 'react';
import { 
  Droplet, 
  Power, 
  Activity, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Gauge
} from 'lucide-react';
import { Parcel, Sensor } from '../types';

interface ParcelCardProps {
  parcel: Parcel;
  sensors: Sensor[];
  isEmergency: boolean;
  onToggleValve: (parcelId: number, currentStatus: number) => void;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({
  parcel,
  sensors,
  isEmergency,
  onToggleValve
}) => {
  const isOn = parcel.valve_status === 1;
  const isPending = isEmergency;

  const parcelSensors = sensors.filter(s => parcel.sensor_indices.includes(s.id));
  const avgMoistureVal = parcelSensors.length > 0 
    ? parcelSensors.reduce((acc, s) => acc + s.value, 0) / parcelSensors.length 
    : 0.5;
  const avgMoisturePct = Math.round(avgMoistureVal * 100);

  let statusBadge = { label: 'Optimal Reserve', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  if (avgMoistureVal < parcel.target_moisture_min) {
    statusBadge = { label: 'Rootzone Deficit', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  } else if (avgMoistureVal > parcel.target_moisture_max) {
    statusBadge = { label: 'Field Capacity', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
  }

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl p-5 border flex flex-col justify-between transition-all ${
      isOn 
        ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/40 bg-slate-900/90' 
        : 'border-slate-800/80 bg-slate-900/60'
    }`}>
      {/* Top Header: Code, Title, Solenoid State */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {parcel.code}
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1">
              {parcel.name}
            </h3>
            <p className="text-xs text-slate-400">
              {parcel.crop} • {parcel.area_acres || 10} Acres ({parcel.area_hectares} Ha)
            </p>
          </div>

          {/* Solenoid Toggle Switch */}
          <button
            onClick={() => onToggleValve(parcel.id, parcel.valve_status)}
            disabled={isPending}
            className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isOn
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-cyan-500/25 hover:from-cyan-400 hover:to-emerald-400'
                : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-750 hover:text-white'
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isOn ? 'Click to deactivate valve' : 'Click to manually energize solenoid'}
          >
            <Power className={`w-3.5 h-3.5 ${isOn ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'}`} />
            <span>{isOn ? 'VALVE ON' : 'VALVE OFF'}</span>
          </button>
        </div>

        {/* Dynamic Water & Motor Current Animation */}
        <div className={`mt-3 p-3 rounded-xl border transition-all ${
          isOn 
            ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200' 
            : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Droplet className={`w-3.5 h-3.5 ${isOn ? 'text-cyan-400 animate-bounce' : 'text-slate-500'}`} />
              Drip Flow Rate:
            </span>
            <span className="font-mono font-bold text-white text-sm">
              {isOn ? parcel.flow_rate_lpm.toFixed(1) : '0.0'}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">L/min</span>
            </span>
          </div>

          {isOn && (
            <div className="mt-2 flex items-center justify-between gap-1">
              <div className="h-1.5 flex-1 bg-cyan-950 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 animate-pulse rounded-full w-full"></div>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 font-semibold px-1">
                DISPENSING ({parcel.motor_current_a || 11.2}A)
              </span>
            </div>
          )}
        </div>

        {/* Moisture Level Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              Rootzone Moisture (VWC):
            </span>
            <span className="font-mono font-bold text-slate-100">
              {avgMoisturePct}%{' '}
              <span className="text-slate-500 font-normal">
                (Target: {Math.round(parcel.target_moisture_min * 100)}%-{Math.round(parcel.target_moisture_max * 100)}%)
              </span>
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            {/* Target band indicator */}
            <div 
              className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/50"
              style={{
                left: `${parcel.target_moisture_min * 100}%`,
                width: `${(parcel.target_moisture_max - parcel.target_moisture_min) * 100}%`
              }}
              title="Agronomic Target Band"
            />
            {/* Current Level Bar */}
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                avgMoistureVal < parcel.target_moisture_min
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : avgMoistureVal > parcel.target_moisture_max
                  ? 'bg-gradient-to-r from-teal-400 to-sky-400'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, avgMoisturePct))}%` }}
            />
          </div>
        </div>

        {/* AI Rationale Box */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] leading-relaxed">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3 h-3" />
              AI Decision
            </span>
            <span className="font-mono text-slate-400">
              {Math.round(parcel.ai_confidence * 100)}% Conf.
            </span>
          </div>
          <p className="text-slate-300">
            {parcel.ai_decision}
          </p>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
        <div>
          <span className="block text-slate-500">Pumping Vol.</span>
          <span className="font-mono font-medium text-slate-200">
            {Math.round(parcel.dispensed_liters_today)} L
          </span>
        </div>
        <div>
          <span className="block text-slate-500">Motor Load</span>
          <span className="font-mono font-medium text-slate-200">
            {parcel.motor_current_a || 11.2} A
          </span>
        </div>
        <div>
          <span className="block text-slate-500">Solenoid</span>
          <span className="font-mono font-medium text-emerald-400">
            {parcel.valve_health}% OK
          </span>
        </div>
      </div>
    </div>
  );
};
