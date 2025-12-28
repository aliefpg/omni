
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Clock, CheckCircle2, ChevronLeft, ChevronRight, CheckCircle, Tag, X } from 'lucide-react';
import { Meeting, MeetingCategory } from '../types.ts';

interface MeetingsViewProps {
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  categories: MeetingCategory[];
  setCategories: React.Dispatch<React.SetStateAction<MeetingCategory[]>>;
  itemsPerPage: number;
}

const MeetingsView: React.FC<MeetingsViewProps> = ({ meetings, setMeetings, categories, setCategories, itemsPerPage }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [now, setNow] = useState(new Date());
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeMeetings = useMemo(() => {
    return (meetings || [])
      .filter(m => !m.completed)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [meetings]);

  const completedMeetings = useMemo(() => {
    return (meetings || [])
      .filter(m => m.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [meetings]);

  const totalActivePages = Math.ceil(activeMeetings.length / itemsPerPage) || 1;
  const totalCompletedPages = Math.ceil(completedMeetings.length / itemsPerPage) || 1;

  const paginatedActive = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return activeMeetings.slice(start, start + itemsPerPage);
  }, [activeMeetings, activePage, itemsPerPage]);

  const paginatedCompleted = useMemo(() => {
    const start = (completedPage - 1) * itemsPerPage;
    return completedMeetings.slice(start, start + itemsPerPage);
  }, [completedMeetings, completedPage, itemsPerPage]);

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formDataObj = new FormData(form);
    const title = formDataObj.get('title') as string;
    const startTime = formDataObj.get('startTime') as string;
    
    if (!title || !startTime) {
      alert("Mohon isi judul dan waktu meeting!");
      return;
    }

    const newM: Meeting = {
      id: crypto.randomUUID(),
      title,
      startTime,
      completed: false,
      categoryIds: [...selectedCatIds],
    };

    setMeetings(prev => [newM, ...prev]);
    setShowAddForm(false);
    setSelectedCatIds([]);
    setActivePage(1);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
    const newCat: MeetingCategory = {
      id: crypto.randomUUID(),
      name: newCatName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
  };

  const renderMeetingCard = (m: Meeting) => {
    const mDate = new Date(m.startTime);
    const isPast = mDate.getTime() < now.getTime();
    const isRunning = isPast && (now.getTime() - mDate.getTime() < 3600000); 
    const isReallyMissed = isPast && !isRunning && !m.completed;
    const meetingCats = categories.filter(c => (m.categoryIds || []).includes(c.id));

    return (
      <div key={m.id} className="relative flex items-start gap-4 group">
        <div className="flex flex-col items-center w-12 flex-shrink-0">
          <span className={`text-[10px] font-black mb-1 ${m.completed ? 'text-slate-300' : isReallyMissed ? 'text-red-500' : isRunning ? 'text-indigo-600' : 'text-slate-500'}`}>
            {mDate.getHours().toString().padStart(2, '0')}:{mDate.getMinutes().toString().padStart(2, '0')}
          </span>
          <div className={`w-3.5 h-3.5 rounded-full border-[3px] z-10 transition-all duration-500 ${m.completed ? 'bg-emerald-500 border-white shadow-sm' : isReallyMissed ? 'bg-red-500 border-red-100' : isRunning ? 'bg-indigo-600 border-indigo-100 animate-pulse' : 'bg-white border-slate-200 shadow-sm'}`} />
        </div>

        <div className={`flex-1 p-5 rounded-[32px] border transition-all duration-300 min-w-0 ${m.completed ? 'bg-slate-50 border-slate-100 opacity-60' : isReallyMissed ? 'bg-red-50/30 border-red-100' : isRunning ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100/30' : 'bg-white border-slate-50 shadow-sm'}`}>
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* Judul sekarang dipaksa blok dan wrap */}
              <h4 className={`block w-full font-bold text-[15px] leading-tight whitespace-normal break-words overflow-visible ${m.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {m.title}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {meetingCats.map(cat => (
                  <span key={cat.id} className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight" style={{ backgroundColor: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => setMeetings(prev => prev.filter(x => x.id !== m.id))} className="text-slate-200 hover:text-red-500 p-1 flex-shrink-0 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              {mDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
            <button onClick={() => setMeetings(prev => prev.map(x => x.id === m.id ? {...x, completed: !x.completed} : x))} className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${m.completed ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
              <CheckCircle2 size={14} />
              {m.completed ? 'Selesai' : 'Buka'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-24">
      <div className="px-6 pt-6 flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Timeline</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meeting & Agenda</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatManager(!showCatManager)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showCatManager ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400 border border-slate-100'}`}><Tag size={20} /></button>
          <button onClick={() => { setSelectedCatIds([]); setShowAddForm(true); }} className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-transform"><Plus size={24} /></button>
        </div>
      </div>

      {showCatManager && (
        <div className="px-6 mb-8 animate-in slide-in-from-top duration-300">
          <div className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Kelola Kategori</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-[10px] font-bold text-slate-700 uppercase">{c.name}</span>
                  <button onClick={() => setCategories(prev => prev.filter(x => x.id !== c.id))} className="text-slate-300 hover:text-red-500 transition-colors"><X size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Tambah kategori..." className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none" onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
              <button onClick={handleAddCategory} className="bg-indigo-600 text-white p-2 rounded-xl"><Plus size={18} /></button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 flex-1 space-y-10 overflow-y-auto no-scrollbar pb-12">
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2"><Clock size={16} /> Aktif</h3>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-400 px-2 py-1 rounded-lg">{activeMeetings.length}</span>
          </div>
          <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-indigo-50/50" />
          <div className="space-y-6">
            {paginatedActive.length === 0 ? <div className="ml-8 py-8 text-center bg-white rounded-[28px] border-2 border-dashed border-slate-100 text-slate-300 text-[10px] font-bold uppercase tracking-widest">Kosong</div> : paginatedActive.map(m => renderMeetingCard(m))}
          </div>
        </section>

        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><CheckCircle size={16} /> Riwayat</h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-lg">{completedMeetings.length}</span>
          </div>
          <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100" />
          <div className="space-y-6">{paginatedCompleted.map(m => renderMeetingCard(m))}</div>
        </section>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center px-4 pb-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800">Agenda Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2 bg-slate-50 rounded-full">✕</button>
            </div>
            <form onSubmit={handleAddMeeting} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Detail Agenda</label>
                <input name="title" type="text" autoFocus placeholder="Nama meeting..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Pilih Tag</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setSelectedCatIds(prev => prev.includes(cat.id) ? prev.filter(i => i !== cat.id) : [...prev, cat.id])} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all ${selectedCatIds.includes(cat.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-200'}`}>
                      <div className={`w-2 h-2 rounded-full ${selectedCatIds.includes(cat.id) ? 'bg-white' : ''}`} style={{ backgroundColor: selectedCatIds.includes(cat.id) ? undefined : cat.color }} />
                      <span className="text-[10px] font-black uppercase">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Waktu Mulai</label>
                <input name="startTime" type="datetime-local" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[32px] font-black text-sm shadow-xl active:scale-95 transition-all">SIMPAN KE TIMELINE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsView;
