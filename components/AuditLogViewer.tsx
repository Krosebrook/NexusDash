import React from 'react';
import { AuditLog } from '../types';
import { CheckCircle2, XCircle, Activity } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2 bg-slate-800/50">
        <Activity size={18} className="text-blue-400" />
        <h3 className="text-slate-200 font-semibold text-sm">System Audit Trail</h3>
        <span className="ml-auto text-xs text-slate-500">Last 24 Hours</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900/50 text-xs uppercase font-medium text-slate-500 sticky top-0">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3 text-right">Request ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-700/20 transition-colors font-mono text-xs">
                <td className="px-4 py-3">
                  {log.status === 'success' ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 size={14} /> Success
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle size={14} /> Failed
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {log.timestamp.toLocaleTimeString()}
                </td>
                <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded ${
                        log.source === 'hubspot' ? 'bg-orange-900/30 text-orange-300' :
                        log.source === 'gemini' ? 'bg-blue-900/30 text-blue-300' :
                        log.source === 'github' ? 'bg-slate-700 text-slate-300' :
                        'bg-indigo-900/30 text-indigo-300'
                    }`}>
                        {log.source}
                    </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-200">{log.action}</td>
                <td className="px-4 py-3 truncate max-w-xs" title={log.details}>
                  {log.details}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {log.requestId.slice(0, 8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};