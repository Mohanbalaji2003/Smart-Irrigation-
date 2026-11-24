import React from 'react';
import { Zap, Sun, ShieldCheck, Gauge, Activity, AlertTriangle, Power } from 'lucide-react';
import { PowerTelemetry } from '../types';

interface PowerStationPanelProps {
  power?: PowerTelemetry;
  rupeesSaved?: number;
  solarKw?: number;
}

export const PowerStationPanel: React.FC<PowerStationPanelProps> = ({
  power,
  rupeesSaved = 1845,
  solarKw = 4.85
}) => {
  if (!power) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            3-Phase Agricultural Power & PM-KUSUM Solar Grid
          </h3>
          <p className="text-xs text-slate-400">
            DISCOM 415V 50Hz agricultural feeder with automated dry-run protection and solar pump telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{power.grid_status.split(' ')[0]} 415V NOMINAL</span>
        </div>
      </div>

      {/* Grid of Power Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Phase Voltages */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Phase Voltages (R-Y-B)</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-mono text-sm font-bold text-white space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">V_RY:</span>
              <span className="text-amber-300">{power.voltage_r_y_v}V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">V_YB:</span>
              <span className="text-amber-300">{power.voltage_y_b_v}V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">V_BR:</span>
              <span className="text-amber-300">{power.voltage_b_r_v}V</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">Freq: {power.frequency_hz} Hz</span>
        </div>

        {/* 7.5 HP Borewell Submersible Motor */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Borewell Pump Motor</span>
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-base font-bold font-mono text-white block">
              {power.pump_motor_hp} HP Submersible
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Current: <span className="font-mono text-cyan-300 font-bold">{power.current_draw_a} A</span> (PF: {power.power_factor})
            </p>
          </div>
          <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono">
            {power.dry_run_protection}
          </div>
        </div>

        {/* PM-KUSUM Solar Generation */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>PM-KUSUM Solar</span>
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {solarKw}
              </span>
              <span className="text-xs text-slate-400 font-sans">kW</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              5.5 kW Bifacial Photovoltaic Array
            </p>
          </div>
          <span className="text-[10px] text-amber-300/90 font-mono mt-1">
            ⚡ 82% Direct Solar Powered Pumping
          </span>
        </div>

        {/* Financial Savings in INR (₹) */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>DISCOM & Solar Savings</span>
              <span className="font-mono text-emerald-400 font-bold">₹</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                ₹{Math.round(rupeesSaved).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Saved Today vs Flood Irrigation
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Tariff Offset: ₹7.50 / unit saved
          </div>
        </div>
      </div>
    </div>
  );
};
