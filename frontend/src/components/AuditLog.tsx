import React, { useState } from 'react';
import { Activity, ShieldAlert, Cpu, Power, Filter, Terminal, Download } from 'lucide-react';
import { LogEntry } from '../types';
import { api } from '../services/api';

interface AuditLogProps {
  logs: LogEntry[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredLogs = logs.filter(l => {
    if (filterCategory === 'ALL') return true;
    return l.category === filterCategory;
  });

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Agronomic Audit & Telemetry Event Log
          </h3>
          <p className="text-xs text-slate-400">
            Chronological audit trail of valve actuations, Scikit-Learn predictions, and safety alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download CSV button */}
          <button
            onClick={() => api.downloadAuditReport()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            title="Download CSV Audit Report for Farm Agronomists"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Filter categories */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'AI_ENGINE', 'VALVE_CONTROL', 'POWER_GRID', 'SYSTEM'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  filterCategory === cat
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Entries Container */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 max-h-[280px] overflow-y-auto font-mono text-xs space-y-2">
        {filteredLogs.map(entry => {
          let sevColor = 'text-slate-400';
          let sevBg = 'bg-slate-800 text-slate-300';
          if (entry.severity === 'SUCCESS') {
            sevColor = 'text-emerald-400';
            sevBg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
          } else if (entry.severity === 'WARNING') {
            sevColor = 'text-amber-400';
            sevBg = 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
          } else if (entry.severity === 'CRITICAL') {
            sevColor = 'text-rose-400';
            sevBg = 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
          }

          return (
            <div
              key={entry.id}
              className="flex items-start gap-2.5 p-1.5 rounded hover:bg-slate-900/60 transition-colors"
            >
              <span className="text-slate-500 shrink-0 text-[11px]">{entry.timestamp}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${sevBg}`}>
                {entry.category}
              </span>
              <span className={`text-[11px] leading-relaxed break-words ${sevColor}`}>
                {entry.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
