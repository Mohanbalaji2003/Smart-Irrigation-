import React, { useState } from 'react';
import { Activity, TrendingUp, Layers, Droplet } from 'lucide-react';
import { TelemetryPoint } from '../types';

interface TelemetryChartProps {
  history: TelemetryPoint[];
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ history }) => {
  const [metricMode, setMetricMode] = useState<'MOISTURE' | 'FLOW'>('MOISTURE');

  if (!history || history.length < 2) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-center py-12 text-slate-400">
        <Activity className="w-6 h-6 mx-auto mb-2 text-slate-500 animate-spin" />
        <p className="text-xs">Buffering live telemetry stream...</p>
      </div>
    );
  }

  // Generate SVG path for multi-line charts
  const width = 800;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const pointsCount = history.length;

  const getX = (index: number) => padding.left + (index / (pointsCount - 1)) * chartW;

  // For Moisture: Y scale is 0.0 to 1.0 (0% to 100%)
  const getYMoisture = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    return padding.top + chartH - clamped * chartH;
  };

  // For Flow: Y scale 0 to 400 L/min
  const maxFlow = 350;
  const getYFlow = (val: number) => {
    const clamped = Math.max(0, Math.min(maxFlow, val));
    return padding.top + chartH - (clamped / maxFlow) * chartH;
  };

  // Path generators
  const makePath = (accessor: (p: TelemetryPoint) => number, getY: (val: number) => number) => {
    return history.reduce((acc, p, idx) => {
      const x = getX(idx);
      const y = getY(accessor(p));
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  const p0Path = makePath(p => p.parcel_0_moisture, getYMoisture);
  const p1Path = makePath(p => p.parcel_1_moisture, getYMoisture);
  const p2Path = makePath(p => p.parcel_2_moisture, getYMoisture);
  const flowPath = makePath(p => p.total_flow_lpm, getYFlow);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
      {/* Chart Title and Series Toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Real-time Telemetry & Infiltration Dynamics
          </h3>
          <p className="text-xs text-slate-400">
            Rolling time-series tracking zone moisture absorption against solenoid actuation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-slate-300 mr-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Orchard (P0)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Vineyard (P1)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              Valley (P2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Flow Rate (L/min)
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map(fraction => {
            const y = padding.top + chartH - fraction * chartH;
            return (
              <g key={fraction}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {Math.round(fraction * 100)}%
                </text>
              </g>
            );
          })}

          {/* Shaded Optimal Moisture Target Band (35% to 65%) */}
          <rect
            x={padding.left}
            y={getYMoisture(0.65)}
            width={chartW}
            height={getYMoisture(0.35) - getYMoisture(0.65)}
            fill="#10b981"
            fillOpacity="0.04"
          />

          {/* Lines */}
          <path d={p0Path} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
          <path d={p1Path} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <path d={p2Path} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Secondary Axis: Total Flow Rate */}
          <path 
            d={flowPath} 
            fill="none" 
            stroke="#22d3ee" 
            strokeWidth="1.8" 
            strokeDasharray="5 3" 
            strokeLinecap="round" 
            opacity="0.8" 
          />

          {/* Time ticks on X axis */}
          {history.filter((_, i) => i % Math.max(1, Math.floor(pointsCount / 6)) === 0).map((pt, i, arr) => {
            const idx = history.indexOf(pt);
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={height - 8}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {pt.timestamp}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
