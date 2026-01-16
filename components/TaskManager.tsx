import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { Check, Plus, Trash2, ListTodo, Search, ArrowUpDown, Edit2, X, Save } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (title: string, priority: 'low'|'medium'|'high') => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newTitle: string, newPriority: 'low'|'medium'|'high') => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onEditTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  
  // Filter & Sort State
  const [filterPriority, setFilterPriority] = useState<'all'|'low'|'medium'|'high'>('all');
  const [sortOrder, setSortOrder] = useState<'date-desc'|'date-asc'|'priority'>('priority');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<'low'|'medium'|'high'>('medium');

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEditing = () => {
    if (editingId && editTitle.trim()) {
      onEditTask(editingId, editTitle, editPriority);
      setEditingId(null);
    }
  };

  const processedTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
        if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'date-desc') return b.createdAt.getTime() - a.createdAt.getTime();
        if (sortOrder === 'date-asc') return a.createdAt.getTime() - b.createdAt.getTime();
        if (sortOrder === 'priority') {
          const pMap = { high: 3, medium: 2, low: 1 };
          return pMap[b.priority] - pMap[a.priority];
        }
        return 0;
      });
  }, [tasks, filterPriority, sortOrder, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, priority);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex flex-col gap-3 bg-slate-800/50">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <ListTodo size={18} className="text-emerald-400" />
             <h3 className="text-slate-200 font-semibold text-sm">Ops Tasks</h3>
           </div>
           <span className="text-xs text-slate-500">{tasks.filter(t => t.status === 'pending').length} Pending</span>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
           <div className="relative flex-1">
             <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="text" 
               placeholder="Filter..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-md py-1 pl-7 pr-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
             />
           </div>
           <select 
             value={filterPriority} 
             onChange={(e) => setFilterPriority(e.target.value as any)}
             className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none"
           >
             <option value="all">All</option>
             <option value="high">High</option>
             <option value="medium">Med</option>
             <option value="low">Low</option>
           </select>
           <button 
             onClick={() => setSortOrder(prev => prev === 'priority' ? 'date-desc' : 'priority')}
             className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-slate-300 hover:text-emerald-400 transition-colors"
             title="Toggle Sort"
           >
             <ArrowUpDown size={12} />
           </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {processedTasks.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-2">
              <Check size={24} className="opacity-20" />
              <p>No tasks found</p>
           </div>
        ) : (
            processedTasks.map(task => (
            <div key={task.id} className="group flex items-start gap-3 p-3 hover:bg-slate-700/30 rounded-lg transition-colors border border-transparent hover:border-slate-700/50">
                {editingId === task.id ? (
                   <div className="flex-1 flex flex-col gap-2">
                      <input 
                        type="text" 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                         <div className="flex gap-1">
                            {(['low', 'medium', 'high'] as const).map(p => (
                               <button 
                                 key={p} 
                                 onClick={() => setEditPriority(p)}
                                 className={`w-4 h-4 rounded-full border ${editPriority === p ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-600'}`}
                                 title={p}
                               />
                            ))}
                         </div>
                         <div className="flex gap-1">
                            <button onClick={saveEditing} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded"><Save size={14} /></button>
                            <button onClick={cancelEditing} className="p-1 text-slate-400 hover:bg-slate-700 rounded"><X size={14} /></button>
                         </div>
                      </div>
                   </div>
                ) : (
                  <>
                    <button 
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                          task.status === 'completed' 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'border-slate-600 hover:border-emerald-500/50 text-transparent'
                      }`}
                    >
                      <Check size={10} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                              task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                              task.priority === 'medium' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-slate-500/10 text-slate-400'
                          }`}>
                              {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-600">
                              {task.createdAt.toLocaleDateString()}
                          </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(task)}
                        className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                      >
                          <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                          <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
            </div>
            ))
        )}
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900/50 border-t border-slate-700">
        <div className="flex gap-2 mb-2">
            <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New task..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button 
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="p-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-lg transition-colors disabled:opacity-50"
            >
                <Plus size={18} />
            </button>
        </div>
        <div className="flex gap-2">
           {(['low', 'medium', 'high'] as const).map((p) => (
             <button
               key={p}
               type="button"
               onClick={() => setPriority(p)}
               className={`text-[10px] px-2 py-0.5 rounded capitalize transition-colors ${
                 priority === p ? 'bg-slate-700 text-slate-200 border border-slate-600' : 'text-slate-500 hover:text-slate-400'
               }`}
             >
               {p}
             </button>
           ))}
        </div>
      </form>
    </div>
  );
};