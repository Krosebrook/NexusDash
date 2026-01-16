import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { CostRecord, CostForecastResult } from '../types';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { predictCostTrends } from '../services/aiService';

interface CostChartProps {
  data: CostRecord[];
}

export const CostChart: React.FC<CostChartProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<CostForecastResult | null>(null);

  // Process data for Recharts: Group by month
  const processedData = data.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.month === curr.month);
    if (existing) {
      existing[curr.source] = curr.cost;
    } else {
      acc.push({
        month: curr.month,
        [curr.source]: curr.cost,
        isForecast: false
      });
    }
    return acc;
  }, []);

  // Merge forecast data if available (multiple months)
  const chartData = [...processedData];
  if (forecast && forecast.forecasts) {
    forecast.forecasts.forEach(monthlyForecast => {
        const forecastEntry: any = {
            month: monthlyForecast.monthLabel,
            isForecast: true
        };
        monthlyForecast.items.forEach(item => {
            forecastEntry[item.source] = item.cost;
        });
        chartData.push(forecastEntry);
    });
  }

  const handleForecast = async () => {
    setLoading(true);
    const result = await predictCostTrends(data);
    setForecast(result);
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isForecast = payload[0].payload.isForecast;
      
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg text-xs max-w-xs z-50">
          <p className="font-bold text-slate-200 mb-2 flex items-center gap-2">
            {label} {isForecast && <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] uppercase">Projected</span>}
          </p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-400 capitalize">{entry.name}:</span>
              <span className="text-slate-200 font-mono font-medium">${Number(entry.value).toFixed(2)}</span>
            </div>
          ))}
          {isForecast && forecast && (
             <div className="mt-2 pt-2 border-t border-slate-700/50">
               <p className="text-slate-400 mb-1 font-semibold">AI Reasoning:</p>
               <ul className="list-disc pl-3 space-y-1 text-slate-500 max-h-32 overflow-y-auto custom-scrollbar">
                  {/* Find the reasoning for this specific month */}
                  {forecast.forecasts
                    .find(f => f.monthLabel === label)?.items
                    .map(f => (
                     <li key={f.source}>
                        <span className="capitalize text-slate-400">{f.source}</span>: {f.reasoning}
                     </li>
                  ))}
               </ul>
             </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col h-full relative overflow-hidden">
      <div className="mb-4 flex justify-between items-start">
        <div>
           <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
             API Cost Analysis
             {forecast && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">AI Enabled</span>}
           </h3>
           <p className="text-slate-500 text-xs">Monthly spend across integrations</p>
        </div>
        
        {!forecast ? (
          <button 
            onClick={handleForecast}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-medium transition-all"
          >
            {loading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={12} />}
            Forecast (2 Mo)
          </button>
        ) : (
           <div className="flex items-center gap-1 text-indigo-400 text-xs font-medium animate-[fadeIn_0.5s]">
              <TrendingUp size={14} />
              <span>Projection Loaded</span>
           </div>
        )}
      </div>

      {forecast && (
         <div className="mb-4 p-3 bg-indigo-900/10 border border-indigo-500/20 rounded-lg flex gap-3 animate-[fadeIn_0.3s]">
            <div className="mt-0.5"><AlertCircle size={14} className="text-indigo-400" /></div>
            <div>
               <p className="text-xs text-indigo-300 font-medium">AI Executive Summary</p>
               <p className="text-xs text-indigo-300/70 leading-relaxed mt-0.5">{forecast.summary}</p>
            </div>
         </div>
      )}

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar 
                dataKey="hubspot" 
                name="HubSpot" 
                stackId="a" 
                fill="#f97316" 
                radius={[0, 0, 4, 4]} 
                fillOpacity={({payload}: any) => payload.isForecast ? 0.6 : 1}
                stroke={({payload}: any) => payload.isForecast ? "#f97316" : "none"}
                strokeDasharray="4 4"
            />
            <Bar 
                dataKey="gemini" 
                name="Gemini AI" 
                stackId="a" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                fillOpacity={({payload}: any) => payload.isForecast ? 0.6 : 1}
                stroke={({payload}: any) => payload.isForecast ? "#3b82f6" : "none"}
                strokeDasharray="4 4"
            />
             <Bar 
                dataKey="slack" 
                name="Slack" 
                stackId="a" 
                fill="#a855f7" 
                radius={[4, 4, 0, 0]} 
                fillOpacity={({payload}: any) => payload.isForecast ? 0.6 : 1}
                stroke={({payload}: any) => payload.isForecast ? "#a855f7" : "none"}
                strokeDasharray="4 4"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};