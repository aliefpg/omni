
import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  Calendar, 
  CheckSquare, 
  Settings,
  Database,
  Trash2,
  LayoutGrid,
  Menu,
  X,
  Download,
  Upload,
  Layers,
  AlertTriangle
} from 'lucide-react';
import FinanceView from './components/FinanceView.tsx';
import MeetingsView from './components/MeetingsView.tsx';
import TasksView from './components/TasksView.tsx';
import PortalView from './components/PortalView.tsx';
import { Transaction, Meeting, Task, FinanceCategory, TaskCategory, MeetingCategory, ExternalLink } from './types.ts';

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

const DEFAULT_PORTAL_LINKS: ExternalLink[] = [
  {
    id: 'p1',
    name: 'Dashboard Analytics',
    description: 'Monitor performa bisnis dan visualisasi data real-time.',
    url: 'https://example.com/analytics'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'finance' | 'meetings' | 'tasks' | 'portal'>('finance');
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const saved = localStorage.getItem('omni_items_per_page');
    return saved ? parseInt(saved) : 10;
  });

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
  const [portalLinks, setPortalLinks] = useState<ExternalLink[]>(() => {
    const saved = localStorage.getItem('omni_portal_links');
    return saved ? JSON.parse(saved) : DEFAULT_PORTAL_LINKS;
  });

  useEffect(() => {
    localStorage.setItem('omni_transactions', JSON.stringify(transactions));
    localStorage.setItem('omni_f_categories', JSON.stringify(financeCategories));
    localStorage.setItem('omni_meetings', JSON.stringify(meetings));
    localStorage.setItem('omni_m_categories', JSON.stringify(meetingCategories));
    localStorage.setItem('omni_tasks', JSON.stringify(tasks));
    localStorage.setItem('omni_t_categories', JSON.stringify(taskCategories));
    localStorage.setItem('omni_portal_links', JSON.stringify(portalLinks));
    localStorage.setItem('omni_items_per_page', itemsPerPage.toString());
  }, [transactions, financeCategories, meetings, meetingCategories, tasks, taskCategories, portalLinks, itemsPerPage]);

  const exportData = () => {
    const fullData = {
      transactions, financeCategories, meetings, meetingCategories, tasks, taskCategories, portalLinks,
      version: '2.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions) setTransactions(data.transactions);
        if (data.meetings) setMeetings(data.meetings);
        if (data.tasks) setTasks(data.tasks);
        if (data.portalLinks) setPortalLinks(data.portalLinks);
        if (data.financeCategories) setFinanceCategories(data.financeCategories);
        if (data.taskCategories) setTaskCategories(data.taskCategories);
        if (data.meetingCategories) setMeetingCategories(data.meetingCategories);
        alert('Data berhasil diimpor!');
        setShowSettings(false);
      } catch (err) {
        alert('Format file tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  const navItems = [
    { id: 'finance', label: 'Finance', icon: <Wallet size={20} /> },
    { id: 'meetings', label: 'Meeting', icon: <Calendar size={20} /> },
    { id: 'tasks', label: 'Tugas', icon: <CheckSquare size={20} /> },
    { id: 'portal', label: 'Portal', icon: <LayoutGrid size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* Sidebar - Only Desktop */}
      <aside className={`hidden md:flex flex-col w-64 bg-white border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full w-0 overflow-hidden'}`}>
        <div className="p-8">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">OmniPro</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Professional Suite</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button 
            onClick={() => setShowSettings(true)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${showSettings ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Settings size={20} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header - Adaptive */}
        <header className="px-6 py-4 md:py-6 bg-white/80 backdrop-blur-md flex justify-between items-center z-40 border-b border-slate-100 md:border-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase md:hidden">Mobile Pro APK</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all md:hidden">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic View Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
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
            {activeTab === 'portal' && (
              <PortalView links={portalLinks} setLinks={setPortalLinks} />
            )}
          </div>
        </div>

        {/* Bottom Nav - Only Mobile */}
        <nav className="md:hidden bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)} 
              className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              <div className={`p-1 ${activeTab === item.id ? 'scale-110' : ''}`}>{item.icon}</div>
              <span className={`text-[8px] font-black uppercase tracking-wider ${activeTab === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Optimized Settings Modal - Floating and Compact */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-12">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={() => setShowSettings(false)}></div>
          
          <div className="bg-white rounded-[40px] w-full max-w-lg max-h-[85vh] overflow-y-auto no-scrollbar p-6 md:p-10 animate-in zoom-in-95 duration-200 relative shadow-2xl">
            <button 
              onClick={() => setShowSettings(false)} 
              className="absolute right-6 top-6 text-slate-300 p-2 hover:bg-slate-50 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>
            
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-sm">
                  <Database size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Settings</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Konfigurasi Aplikasi</p>
                </div>
              </div>

              {/* Items Per Page Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-indigo-500" />
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Tampilan</h3>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-600">Item per halaman</span>
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-xs font-black">{itemsPerPage}</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="5" 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>
              </div>

              {/* Backup & Restore Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-indigo-500" />
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Data Management</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={exportData}
                    className="flex flex-col items-center gap-3 p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all active:scale-95 group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Download size={20} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 text-center">Ekspor JSON</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all active:scale-95 group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Upload size={20} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 text-center">Impor Data</span>
                    <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-red-500" />
                  <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Danger Zone</h3>
                </div>
                <button 
                  onClick={() => { if(confirm('Hapus semua data secara permanen?')) { setTransactions([]); setMeetings([]); setTasks([]); setPortalLinks(DEFAULT_PORTAL_LINKS); } }} 
                  className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 hover:bg-red-100 rounded-[2rem] text-red-600 transition-colors active:scale-[0.98] font-black text-xs uppercase tracking-widest"
                >
                  <Trash2 size={18} />
                  Hapus Semua Data
                </button>
              </div>

              <button 
                onClick={() => setShowSettings(false)} 
                className="w-full bg-slate-900 text-white py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  