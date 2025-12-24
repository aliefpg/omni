
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Calendar, 
  CheckSquare, 
  Settings,
  Download,
  X,
  Smartphone,
  Upload,
  Database,
  Trash2,
  ListOrdered
} from 'lucide-react';
import FinanceView from './components/FinanceView.tsx';
import MeetingsView from './components/MeetingsView.tsx';
import TasksView from './components/TasksView.tsx';
import { Transaction, Meeting, Task, FinanceCategory, TaskCategory, MeetingCategory } from './types.ts';

const INITIAL_FINANCE_CATEGORIES: FinanceCategory[] = [
  { id: '1', name: 'Makan', color: '#ef4444' },
  { id: '2', name: 'Transport', color: '#3b82f6' },
  { id: '3', name: 'Hiburan', color: '#a855f7' },
  { id: '4', name: 'Tagihan', color: '#f59e0b' },
];

const INITIAL_TASK_CATEGORIES: TaskCategory[] = [
  { id: 't1', name: 'Kerja', color: '#3b82f6' },
  { id: 't2', name: 'Pribadi', color: '#10b981' },
  { id: 't3', name: 'Penting', color: '#ef4444' },
];

const INITIAL_MEETING_CATEGORIES: MeetingCategory[] = [
  { id: 'm1', name: 'Project', color: '#6366f1' },
  { id: 'm2', name: 'Client', color: '#ec4899' },
  { id: 'm3', name: 'Internal', color: '#94a3b8' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'finance' | 'meetings' | 'tasks'>('finance');
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // App Config
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const saved = localStorage.getItem('omni_items_per_page');
    return saved ? parseInt(saved) : 5;
  });

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('omni_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>(() => {
    const saved = localStorage.getItem('omni_f_categories');
    return saved ? JSON.parse(saved) : INITIAL_FINANCE_CATEGORIES;
  });
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('omni_meetings');
    return saved ? JSON.parse(saved) : [];
  });
  const [meetingCategories, setMeetingCategories] = useState<MeetingCategory[]>(() => {
    const saved = localStorage.getItem('omni_m_categories');
    return saved ? JSON.parse(saved) : INITIAL_MEETING_CATEGORIES;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('omni_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>(() => {
    const saved = localStorage.getItem('omni_t_categories');
    return saved ? JSON.parse(saved) : INITIAL_TASK_CATEGORIES;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('omni_transactions', JSON.stringify(transactions));
    localStorage.setItem('omni_f_categories', JSON.stringify(financeCategories));
    localStorage.setItem('omni_meetings', JSON.stringify(meetings));
    localStorage.setItem('omni_m_categories', JSON.stringify(meetingCategories));
    localStorage.setItem('omni_tasks', JSON.stringify(tasks));
    localStorage.setItem('omni_t_categories', JSON.stringify(taskCategories));
    localStorage.setItem('omni_items_per_page', itemsPerPage.toString());
  }, [transactions, financeCategories, meetings, meetingCategories, tasks, taskCategories, itemsPerPage]);

  const handleExportData = () => {
    const fullData = {
      transactions, financeCategories, meetings, meetingCategories, tasks, taskCategories,
      itemsPerPage, version: "1.2",
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omnipro_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm('Import data akan menimpa data saat ini. Lanjutkan?')) {
          if (data.transactions) setTransactions(data.transactions);
          if (data.meetings) setMeetings(data.meetings);
          if (data.tasks) setTasks(data.tasks);
          if (data.itemsPerPage) setItemsPerPage(data.itemsPerPage);
          alert('Berhasil!');
          setShowSettings(false);
        }
      } catch (err) { alert('File tidak valid!'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden relative border-x border-slate-200">
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {activeTab === 'finance' && 'Keuangan'}
            {activeTab === 'meetings' && 'Meeting'}
            {activeTab === 'tasks' && 'Tugas'}
          </h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">OMNIPRO SUITE</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInstallGuide(true)} className="p-2 bg-indigo-50 rounded-full text-indigo-600"><Download size={18} /></button>
          <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-50 rounded-full text-slate-400"><Settings size={18} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {activeTab === 'finance' && (
          <FinanceView 
            transactions={transactions} setTransactions={setTransactions}
            categories={financeCategories} setCategories={setFinanceCategories}
            itemsPerPage={itemsPerPage}
          />
        )}
        {activeTab === 'meetings' && (
          <MeetingsView 
            meetings={meetings} setMeetings={setMeetings}
            categories={meetingCategories} setCategories={setMeetingCategories}
            itemsPerPage={itemsPerPage}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksView 
            tasks={tasks} setTasks={setTasks}
            categories={taskCategories} setCategories={setTaskCategories}
            itemsPerPage={itemsPerPage}
          />
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-xs p-8 animate-in zoom-in duration-300 relative shadow-2xl">
            <button onClick={() => setShowSettings(false)} className="absolute right-6 top-6 text-slate-300">✕</button>
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-2">
                  <Database size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Settings</h2>
              </div>

              <div className="bg-slate-50 p-4 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <ListOrdered size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Tampilan</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">Item per Halaman</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold outline-none"
                  >
                    <option value={5}>5 Item</option>
                    <option value={10}>10 Item</option>
                    <option value={15}>15 Item</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button onClick={handleExportData} className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl text-indigo-700 text-sm font-bold">
                  <span>Ekspor Data</span>
                  <Download size={16} />
                </button>
                <label className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-sm font-bold cursor-pointer">
                  <span>Impor Data</span>
                  <Upload size={16} />
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
                <button onClick={() => { if(confirm('Hapus semua?')) { setTransactions([]); setMeetings([]); setTasks([]); } }} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl text-red-600 text-sm font-bold">
                  <span>Reset Data</span>
                  <Trash2 size={16} />
                </button>
              </div>

              <button onClick={() => setShowSettings(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm">Selesai</button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50">
        <NavButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet size={22} />} label="Finance" />
        <NavButton active={activeTab === 'meetings'} onClick={() => setActiveTab('meetings')} icon={<Calendar size={22} />} label="Meeting" />
        <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare size={22} />} label="Tugas" />
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-indigo-600' : 'text-slate-300'}`}>
    <div className={`p-1 ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);
