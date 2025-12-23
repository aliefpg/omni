import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, Calendar } from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: TaskCategory[];
  setCategories: React.Dispatch<React.SetStateAction<TaskCategory[]>>;
}

const TasksView: React.FC<TasksViewProps> = ({ 
  tasks, setTasks, categories, setCategories 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState<{
    title: string;
    categoryIds: string[];
    dueDate: string;
  }>({
    title: '',
    categoryIds: [],
    dueDate: ''
  });

  // Auto-complete check for tasks with due dates (checks end of the specified day)
  useEffect(() => {
    const now = new Date();
    const needsUpdate = tasks.some(t => {
      if (!t.completed && t.dueDate) {
        // Since we only have date, we check if today is past the due date day
        const due = new Date(t.dueDate);
        due.setHours(23, 59, 59, 999); // Task is due at the end of the day
        return due < now;
      }
      return false;
    });

    if (needsUpdate) {
      setTasks(prev => prev.map(t => {
        if (!t.completed && t.dueDate) {
          const due = new Date(t.dueDate);
          due.setHours(23, 59, 59, 999);
          if (due < now) return { ...t, completed: true };
        }
        return t;
      }));
    }
  }, [tasks, setTasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: formData.title,
      categoryIds: formData.categoryIds,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: formData.dueDate || undefined
    };

    setTasks(prev => [newTask, ...prev]);
    setShowAddForm(false);
    setFormData({ title: '', categoryIds: [], dueDate: '' });
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];
    const newCat: TaskCategory = {
      id: crypto.randomUUID(),
      name: newCatName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setTasks(prev => prev.map(t => ({
      ...t,
      categoryIds: t.categoryIds.filter(cid => cid !== id)
    })));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleCategorySelection = (catId: string) => {
    setFormData(prev => {
      const exists = prev.categoryIds.includes(catId);
      if (exists) {
        return { ...prev, categoryIds: prev.categoryIds.filter(id => id !== catId) };
      }
      return { ...prev, categoryIds: [...prev.categoryIds, catId] };
    });
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Category Management Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Kategori Tugas</h3>
          <button 
            onClick={() => setShowCatForm(!showCatForm)}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            {showCatForm ? 'Selesai' : 'Kelola'}
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 min-h-[40px] items-center">
          {categories.map(c => (
            <div 
              key={c.id} 
              className="flex-shrink-0 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 group transition-all"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs font-bold text-slate-700">{c.name}</span>
              {showCatForm && (
                <button onClick={() => deleteCategory(c.id)} className="text-slate-300 hover:text-red-500 ml-1 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {showCatForm && (
            <div className="flex-shrink-0 flex gap-2 ml-2">
              <input 
                type="text" 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Tambah..."
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 w-24 shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button onClick={handleAddCategory} className="bg-indigo-600 text-white p-1.5 rounded-xl shadow-md active:scale-95 transition-transform">
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-3xl p-5 border border-indigo-100 shadow-sm">
          <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1">Tugas Aktif</p>
          <p className="text-3xl font-bold text-indigo-600">{tasks.filter(t => !t.completed).length}</p>
        </div>
        <div className="bg-green-50 rounded-3xl p-5 border border-green-100 shadow-sm">
          <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-1">Selesai</p>
          <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Daftar Tugas</h3>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={18} /> Tugas Baru
          </button>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-[40px] text-center">
              <p className="text-slate-400 text-sm font-medium">Belum ada tugas yang dicatat.</p>
            </div>
          ) : (
            tasks.map(t => (
              <div key={t.id} className={`bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex items-center gap-4 group transition-all ${t.completed ? 'opacity-50 grayscale' : 'hover:border-indigo-100'}`}>
                <button 
                  onClick={() => toggleTask(t.id)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    t.completed ? 'bg-green-500 text-white border-green-500 shadow-md' : 'border-2 border-slate-200 bg-slate-50'
                  }`}
                >
                  {t.completed && <Check size={16} />}
                </button>
                <div className="flex-1 overflow-hidden">
                  <p className={`font-bold text-sm truncate ${t.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {t.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {t.dueDate && (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg">
                        <Calendar size={10} />
                        {formatDateLabel(t.dueDate)}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {t.categoryIds.map(cid => {
                        const cat = categories.find(c => c.id === cid);
                        return cat ? (
                          <span key={cid} className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: cat.color }}>
                            {cat.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTask(t.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tugas Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Apa yang dikerjakan?</label>
                <input 
                  type="text" 
                  autoFocus
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Belanja bulanan"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tanggal Target (Selesai Otomatis)</label>
                <input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Pilih Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => {
                    const isSelected = formData.categoryIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategorySelection(c.id)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 border ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                            : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-300'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : ''}`} style={isSelected ? {} : { backgroundColor: c.color }} />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                disabled={!formData.title}
                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Buat Tugas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;