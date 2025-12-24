
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Clock, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Tag } from 'lucide-react';
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
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [now, setNow] = useState(new Date());
  
  // State untuk form
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);

  // Update waktu "sekarang" setiap 30 detik
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeMeetings = useMemo(() => {
    return meetings
      .filter(m => !m.completed)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [meetings]);

  const completedMeetings = useMemo(() => {
    return meetings
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
      categoryIds: [...selectedCatIds], // Memastikan array kategori tersalin
    };

    setMeetings(prev => [newM, ...prev]);
    setShowAddForm(false);
    setSelectedCatIds([]);
    setActivePage(1);
  };

  const toggleCategory = (id: string) => {
    setSelectedCatIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const renderMeetingCard = (m: Meeting) => {
    const mDate = new Date(m.startTime);
    const isPast = mDate.getTime() < now.getTime();
    const isRunning = isPast && (now.getTime() - mDate.getTime() < 3600000); 
    const isReallyMissed = isPast && !isRunning && !m.completed;

    // Ambil data lengkap kategori yang dipilih untuk meeting ini
    const meetingCats = categories.filter(c => (m.categoryIds || []).includes(c.id));

    return (
      <div key={m.id} className="relative flex items-start gap-4 group">
        {/* Indikator Waktu Samping */}
        <div className="flex flex-col items-center w-12 flex-shrink-0">
          <span className={`text-[10px] font-black mb-1 ${
            m.completed ? 'text-slate-300' : 
            isReallyMissed ? 'text-red-500' : 
            isRunning ? 'text-indigo-600' : 'text-slate-500'
          }`}>
            {mDate.getHours().toString().padStart(2, '0')}:{mDate.getMinutes().toString().padStart(2, '0')}
          </span>
          <div className={`w-3.5 h-3.5 rounded-full border-[3px] z-10 transition-all duration-500 ${
            m.completed ? 'bg-emerald-500 border-white shadow-sm' : 
            isReallyMissed ? 'bg-red-500 border-red-100 scale-110' : 
            isRunning ? 'bg-indigo-600 border-indigo-100 animate-pulse' : 'bg-white border-slate-200 shadow-sm'
          }`} />
        </div>

        {/* Kartu Meeting */}
        <div className={`flex-1 p-4 rounded-[28px] border transition-all duration-300 ${
          m.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 
          isReallyMissed ? 'bg-red-50/30 border-red-100 shadow-sm' : 
          isRunning ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100/50' : 
          'bg-white border-slate-50 shadow-sm hover:border-indigo-100'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col min-w-0">
              <h4 className={`font-bold text-sm truncate ${m.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {m.title}
              </h4>
              
              {/* Tampilan Kategori dalam bentuk Badge Teks */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {meetingCats.map(cat => (
                  <span 
                    key={cat.id} 
                    className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}
                  >
                    {cat.name}
                  </span>
                ))}
                
                {meetingCats.length === 0 && (
                  <span className="text-[8px] font-bold text-slate-300 uppercase italic">Tanpa Kategori</span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setMeetings(prev => prev.filter(x => x.id !== m.id))}
              className="text-slate-200 hover:text-red-500 p-1 transition-colors flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              {mDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>

            <button 
              onClick={() => setMeetings(prev => prev.map(x => x.id === m.id ? {...x, completed: !x.completed} : x))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                m.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 
                isReallyMissed ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <CheckCircle2 size={12} />
              {m.completed ? 'Selesai' : 'Selesaikan'}
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
        <button 
          onClick={() => {
            setSelectedCatIds([]);
            setShowAddForm(true);
          }}
          className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="px-6 flex-1 space-y-10 overflow-y-auto no-scrollbar pb-12">
        {/* AGENDA AKTIF */}
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={16} /> Aktif
            </h3>
            <div className="flex gap-2">
              {activeMeetings.some(m => new Date(m.startTime).getTime() < now.getTime()) && (
                <span className="text-[8px] font-black bg-red-100 text-red-500 px-2 py-1 rounded-lg uppercase animate-pulse">Terlewat!</span>
              )}
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-400 px-2 py-1 rounded-lg">
                {activeMeetings.length}
              </span>
            </div>
          </div>

          <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-indigo-50/50" />
          
          <div className="space-y-6">
            {paginatedActive.length === 0 ? (
              <div className="ml-8 py-8 text-center bg-white rounded-[28px] border-2 border-dashed border-slate-100">
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Tidak ada agenda</p>
              </div>
            ) : (
              paginatedActive.map(m => renderMeetingCard(m))
            )}

            {totalActivePages > 1 && (
              <div className="ml-8 flex items-center justify-between bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-100">
                <button onClick={() => setActivePage(p => Math.max(1, p - 1))} disabled={activePage === 1} className="p-1 disabled:opacity-20"><ChevronLeft size={16}/></button>
                <span className="text-[8px] font-black">{activePage} / {totalActivePages}</span>
                <button onClick={() => setActivePage(p => Math.min(totalActivePages, p + 1))} disabled={activePage === totalActivePages} className="p-1 disabled:opacity-20"><ChevronRight size={16}/></button>
              </div>
            )}
          </div>
        </section>

        {/* RIWAYAT SELESAI */}
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <CheckCircle size={16} /> Riwayat
            </h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-lg">
              {completedMeetings.length}
            </span>
          </div>

          <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100" />

          <div className="space-y-6">
            {paginatedCompleted.length === 0 ? (
              <div className="ml-8 py-8 text-center bg-white rounded-[28px] border-2 border-dashed border-slate-100">
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Belum ada riwayat</p>
              </div>
            ) : (
              paginatedCompleted.map(m => renderMeetingCard(m))
            )}

            {totalCompletedPages > 1 && (
              <div className="ml-8 flex items-center justify-between bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-100">
                <button onClick={() => setCompletedPage(p => Math.max(1, p - 1))} disabled={completedPage === 1} className="p-1 disabled:opacity-20"><ChevronLeft size={16}/></button>
                <span className="text-[8px] font-black">{completedPage} / {totalCompletedPages}</span>
                <button onClick={() => setCompletedPage(p => Math.min(totalCompletedPages, p + 1))} disabled={completedPage === totalCompletedPages} className="p-1 disabled:opacity-20"><ChevronRight size={16}/></button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL FORM TAMBAH AGENDA */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center px-4 pb-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800">Agenda Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2 bg-slate-50 rounded-full hover:text-red-500 transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleAddMeeting} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Detail Agenda</label>
                <input name="title" type="text" autoFocus placeholder="Contoh: Meeting Proyek A" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>

              {/* Pemilihan Kategori yang Lebih Jelas */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Tag Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const isSelected = selectedCatIds.includes(cat.id);
                    return (
                      <button 
                        key={cat.id} 
                        type="button" 
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : ''}`} style={{ backgroundColor: isSelected ? undefined : cat.color }} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Waktu Mulai</label>
                <input name="startTime" type="datetime-local" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[32px] font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                SIMPAN AGENDA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsView;
