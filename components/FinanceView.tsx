import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, X, ChevronLeft, ChevronRight, BarChart3, PieChart as PieIcon, LineChart } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { Transaction, FinanceCategory, TransactionType } from '../types';

interface FinanceViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  categories: FinanceCategory[];
  setCategories: React.Dispatch<React.SetStateAction<FinanceCategory[]>>;
}

const formatIDR = (amount: number) => {
  return "Rp " + new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumericInput = (val: string) => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(digits));
};

const ITEMS_PER_PAGE = 5;

const FinanceView: React.FC<FinanceViewProps> = ({ 
  transactions, setTransactions, categories, setCategories 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as TransactionType,
    categoryId: categories[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    const maxPages = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > maxPages) {
      setCurrentPage(maxPages);
    }
  }, [transactions.length, currentPage]);

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const waveData = useMemo(() => {
    const dailyDiffs = transactions.reduce((acc, t) => {
      const date = t.date;
      const val = t.type === 'income' ? t.amount : -t.amount;
      acc[date] = (acc[date] || 0) + val;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(dailyDiffs).sort();
    let runningBalance = 0;
    const points = [];

    if (sortedDates.length > 0) {
      const firstDate = new Date(sortedDates[0]);
      const prevDate = new Date(firstDate);
      prevDate.setDate(firstDate.getDate() - 1);
      points.push({ date: prevDate.toISOString().split('T')[0], balance: 0 });
    } else {
      points.push({ date: 'Mulai', balance: 0 });
    }

    sortedDates.forEach(date => {
      runningBalance += dailyDiffs[date];
      points.push({ date, balance: runningBalance });
    });

    return points;
  }, [transactions]);

  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return categories.map(c => ({
      name: c.name,
      value: grouped[c.id] || 0,
      color: c.color
    })).filter(d => d.value > 0);
  }, [transactions, categories]);

  const totalPieExpense = useMemo(() => pieData.reduce((sum, item) => sum + item.value, 0), [pieData]);

  const barData = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      const date = t.date;
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      if (t.type === 'income') acc[date].income += t.amount;
      else acc[date].expense += t.amount;
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    const values = Object.values(grouped) as Array<{ date: string; income: number; expense: number }>;
    return values.sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  }, [transactions]);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(start, start + ITEMS_PER_PAGE);
  }, [transactions, currentPage]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId) return;
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: parseFloat(formData.amount),
      type: formData.type,
      categoryId: formData.categoryId,
      date: formData.date,
      note: formData.note
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setCurrentPage(1);
    setShowAddForm(false);
    setFormData({ ...formData, amount: '', note: '' });
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const colors = ['#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];
    const newCat: FinanceCategory = {
      id: crypto.randomUUID(),
      name: newCatName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
  };

  const deleteCategory = (id: string) => {
    if (categories.length <= 1) return; // Sisakan minimal 1 kategori
    setCategories(prev => prev.filter(c => c.id !== id));
    setTransactions(prev => prev.map(t => t.categoryId === id ? { ...t, categoryId: categories.find(c => c.id !== id)?.id || '' } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, color }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={color} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central" 
        className="text-[10px] font-bold"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Category Management Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Kategori Keuangan</h3>
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

      {/* Saldo Utama */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100">
        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-70">Total Saldo</p>
        <h2 className="text-3xl font-black mt-1 tracking-tight">{formatIDR(totalBalance)}</h2>
        <div className="flex gap-4 mt-6">
          <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
               <p className="text-[10px] font-bold uppercase text-indigo-50">Masuk</p>
            </div>
            <p className="text-sm font-bold text-white tracking-wide">{formatIDR(transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0))}</p>
          </div>
          <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
               <p className="text-[10px] font-bold uppercase text-indigo-50">Keluar</p>
            </div>
            <p className="text-sm font-bold text-white tracking-wide">{formatIDR(transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0))}</p>
          </div>
        </div>
      </div>

      {/* 1. Grafik Trend (Area) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LineChart size={18} className="text-indigo-500" />
          <h3 className="font-bold text-slate-700">Trend Akumulasi Saldo</h3>
        </div>
        <div className="h-52 w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={waveData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip formatter={(val: number) => [formatIDR(val), 'Saldo']} />
              <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={4} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Grafik Proporsi (Pie) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <PieIcon size={18} className="text-pink-500" />
          <h3 className="font-bold text-slate-700 text-sm">Alokasi Pengeluaran</h3>
        </div>
        <div className="h-64 w-full relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
            <p className="text-xs font-black text-slate-800">{formatIDR(totalPieExpense)}</p>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={pieData} 
                cx="50%" 
                cy="50%" 
                innerRadius={40} 
                outerRadius={60} 
                paddingAngle={5} 
                dataKey="value" 
                animationDuration={1000}
                labelLine={true}
                label={renderCustomizedLabel}
              >
                {pieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="#fff" strokeWidth={2} />)}
              </Pie>
              <Tooltip formatter={(val: number) => formatIDR(val)} />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => {
                return <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{value}</span>;
              }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Grafik Aktivitas (Bar) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-green-500" />
          <h3 className="font-bold text-slate-700 text-sm">Aktivitas Mingguan</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <Tooltip formatter={(val: number) => formatIDR(val)} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Daftar Transaksi (Paginasi 5 Item) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Riwayat Transaksi</h3>
          <button onClick={() => setShowAddForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all">
            + CATAT
          </button>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-sm italic">Belum ada transaksi</div>
          ) : (
            <>
              {paginatedTransactions.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: cat?.color || '#cbd5e1' }}>
                        {cat?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{cat?.name || 'Lainnya'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{t.date} • {t.note || 'Tanpa Catatan'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-bold text-sm ${t.type === 'income' ? 'text-green-500' : 'text-slate-700'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                      </p>
                      <button onClick={() => deleteTransaction(t.id)} className="text-slate-200 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Modal Add */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tambah Catatan</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-5">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-3 rounded-xl text-sm font-bold ${formData.type === 'expense' ? 'bg-white text-red-500 shadow-md' : 'text-slate-500'}`}>Keluar</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-3 rounded-xl text-sm font-bold ${formData.type === 'income' ? 'bg-white text-green-600 shadow-md' : 'text-slate-500'}`}>Masuk</button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                <input type="text" inputMode="numeric" autoFocus value={formatNumericInput(formData.amount)} onChange={e => setFormData({ ...formData, amount: e.target.value.replace(/\D/g, '') })} placeholder="0" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" />
              </div>
              <input type="text" placeholder="Catatan (opsional)" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" />
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">SIMPAN</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;