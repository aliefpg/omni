
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Check, X, Calendar, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
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
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
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
    return [...(tasks || [])].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTasks.slice(start, start + itemsPerPage);
  }, [sortedTasks, currentPage, itemsPerPage]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: formData.title,
      categoryIds: [...formData.categoryIds],
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: formData.dueDate || undefined
    };
    setTasks(prev => [newTask, ...prev]);
    setShowAddForm(false);
    setFormData({ title: '', categoryIds: [], dueDate: '' });
    setCurrentPage(1);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#a855f7'];
    const newCat: TaskCategory = {
      id: crypto.randomUUID(),
      name: newCatName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100">
          <p className="text-indigo-100 text-[9px] font-black uppercase tracking-widest">Tugas Aktif</p>
          <p className="text-3xl font-black mt-1">{tasks.filter(t => !t.completed).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Selesai</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{tasks.filter(t => t.completed).length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-black text-slate-700 uppercase text-xs tracking-[0.2em]">Daftar Tugas</h3>
          <div className="flex gap-2">
            <button onClick={() => setShowCatManager(!showCatManager)} className={`p-2.5 rounded-2xl border transition-all ${showCatManager ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}><Tag size={18} /></button>
            <button onClick={() => setShowAddForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest">+ Tugas</button>
          </div>
        </div>

        {showCatManager && (
          <div className="animate-in slide-in-from-top duration-300 mb-6">
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Kelola Kategori</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[10px] font-black text-slate-700 uppercase">{c.name}</span>
                    <button onClick={() => setCategories(prev => prev.filter(x => x.id !== c.id))} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nama kategori..." className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100" />
                <button onClick={handleAddCategory} className="bg-indigo-600 text-white p-3 rounded-xl shadow-md"><Plus size={20} /></button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {paginatedTasks.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-100 p-12 rounded-[40px] text-center"><p className="text-slate-400 text-[11px] font-black uppercase tracking-widest italic opacity-50">Belum ada tugas.</p></div>
          ) : (
            <>
              {paginatedTasks.map(t => (
                <div key={t.id} className={`bg-white p-5 rounded-[32px] shadow-sm border border-slate-50 flex items-start gap-4 transition-all min-w-0 ${t.completed ? 'opacity-40 grayscale' : 'hover:border-indigo-100'}`}>
                  <button onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x))} className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${t.completed ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'border-2 border-slate-100 bg-slate-50 text-slate-200'}`}>
                    {t.completed ? <Check size={20} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    {/* Judul tugas dipastikan membungkus (wrap) */}
                    <p className={`block w-full font-bold text-[14px] leading-relaxed whitespace-normal break-words overflow-visible ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {t.dueDate && <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-tight"><Calendar size={10} /> {new Date(t.dueDate).toLocaleDateString('id-ID')}</div>}
                      <div className="flex gap-1.5 flex-wrap">
                        {/* Kategori sekarang menampilkan teks tag */}
                        {t.categoryIds.map(cid => {
                          const cat = categories.find(c => c.id === cid);
                          return cat ? (
                            <span key={cid} className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight" style={{ backgroundColor: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                              {cat.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setTasks(prev => prev.filter(x => x.id !== t.id))} className="text-slate-200 hover:text-red-500 p-1 flex-shrink-0 transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-20"><ChevronLeft size={20} /></button>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-20"><ChevronRight size={20} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[44px] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800">Tugas Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2 bg-slate-50 rounded-full">✕</button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-6">
              <textarea autoFocus value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Tulis tugas anda..." className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold outline-none resize-none h-28 focus:ring-2 focus:ring-indigo-50" />
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Pilih Tag</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => setFormData(prev => ({ ...prev, categoryIds: prev.categoryIds.includes(c.id) ? prev.categoryIds.filter(id => id !== c.id) : [...prev.categoryIds, c.id] }))} className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border ${formData.categoryIds.includes(c.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={!formData.title} className="w-full bg-indigo-600 text-white py-5 rounded-[32px] font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50">BUAT TUGAS</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
