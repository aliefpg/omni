
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Check, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, TaskCategory } from '../types.ts';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: TaskCategory[];
  setCategories: React.Dispatch<React.SetStateAction<TaskCategory[]>>;
  itemsPerPage: number;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, setTasks, categories, setCategories, itemsPerPage }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<{
    title: string;
    categoryIds: string[];
    dueDate: string;
  }>({
    title: '',
    categoryIds: [],
    dueDate: ''
  });

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTasks.slice(start, start + itemsPerPage);
  }, [sortedTasks, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

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
    setCurrentPage(1);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleCategorySelection = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId) 
        ? prev.categoryIds.filter(id => id !== catId) 
        : [...prev.categoryIds, catId]
    }));
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-indigo-100">
          <p className="text-indigo-100 text-[9px] font-black uppercase tracking-widest">Tugas Aktif</p>
          <p className="text-3xl font-black mt-1">{tasks.filter(t => !t.completed).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Selesai</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{tasks.filter(t => t.completed).length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Daftar Tugas</h3>
          <button onClick={() => setShowAddForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all">
            + TUGAS BARU
          </button>
        </div>

        <div className="space-y-3">
          {paginatedTasks.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-100 p-12 rounded-[40px] text-center">
              <p className="text-slate-400 text-sm font-medium italic">Belum ada tugas dicatat.</p>
            </div>
          ) : (
            <>
              {paginatedTasks.map(t => (
                <div key={t.id} className={`bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex items-center gap-4 group transition-all ${t.completed ? 'opacity-40 grayscale' : 'hover:border-indigo-100'}`}>
                  <button onClick={() => toggleTask(t.id)} className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all ${t.completed ? 'bg-green-500 text-white' : 'border-2 border-slate-200 bg-slate-50'}`}>
                    {t.completed && <Check size={18} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {t.dueDate && <div className="flex items-center gap-1 text-[8px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-md uppercase"><Calendar size={8} /> {new Date(t.dueDate).toLocaleDateString('id-ID')}</div>}
                      <div className="flex gap-1">
                        {t.categoryIds.map(cid => {
                          const cat = categories.find(c => c.id === cid);
                          return cat ? <div key={cid} className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} /> : null;
                        })}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(t.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 disabled:opacity-30">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 disabled:opacity-30">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tugas Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2">✕</button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-5">
              <input type="text" autoFocus value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Apa yang ingin dikerjakan?" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" />
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id} type="button" onClick={() => toggleCategorySelection(c.id)} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${formData.categoryIds.includes(c.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={!formData.title} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all">BUAT TUGAS</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
