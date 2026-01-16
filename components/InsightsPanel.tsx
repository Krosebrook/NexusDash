import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, BrainCircuit, Bot } from 'lucide-react';
import { generateDashboardInsights, InsightReport } from '../services/aiService';
import { DashboardMetric, AuditLog, CostRecord } from '../types';

interface InsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DashboardMetric[];
  logs: AuditLog[];
  costs: CostRecord[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ 
  isOpen, 
  onClose,
  metrics,
  logs,
  costs
}) => {
  const [report, setReport] = useState<InsightReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateDashboardInsights(metrics, logs, costs);
    setReport(result);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg">
               <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Insight Engine</h2>
              <p className="text-xs text-slate-400">Powered by Gemini 1.5 Pro</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {!report && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
                 <BrainCircuit size={48} className="text-blue-400" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-slate-200 font-semibold mb-2">Ready to Analyze</h3>
                <p className="text-slate-500 text-sm">
                  Generate a comprehensive report of your current system health, error patterns, and cost anomalies.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 font-lg rounded-full hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-900/40 focus:outline-none ring-offset-2 focus:ring-2 ring-blue-500"
              >
                <span className="mr-2">Generate Analysis</span>
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
               <div className="relative">
                 <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Bot size={24} className="text-slate-500" />
                 </div>
               </div>
               <p className="text-slate-400 text-sm animate-pulse">Processing dashboard telemetry...</p>
            </div>
          )}

          {report && !loading && (
            <div className="animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  Generated: {report.generatedAt.toLocaleTimeString()}
                </span>
                <button 
                  onClick={handleGenerate} 
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <RefreshCw size={12} />
                  Regenerate
                </button>
              </div>
              
              {/* HTML Content Container */}
              <div 
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: report.htmlContent }}
              />

              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex gap-3">
                   <div className="mt-1"><Bot size={16} className="text-blue-400" /></div>
                   <p className="text-xs text-blue-300/80 leading-relaxed">
                     This report was generated automatically based on current snapshot data. Always verify critical alerts manually in the respective integration dashboards.
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};