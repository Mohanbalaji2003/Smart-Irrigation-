import React from 'react';
import { MapPin, Droplet, Radio, Wind, Sparkles, Zap } from 'lucide-react';
import { Parcel, Sensor } from '../types';

interface FarmMapProps {
  parcels: Parcel[];
  sensors: Sensor[];
  selectedParcelId: number | null;
  onSelectParcel: (id: number) => void;
}

export const FarmMap: React.FC<FarmMapProps> = ({
  parcels,
  sensors,
  selectedParcelId,
  onSelectParcel
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Geospatial Farm Zone Schematic • Indian Precision Agronet
          </h3>
          <p className="text-xs text-slate-400">
            Plot boundaries, 7.5 HP Submersible Borewell Station, PM-KUSUM Solar Feeder & in-situ probe coordinates
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            Sprinkler Energized
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Optimal VWC
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Water Deficit
          </span>
        </div>
      </div>

      {/* Farm Grid Schematic SVG & Interactive Zones */}
      <div className="relative w-full aspect-[21/9] min-h-[260px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col md:flex-row p-4 gap-4">
        {/* Farm Background Grid Texture */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Visual Parcels */}
        {parcels.map((p) => {
          const isSelected = selectedParcelId === p.id;
          const isActive = p.valve_status === 1;
          const parcelSensors = sensors.filter(s => p.sensor_indices.includes(s.id));

          return (
            <div
              key={p.id}
              onClick={() => onSelectParcel(p.id)}
              className={`relative flex-1 rounded-xl p-4 cursor-pointer transition-all border flex flex-col justify-between ${
                isActive
                  ? 'bg-emerald-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              } ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
            >
              {/* Parcel Header info */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {p.code}
                  </span>
                  <h4 className="font-bold text-white text-sm mt-1">{p.name}</h4>
                  <span className="text-xs text-slate-400">{p.crop} ({p.area_acres || 10} Acres)</span>
                </div>

                {isActive && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono animate-pulse font-semibold">
                    <Droplet className="w-3 h-3 text-cyan-400" />
                    IRRIGATING
                  </div>
                )}
              </div>

              {/* Visual Sprinkler Spray Effect */}
              <div className="relative my-4 flex items-center justify-center h-24">
                {isActive ? (
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-28 h-28 rounded-full border border-cyan-400/40 bg-cyan-500/10 animate-ping" />
                    <div className="absolute w-20 h-20 rounded-full border border-teal-300/60 bg-teal-500/15 animate-pulse" />
                    <div className="relative w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50 font-bold z-10">
                      <Droplet className="w-5 h-5 text-slate-950" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Sensor Node Dots on Parcel */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Soil Probes ({parcelSensors.length})</span>
                  <span className="font-mono text-slate-300">{p.soil_type.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {parcelSensors.map(s => {
                    let dotColor = 'bg-emerald-500';
                    if (s.value < 0.35) dotColor = 'bg-rose-500 animate-pulse';
                    else if (s.value > 0.70) dotColor = 'bg-sky-400';
                    return (
                      <span
                        key={s.id}
                        className={`w-2.5 h-2.5 rounded-full ${dotColor} transition-all`}
                        title={`${s.name}: ${Math.round(s.value * 100)}% VWC`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
