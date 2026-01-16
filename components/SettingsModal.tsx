import React, { useState } from 'react';
import { X, Moon, Sun, Bell, Monitor, Volume2, Shield, Mail, Building, Key } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'profile'>('general');

  if (!isOpen) return null;

  const handleToggle = (key: keyof UserSettings['notifications']) => {
    onUpdateSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  const handleTheme = (theme: UserSettings['theme']) => {
      onUpdateSettings({ ...settings, theme });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Monitor size={18} className="text-blue-400" />
            Settings & Profile
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
           <button 
             onClick={() => setActiveTab('general')}
             className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
           >
             General
           </button>
           <button 
             onClick={() => setActiveTab('profile')}
             className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'profile' ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
           >
             User Profile
           </button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto">
            {activeTab === 'general' ? (
                <>
                {/* Theme Section */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sun size={14} /> Appearance
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'compact'] as const).map((t) => (
                        <button 
                            key={t}
                            onClick={() => handleTheme(t)}
                            className={`px-3 py-2 rounded-lg border text-sm capitalize flex flex-col items-center gap-1 transition-all ${
                                settings.theme === t 
                                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-medium' 
                                : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            {t === 'light' && <Sun size={16} />}
                            {t === 'dark' && <Moon size={16} />}
                            {t === 'compact' && <Monitor size={16} />}
                            {t}
                        </button>
                    ))}
                    </div>
                </section>

                {/* Notifications Section */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Bell size={14} /> Notifications
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-md text-blue-400"><Mail size={16} /></div>
                            <div>
                                <p className="text-sm text-slate-200">Email Reports</p>
                                <p className="text-xs text-slate-500">Daily summaries</p>
                            </div>
                            </div>
                            <button 
                            onClick={() => handleToggle('email')}
                            className={`w-10 h-5 rounded-full relative transition-colors ${settings.notifications.email ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.notifications.email ? 'translate-x-5' : ''}`}></span>
                            </button>
                        </div>

                         <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-md text-purple-400"><Volume2 size={16} /></div>
                            <div>
                                <p className="text-sm text-slate-200">Slack Alerts</p>
                                <p className="text-xs text-slate-500">Real-time incident feed</p>
                            </div>
                            </div>
                            <button 
                            onClick={() => handleToggle('slack')}
                            className={`w-10 h-5 rounded-full relative transition-colors ${settings.notifications.slack ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.notifications.slack ? 'translate-x-5' : ''}`}></span>
                            </button>
                        </div>

                         <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-md text-red-400"><Shield size={16} /></div>
                            <div>
                                <p className="text-sm text-slate-200">Critical Only</p>
                                <p className="text-xs text-slate-500">Filter noise</p>
                            </div>
                            </div>
                            <button 
                            onClick={() => handleToggle('criticalAlertsOnly')}
                            className={`w-10 h-5 rounded-full relative transition-colors ${settings.notifications.criticalAlertsOnly ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.notifications.criticalAlertsOnly ? 'translate-x-5' : ''}`}></span>
                            </button>
                        </div>
                    </div>
                </section>
                </>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-700">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">AD</div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Admin User</h3>
                            <p className="text-slate-400 text-sm">Sr. DevOps Engineer</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                                <Mail size={16} className="text-slate-400" />
                                <span className="text-slate-200 text-sm">admin@nexus.corp</span>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Organization</label>
                            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                                <Building size={16} className="text-slate-400" />
                                <span className="text-slate-200 text-sm">Nexus Systems Inc.</span>
                            </div>
                        </div>

                         <div className="pt-4">
                            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 transition-colors flex items-center justify-center gap-2 text-sm">
                                <Key size={14} /> Change Password
                            </button>
                         </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};