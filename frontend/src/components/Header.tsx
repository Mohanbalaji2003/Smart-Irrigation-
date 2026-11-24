import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Cpu, 
  Sliders, 
  Sun, 
  AlertOctagon, 
  Activity, 
  Play, 
  Pause, 
  FlaskConical, 
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { SystemStatus } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  onSetMode: (mode: 'AI_AUTONOMOUS' | 'MANUAL_OVERRIDE' | 'WEATHER_ECO') => void;
  onEmergencyStop: () => void;
  onToggleSimulation: () => void;
  onOpenDiagnostics: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onSetMode,
  onEmergencyStop,
  onToggleSimulation,
  onOpenDiagnostics
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const mode = status?.mode || 'AI_AUTONOMOUS';
  const isEmergency = status?.emergency_stop || false;
  const isSimulating = status?.simulation_active ?? true;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand & ICAR/IMD Agromet Node */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 shadow-lg shadow-emerald-950/50 text-white font-bold">
            <Droplet className="w-5 h-5 text-white animate-pulse-slow" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base text-slate-100 flex items-center gap-1.5">
                AegisCrop<span className="text-emerald-400 font-black">Krishi™</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  ICAR / IMD Agromet Integrated
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Deccan-Gangetic Agronet #412
              </span>
              <span>•</span>
              <span className="font-mono text-emerald-300 font-medium">{timeStr} IST</span>
              <span>•</span>
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3 text-amber-400" />
                415V 3-Phase 50Hz
              </span>
            </div>
          </div>
        </div>

        {/* Center: Operating Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSetMode('AI_AUTONOMOUS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'AI_AUTONOMOUS'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Random Forest multi-parcel autonomous activation"
          >
            <Cpu className="w-3.5 h-3.5" />
            Autonomous AI
          </button>

          <button
            onClick={() => onSetMode('MANUAL_OVERRIDE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'MANUAL_OVERRIDE'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Direct engineer manual valve override"
          >
            <Sliders className="w-3.5 h-3.5" />
            Manual Override
          </button>

          <button
            onClick={() => onSetMode('WEATHER_ECO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'WEATHER_ECO'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="IMD monsoon & evapotranspiration-optimized retention"
          >
            <Sun className="w-3.5 h-3.5" />
            IMD Weather-Eco
          </button>
        </div>

        {/* Right: Actions, Simulation, Emergency Stop */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Simulation Toggle */}
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              isSimulating
                ? 'bg-slate-800/90 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-900 border-amber-500/30 text-amber-400 hover:bg-slate-800'
            }`}
            title={isSimulating ? 'Pause IoT sensor physics simulation' : 'Resume IoT sensor physics simulation'}
          >
            {isSimulating ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Sim: ACTIVE</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Sim: PAUSED</span>
              </>
            )}
          </button>

          {/* AI Diagnostics Modal Button */}
          <button
            onClick={onOpenDiagnostics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Lab</span>
          </button>

          {/* Emergency Stop Cut-off */}
          <button
            onClick={onEmergencyStop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
              isEmergency
                ? 'bg-red-600 text-white border-red-500 animate-bounce shadow-lg shadow-red-900/50'
                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{isEmergency ? 'HALTED (DISENGAGE)' : 'EMERGENCY SHUTOFF'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
