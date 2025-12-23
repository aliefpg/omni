
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Clock, CheckCircle2, Circle, X } from 'lucide-react';
import { Meeting, MeetingCategory } from '../types';

interface MeetingsViewProps {
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  categories: MeetingCategory[];
  setCategories: React.Dispatch<React.SetStateAction<MeetingCategory[]>>;
}

const MeetingsView: React.FC<MeetingsViewProps> = ({ meetings, setMeetings, categories, setCategories }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState<{
    title: string;
    startTime: string;
    description: string;
    categoryIds: string[];
  }>({
    title: '',
    startTime: '',
    description: '',
    categoryIds: []
  });

  // Auto-complete check: if meeting time is in the past, mark as completed
  useEffect(() => {
    const now = new Date();
    const needsUpdate = meetings.some(m => !m.completed && new Date(m.startTime) < now);
    if (needsUpdate) {
      setMeetings(prev => prev.map(m => {
        if (!m.completed && new Date(m.startTime) < now) {
          return { ...m, completed: true };
        }
        return m;
      }));
    }
  }, [meetings, setMeetings]);

  const timelineData = useMemo(() => {
    return [...meetings].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [meetings]);

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime) return;

    const newMeeting: Meeting = {
      id: crypto.randomUUID(),
      title: formData.title,
      startTime: formData.startTime,
      completed: false,
      categoryIds: formData.categoryIds,
      description: formData.description
    };

    setMeetings(prev => [...prev, newMeeting]);
    setShowAddForm(false);
    setFormData({ title: '', startTime: '', description: '', categoryIds: [] });
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];
    const newCat: MeetingCategory = {
      id: crypto.randomUUID(),
      name: newCatName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setMeetings(prev => prev.map(m => ({
      ...m,
      categoryIds: m.categoryIds.filter(cid => cid !== id)
    })));
  };

  const toggleComplete = (id: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
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

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Category Management Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Kategori Meeting</h3>
          <button 
            onClick={() => setShowCatForm(!showCatForm)}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg"
          >
            {showCatForm ? 'Selesai' : 'Kelola'}
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 min-h-[40px] items-center">
          {categories.map(c => (
            <div 
              key={c.id} 
              className="flex-shrink-0 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 group"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs font-bold text-slate-700">{c.name}</span>
              {showCatForm && (
                <button onClick={() => deleteCategory(c.id)} className="text-slate-300 hover:text-red-500 ml-1">
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
              <button onClick={handleAddCategory} className="bg-indigo-600 text-white p-1.5 rounded-xl">
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Hero */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          Timeline Meeting
        </h3>
        <div className="space-y-6 max-h-64 overflow-y-auto no-scrollbar pr-2">
          {timelineData.length === 0 ? (
            <p className="text-slate-500 text-center py-4 italic text-sm">Belum ada meeting</p>
          ) : (
            timelineData.map((m, i) => (
              <div key={m.id} className="relative pl-6">
                {i < timelineData.length - 1 && (
                  <div className="absolute left-[3px] top-6 bottom-[-24px] w-[1px] bg-slate-700" />
                )}
                <div className={`absolute left-0 top-1.5 w-[7px] h-[7px] rounded-full ring-4 ring-slate-900 ${m.completed ? 'bg-green-400' : 'bg-indigo-500'}`} />
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">
                      {formatTime(m.startTime)}
                    </span>
                    <div className="flex gap-3">
                      <button onClick={() => toggleComplete(m.id)} className={`${m.completed ? 'text-green-400' : 'text-slate-600'} hover:text-green-300 transition-colors`}>
                        {m.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </button>
                      <button onClick={() => deleteMeeting(m.id)} className="text-slate-700 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h4 className={`font-bold text-sm ${m.completed ? 'text-slate-500 line-through' : ''}`}>{m.title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {m.categoryIds.map(cid => {
                      const cat = categories.find(c => c.id === cid);
                      return cat ? (
                        <div key={cid} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Terjadwal</h3>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={18} /> Baru
          </button>
        </div>

        <div className="space-y-3">
          {meetings.map(m => (
            <div key={m.id} className={`bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex items-center gap-4 transition-all ${m.completed ? 'opacity-50 grayscale' : 'hover:border-indigo-100'}`}>
              <button onClick={() => toggleComplete(m.id)} className={`p-3 rounded-2xl transition-colors ${m.completed ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-500'}`}>
                {m.completed ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </button>
              <div className="flex-1 overflow-hidden">
                <p className={`font-bold text-slate-800 text-sm truncate ${m.completed ? 'line-through' : ''}`}>{m.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {new Date(m.startTime).toLocaleDateString()} • {formatTime(m.startTime)}
                  </p>
                  <div className="flex gap-1">
                    {m.categoryIds.map(cid => {
                      const cat = categories.find(c => c.id === cid);
                      return cat ? (
                        <span key={cid} className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: cat.color }}>
                          {cat.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
              <div className={`text-[10px] font-bold px-3 py-1.5 rounded-xl ${m.completed ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {m.completed ? 'DONE' : 'SOON'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Buat Meeting</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>

            <form onSubmit={handleAddMeeting} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Judul Agenda</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Brainstorming UI/UX"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Waktu Mulai</label>
                <input 
                  type="datetime-local" 
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Pilih Kategori (Bisa banyak)</label>
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

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Deskripsi Singkat</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Catatan kecil untuk agenda ini..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none h-24 resize-none transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={!formData.title || !formData.startTime}
                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
              >
                Jadwalkan Sekarang
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsView;
