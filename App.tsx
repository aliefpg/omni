
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Calendar, 
  CheckSquare, 
  Settings
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
  
  // Finance State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('omni_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>(() => {
    const saved = localStorage.getItem('omni_f_categories');
    return saved ? JSON.parse(saved) : INITIAL_FINANCE_CATEGORIES;
  });

  // Meetings State
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('omni_meetings');
    return saved ? JSON.parse(saved) : [];
  });
  const [meetingCategories, setMeetingCategories] = useState<MeetingCategory[]>(() => {
    const saved = localStorage.getItem('omni_m_categories');
    return saved ? JSON.parse(saved) : INITIAL_MEETING_CATEGORIES;
  });

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('omni_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>(() => {
    const saved = localStorage.getItem('omni_t_categories');
    return saved ? JSON.parse(saved) : INITIAL_TASK_CATEGORIES;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('omni_transactions', JSON.stringify(transactions));
    localStorage.setItem('omni_f_categories', JSON.stringify(financeCategories));
    localStorage.setItem('omni_meetings', JSON.stringify(meetings));
    localStorage.setItem('omni_m_categories', JSON.stringify(meetingCategories));
    localStorage.setItem('omni_tasks', JSON.stringify(tasks));
    localStorage.setItem('omni_t_categories', JSON.stringify(taskCategories));
  }, [transactions, financeCategories, meetings, meetingCategories, tasks, taskCategories]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden relative border-x border-slate-200">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {activeTab === 'finance' && 'Keuangan'}
            {activeTab === 'meetings' && 'Meeting'}
            {activeTab === 'tasks' && 'Tugas'}
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest">OMNIPRO SUITE</p>
        </div>
        <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
          <Settings size={20} />
        </button>
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

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-lg">
        <NavButton 
          active={activeTab === 'finance'} 
          onClick={() => setActiveTab('finance')}
          icon={<Wallet size={24} />}
          label="Finance"
        />
        <NavButton 
          active={activeTab === 'meetings'} 
          onClick={() => setActiveTab('meetings')}
          icon={<Calendar size={24} />}
          label="Meeting"
        />
        <NavButton 
          active={activeTab === 'tasks'} 
          onClick={() => setActiveTab('tasks')}
          icon={<CheckSquare size={24} />}
          label="Tugas"
        />
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
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${
      active ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-500'
    }`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);
