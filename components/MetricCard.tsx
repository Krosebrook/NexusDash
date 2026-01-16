import React from 'react';
import { DashboardMetric } from '../types';
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Minus, Lock, Clock, Database, Wrench, MessageSquare, Ticket } from 'lucide-react';

interface MetricCardProps {
  metric: DashboardMetric;
  onRetry: (id: string) => void;
  onFix?: (source: string) => void;
}

const formatValue = (value: number | string, unit: string) => {
  if (unit === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
  if (unit === 'percentage') return `${value}%`;
  if (unit === 'count') return new Intl.NumberFormat('en-US').format(Number(value));
  return value;
};

const getIcon = (source: string) => {
  switch (source) {
    case 'hubspot': return <div className="p-2 rounded bg-orange-500/20 text-orange-400 font-bold text-xs">HS</div>;
    case 'freshdesk': return <div className="p-2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">FD</div>;
    case 'github': return <div className="p-2 rounded bg-slate-500/20 text-slate-300 font-bold text-xs">GH</div>;
    case 'gemini': return <div className="p-2 rounded bg-blue-500/20 text-blue-400 font-bold text-xs">AI</div>;
    case 'stripe': return <div className="p-2 rounded bg-indigo-500/20 text-indigo-400 font-bold text-xs">ST</div>;
    case 'slack': return <div className="p-2 rounded bg-purple-500/20 text-purple-400 font-bold text-xs"><MessageSquare size={14} /></div>;
    case 'jira': return <div className="p-2 rounded bg-sky-500/20 text-sky-400 font-bold text-xs"><Ticket size={14} /></div>;
    default: return <Database size={16} className="text-slate-400" />;
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({ metric, onRetry, onFix }) => {
  const { error } = metric;

  if (error) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-red-900/50 p-6 flex flex-col justify-between h-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertTriangle size={64} className="text-red-500" />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            {getIcon(metric.source)}
            <span className="text-slate-400 text-sm font-medium">{metric.source.toUpperCase()}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-1">{metric.label}</h3>
          
          <div className="mt-4 p-3 bg-red-950/30 rounded border border-red-900/50">
             <div className="flex items-start gap-2">
                {error.code === 'AUTH_FAILED' ? <Lock size={16} className="text-red-400 mt-1" /> : <Clock size={16} className="text-red-400 mt-1" />}
                <div>
                   <p className="text-red-300 font-medium text-sm">{error.cause}</p>
                   <p className="text-red-400/70 text-xs mt-1">{error.fix}</p>
                   {error.retryAfter && (
                     <p className="text-xs text-red-300 mt-1 font-mono">
                       Retry after: {error.retryAfter.toLocaleTimeString()}
                     </p>
                   )}
                </div>
             </div>
          </div>
        </div>

        {error.retryable ? (
          <button 
            onClick={() => onRetry(metric.id)}
            className="mt-4 w-full py-2 px-3 bg-red-900/20 hover:bg-red-900/40 text-red-300 text-xs font-semibold rounded border border-red-900/30 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={12} />
            RETRY CONNECTION
          </button>
        ) : (
          <button 
             onClick={() => onFix && onFix(metric.source)}
             className="mt-4 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Wrench size={12} />
            AUTO-FIX CONFIG
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col justify-between h-full hover:border-slate-600 transition-colors shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                 {getIcon(metric.source)} {metric.source}
            </span>
            <h3 className="text-slate-200 text-sm font-medium">{metric.label}</h3>
        </div>
        {metric.trend && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                metric.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
                metric.trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'
            }`}>
                {metric.trend === 'up' && <TrendingUp size={12} />}
                {metric.trend === 'down' && <TrendingDown size={12} />}
                {metric.trend === 'flat' && <Minus size={12} />}
                {metric.changePercent ? `${Math.abs(metric.changePercent)}%` : '-'}
            </div>
        )}
      </div>

      <div className="mt-6">
        <div className="text-3xl font-bold text-white tracking-tight">
          {formatValue(metric.value, metric.unit)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Last updated {metric.refreshedAt.toLocaleTimeString()}</span>
            <span className="text-slate-600">ID: {metric.id.slice(0, 4)}</span>
        </div>
      </div>
    </div>
  );
};