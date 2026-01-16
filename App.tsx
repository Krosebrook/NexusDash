import React, { useState, useEffect, useCallback } from 'react';
import { fetchDashboardMetrics, fetchAuditLogs, fetchCostData, resolveIssue } from './services/mockDataService';
import { DashboardMetric, AuditLog, CostRecord, Task, UserSettings } from './types';
import { MetricCard } from './components/MetricCard';
import { AuditLogViewer } from './components/AuditLogViewer';
import { CostChart } from './components/CostChart';
import { InsightsPanel } from './components/InsightsPanel';
import { ChatWidget } from './components/ChatWidget';
import { TaskManager } from './components/TaskManager';
import { SettingsModal } from './components/SettingsModal';
import { LayoutDashboard, RefreshCw, ShieldCheck, Settings, Bell, Search, Sparkles, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  // Data State
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [costs, setCosts] = useState<CostRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([
      { id: '1', title: 'Review freshdesk API quotas', status: 'pending', priority: 'medium', createdAt: new Date() },
      { id: '2', title: 'Update Notion integration token', status: 'completed', priority: 'high', createdAt: new Date() }
  ]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>({
      theme: 'dark',
      notifications: { email: true, slack: false, criticalAlertsOnly: true }
  });

  const loadData = useCallback(async () => {
    try {
      if (loading) setLoading(true); // Initial load
      
      const [metricsData, logsData, costsData] = await Promise.all([
        fetchDashboardMetrics(),
        fetchAuditLogs(),
        fetchCostData()
      ]);
      
      setMetrics(metricsData);
      setLogs(logsData);
      setCosts(costsData);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleRetryMetric = (id: string) => {
    setRefreshing(true);
    setTimeout(() => {
       loadData();
    }, 500);
  };

  const handleAiRemediation = async (source: string) => {
    try {
        setRefreshing(true);
        const success = await resolveIssue(source);
        if (success) {
            await loadData(); // Reload to see the fixed state
        }
        return success;
    } catch (e) {
        setRefreshing(false);
        return false;
    }
  };

  // Task Handlers
  const addTask = (title: string, priority: 'low'|'medium'|'high') => {
      setTasks(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          title,
          priority,
          status: 'pending',
          createdAt: new Date()
      }, ...prev]);
  };

  const toggleTask = (id: string) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  const deleteTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleEditTask = (id: string, newTitle: string, newPriority: 'low'|'medium'|'high') => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle, priority: newPriority } : t));
  };

  return (
    <div className={`flex min-h-screen bg-slate-900 text-slate-50 ${userSettings.theme === 'compact' ? 'text-sm' : ''}`}>
      <InsightsPanel 
        isOpen={showInsights} 
        onClose={() => setShowInsights(false)}
        metrics={metrics}
        logs={logs}
        costs={costs}
      />

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={userSettings}
        onUpdateSettings={setUserSettings}
      />

      <ChatWidget 
        metrics={metrics}
        onResolveIssue={handleAiRemediation}
      />

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="font-bold text-white text-lg">N</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Nexus</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 text-blue-400 rounded-lg border border-blue-900/30 font-medium text-sm">
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors font-medium text-sm">
            <ShieldCheck size={18} />
            Security & Audit
          </button>
          <button 
             onClick={() => setShowSettings(true)}
             className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors font-medium text-sm"
          >
            <Settings size={18} />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={() => setShowSettings(true)}
             className="flex items-center gap-3 w-full hover:bg-slate-800 p-2 rounded-lg transition-colors text-left"
           >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">AD</div>
              <div>
                 <p className="text-sm font-medium">Admin User</p>
                 <p className="text-xs text-slate-500">admin@nexus.corp</p>
              </div>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8 overflow-x-hidden">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Operations Overview</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time metrics across {metrics.length} active integrations.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative hidden sm:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                  type="text" 
                  placeholder="Search metrics..." 
                  className="bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 w-64 text-slate-200 placeholder-slate-500"
                />
             </div>
             
             <button 
                onClick={() => setShowInsights(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all text-sm font-medium shadow-lg shadow-indigo-900/20 border border-indigo-400/20"
             >
                <Sparkles size={16} />
                AI Insights
             </button>

             <button 
               onClick={() => setShowSettings(true)}
               className="relative p-2 text-slate-400 hover:text-white transition-colors"
             >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all ${refreshing ? 'opacity-70' : ''}`}
             >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
             </button>
          </div>
        </header>

        {loading ? (
           <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
           </div>
        ) : (
          <div className="space-y-6">
            {/* Mobile Insight Button */}
            <div className="sm:hidden mb-4">
                <button 
                    onClick={() => setShowInsights(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-medium"
                >
                    <Sparkles size={16} />
                    View AI Report
                </button>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map(metric => (
                <div key={metric.id} className="h-full">
                  <MetricCard 
                    metric={metric} 
                    onRetry={handleRetryMetric} 
                    onFix={(source) => handleAiRemediation(source)} // Wire up the Fix button
                  />
                </div>
              ))}
            </div>

            {/* Bottom Row: Charts & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[400px]">
               <div className="lg:col-span-2 h-full min-h-[300px]">
                  <AuditLogViewer logs={logs} />
               </div>
               <div className="h-full min-h-[300px]">
                  <CostChart data={costs} />
               </div>
               <div className="h-full min-h-[300px]">
                  <TaskManager 
                     tasks={tasks}
                     onAddTask={addTask}
                     onToggleTask={toggleTask}
                     onDeleteTask={deleteTask}
                     onEditTask={handleEditTask}
                  />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;