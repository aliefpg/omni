import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Calendar, 
  CheckSquare, 
  Settings,
  Download,
  X,
  Smartphone,
  Info,
  Upload,
  Database,
  FileJson,
  Trash2,
  RefreshCw
} from 'lucide-react';
import FinanceView from './components/FinanceView';
import MeetingsView from './components/MeetingsView';
import TasksView from './components/TasksView';
import { Transaction, Meeting, Task, FinanceCategory, TaskCategory, MeetingCategory } from './types';

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
  }, [transactions, financeCategories, meetings, meetingCategories, tasks, taskCategories]);

  // Export Data to JSON
  const handleExportData = () => {
    const fullData = {
      transactions, financeCategories, meetings, meetingCategories, tasks, taskCategories,
      version: "1.0",
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    link.href = url;
    link.download = `omnipro_backup_${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Data from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Basic structure validation
        if (!data.transactions && !data.meetings && !data.tasks) {
          throw new Error("File tidak mengandung data yang valid.");
        }

        if (confirm('Import data akan menimpa data saat ini. Apakah Anda yakin?')) {
          if (data.transactions) setTransactions(data.transactions);
          if (data.financeCategories) setFinanceCategories(data.financeCategories);
          if (data.meetings) setMeetings(data.meetings);
          if (data.meetingCategories) setMeetingCategories(data.meetingCategories);
          if (data.tasks) setTasks(data.tasks);
          if (data.taskCategories) setTaskCategories(data.taskCategories);
          
          alert('Berhasil! Data Anda telah diperbarui.');
          setShowSettings(false);
        }
      } catch (err) {
        alert('Gagal mengimpor file: ' + (err instanceof Error ? err.message : 'Format tidak dikenal'));
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Reset All Data
  const handleResetData = () => {
    if (confirm('PERINGATAN: Semua data Anda akan dihapus permanen. Lanjutkan?')) {
      if (confirm('Sekali lagi, apakah Anda yakin ingin menghapus semuanya?')) {
        setTransactions([]);
        setFinanceCategories(INITIAL_FINANCE_CATEGORIES);
        setMeetings([]);
        setMeetingCategories(INITIAL_MEETING_CATEGORIES);
        setTasks([]);
        setTaskCategories(INITIAL_TASK_CATEGORIES);
        alert('Data berhasil dikosongkan.');
        setShowSettings(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden relative border-x border-slate-200">
      {/* Header */}
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
          <button 
            onClick={() => setShowInstallGuide(true)}
            className="p-2 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors"
            title="Cara Download"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            title="Pengaturan"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {activeTab === 'finance' && (
          <FinanceView 
            transactions={transactions} 
            setTransactions={setTransactions}
            categories={financeCategories}
            setCategories={setFinanceCategories}
          />
        )}
        {activeTab === 'meetings' && (
          <MeetingsView 
            meetings={meetings} 
            setMeetings={setMeetings}
            categories={meetingCategories}
            setCategories={setMeetingCategories}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksView 
            tasks={tasks} 
            setTasks={setTasks}
            categories={taskCategories}
            setCategories={setTaskCategories}
          />
        )}
      </main>

      {/* Settings Modal (Data Management) */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-xs p-8 animate-in zoom-in duration-300 relative shadow-2xl">
            <button onClick={() => setShowSettings(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600">
              <X size={24} />
            </button>
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Database size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Manajemen Data</h2>
                <p className="text-slate-500 text-[10px] leading-relaxed mt-1">
                  Amankan catatan Anda dengan fitur backup.
                </p>
              </div>

              <div className="space-y-3">
                {/* Export Button */}
                <button 
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-4 bg-indigo-50 rounded-2xl text-indigo-700 hover:bg-indigo-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileJson size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Download Backup</span>
                  </div>
                  <Download size={16} />
                </button>

                {/* Import Button */}
                <label className="w-full flex items-center justify-between p-4 bg-emerald-50 rounded-2xl text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Upload size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Pulihkan Data</span>
                  </div>
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>

                {/* Reset Button */}
                <button 
                  onClick={handleResetData}
                  className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl text-red-600 hover:bg-red-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-red-700">Hapus Semua Data</span>
                  </div>
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                  Semua data disimpan di <span className="font-bold italic">LocalStorage</span> perangkat ini dan tidak dikirim ke server mana pun.
                </p>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-xs p-8 animate-in zoom-in duration-300 relative shadow-2xl">
            <button onClick={() => setShowInstallGuide(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600">
              <X size={24} />
            </button>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Smartphone size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Install ke HP</h2>
              <p className="text-slate-500 text-xs leading-relaxed">
                Jadikan website ini sebagai aplikasi di layar utama Anda.
              </p>
              
              <div className="text-left space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Android (Chrome)</p>
                  <p className="text-[11px] text-slate-600 font-medium">Klik titik tiga <span className="font-bold">⋮</span> lalu pilih <span className="font-bold">"Install App"</span>.</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-pink-600 uppercase mb-1">iPhone (Safari)</p>
                  <p className="text-[11px] text-slate-600 font-medium">Klik ikon <span className="font-bold">Share</span> lalu pilih <span className="font-bold">"Add to Home Screen"</span>.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInstallGuide(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm mt-4 active:scale-95 transition-all"
              >
                Siap!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <NavButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet size={22} />} label="Finance" />
        <NavButton active={activeTab === 'meetings'} onClick={() => setActiveTab('meetings')} icon={<Calendar size={22} />} label="Meeting" />
        <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare size={22} />} label="Tugas" />
      </nav>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${active ? 'text-indigo-600' : 'text-slate-300'}`}
  >
    <div className={`p-1 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-wider transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    {active && <div className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full animate-pulse" />}
  </button>
);
