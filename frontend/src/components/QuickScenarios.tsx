import React from 'react';
import { Sparkles, Flame, CloudRain, Trees, Scale } from 'lucide-react';

interface QuickScenariosProps {
  onApplyScenario: (scenario: string) => void;
}

export const QuickScenarios: React.FC<QuickScenariosProps> = ({ onApplyScenario }) => {
  const scenarios = [
    {
      id: 'NORTH_WEST_HEATWAVE',
      name: '42°C Pre-Monsoon Loo Heatwave',
      description: 'Severe heatwave stress. Moisture drops to 14-18%. Evaluates emergency multi-parcel pump activation.',
      icon: Flame,
      color: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400',
      badge: 'Loo Stress Test'
    },
    {
      id: 'MONSOON_CLOUDBURST',
      name: '65mm Monsoon Influx',
      description: 'Tropical cloudburst saturates rootzones to 85%. Verifies automatic solenoid valve shutdown.',
      icon: CloudRain,
      color: 'hover:border-sky-500/50 hover:bg-sky-500/10 text-sky-400',
      badge: 'Monsoon Protection'
    },
    {
      id: 'POMEGRANATE_DEFICIT',
      name: 'Deccan Horticultural Deficit',
      description: 'Pomegranate & Vineyard probes drop below 20%, triggering micro-irrigation fruit sizing pulse.',
      icon: Trees,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400',
      badge: 'Horticulture Drip'
    },
    {
      id: 'OPTIMAL_RABI_EQUILIBRIUM',
      name: 'Rabi Season Baseline',
      description: 'Restores all 20 Krishi probes to target agronomic balance (50-55% VWC) for winter crops.',
      icon: Scale,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
      badge: 'Rabi Nominal'
    }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Indian Agro-Climatic Scenario Stress Lab
          </h3>
          <p className="text-xs text-slate-400">
            Inject authentic Indian monsoon and climate profiles to evaluate Scikit-Learn multi-parcel inference in real time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map(sc => {
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              onClick={() => onApplyScenario(sc.id)}
              className={`p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 text-left transition-all ${sc.color} group`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {sc.badge}
                </span>
              </div>
              <h4 className="font-bold text-white text-xs mb-1 group-hover:text-emerald-300 transition-colors">
                {sc.name}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                {sc.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
