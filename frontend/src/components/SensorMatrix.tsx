import React, { useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  Battery, 
  Thermometer, 
  Sliders, 
  Layers, 
  Info,
  Check,
  RotateCcw
} from 'lucide-react';
import { Sensor } from '../types';

interface SensorMatrixProps {
  sensors: Sensor[];
  onUpdateSensor: (sensorId: number, value: number) => void;
}

export const SensorMatrix: React.FC<SensorMatrixProps> = ({
  sensors,
  onUpdateSensor
}) => {
  const [filterParcel, setFilterParcel] = useState<number | 'ALL'>('ALL');
  const [searchTag, setSearchTag] = useState<string>('');

  const filteredSensors = sensors.filter(s => {
    if (filterParcel !== 'ALL' && s.parcel_id !== filterParcel) return false;
    if (searchTag && !s.name.toLowerCase().includes(searchTag.toLowerCase()) && !s.tag.toLowerCase().includes(searchTag.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Agronomic Sensor Matrix ({sensors.length} Telemetry Probes)
          </h3>
          <p className="text-xs text-slate-400">
            Real-time in-situ soil moisture (VWC), probe depth profile, battery health, and RF signal
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterParcel('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterParcel === 'ALL'
                ? 'bg-slate-800 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Probes
          </button>
          <button
            onClick={() => setFilterParcel(0)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterParcel === 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Zone 0 (Orchard)
          </button>
          <button
            onClick={() => setFilterParcel(1)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterParcel === 1
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Zone 1 (Vineyard)
          </button>
          <button
            onClick={() => setFilterParcel(2)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterParcel === 2
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Zone 2 (Valley)
          </button>
        </div>
      </div>

      {/* Grid of Sensors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredSensors.map(sensor => {
          const pct = Math.round(sensor.value * 100);
          let moistureColor = 'text-emerald-400';
          let barBg = 'bg-emerald-500';

          if (sensor.value < 0.25) {
            moistureColor = 'text-rose-400';
            barBg = 'bg-rose-500';
          } else if (sensor.value < 0.38) {
            moistureColor = 'text-amber-400';
            barBg = 'bg-amber-400';
          } else if (sensor.value > 0.70) {
            moistureColor = 'text-sky-400';
            barBg = 'bg-sky-400';
          }

          return (
            <div
              key={sensor.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-semibold text-slate-300">
                  {sensor.tag}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {sensor.depth_cm}cm depth
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1 mb-2">
                <span className="text-xs text-slate-400 truncate max-w-[120px]" title={sensor.parcel_name}>
                  {sensor.parcel_name.split(' ')[0]}
                </span>
                <span className={`text-xl font-bold font-mono ${moistureColor}`}>
                  {pct}%
                </span>
              </div>

              {/* Slider for interactive calibration */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={sensor.value}
                  onChange={(e) => onUpdateSensor(sensor.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  title="Drag to manually calibrate sensor value"
                />
              </div>

              {/* Sensor Telemetry Stats */}
              <div className="mt-3 pt-2 border-t border-slate-900 grid grid-cols-3 gap-1 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1" title="Soil Temperature">
                  <Thermometer className="w-2.5 h-2.5 text-slate-500" />
                  {sensor.temperature_c}°C
                </span>
                <span className="flex items-center gap-1" title="Battery Level">
                  <Battery className="w-2.5 h-2.5 text-slate-500" />
                  {sensor.battery_pct}%
                </span>
                <span className="flex items-center gap-1" title="RF RSSI Signal Strength">
                  <Wifi className="w-2.5 h-2.5 text-slate-500" />
                  {sensor.rssi_dbm}dB
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
