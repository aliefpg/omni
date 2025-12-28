
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, X, ChevronLeft, ChevronRight, BarChart3, PieChart as PieIcon, LineChart } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { Transaction, FinanceCategory, TransactionType } from '../types.ts';

interface FinanceViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  categories: FinanceCategory[];
  setCategories: React.Dispatch<React.SetStateAction<FinanceCategory[]>>;
  itemsPerPage: number;
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

const FinanceView: React.FC<FinanceViewProps> = ({ 
  transactions, setTransactions, categories, setCategories, itemsPerPage
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
    const maxPages = Math.ceil(transactions.length / itemsPerPage) || 1;
    if (currentPage > maxPages) {
      setCurrentPage(maxPages);
    }
  }, [transactions.length, currentPage, itemsPerPage]);

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

  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return transactions.slice(start, start + itemsPerPage);
  }, [transactions, currentPage, itemsPerPage]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId) return;
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
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
      id: Math.random().toString(36).substr(2, 9),
      name: newCatName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
  };

  const deleteCategory = (id: string) => {
    if (categories.length <= 1) return;
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
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 pb-32 max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Balance Card */}
        <div className="flex-1 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
          <div>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-70">Total Saldo</p>
            <h2 className="text-4xl md:text-5xl font-black mt-2 tracking-tighter">{formatIDR(totalBalance)}</h2>
          </div>
          <div className="flex gap-4 mt-10">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Pemasukan</p>
              <p className="text-lg font-bold text-white">{formatIDR(transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0))}</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Pengeluaran</p>
              <p className="text-lg font-bold text-white">{formatIDR(transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0))}</p>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="md:w-80 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</h3>
            <button 
              onClick={() => setShowCatForm(!showCatForm)}
              className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              {showCatForm ? 'Selesai' : 'Edit'}
            </button>
          </div>
          <div className="flex flex-wrap md:flex-col gap-2 max-h-[220px] overflow-y-auto no-scrollbar">
            {categories.map(c => (
              <div 
                key={c.id} 
                className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{c.name}</span>
                </div>
                {showCatForm && (
                  <button onClick={() => deleteCategory(c.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {showCatForm && (
              <div className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Baru..."
                  className="flex-1 text-xs bg-white border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-50"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button onClick={handleAddCategory} className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform">
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accumulation Chart */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><LineChart size={20} /></div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Trend Akumulasi Saldo</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waveData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
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

        {/* Allocation Pie Chart */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 text-pink-500 rounded-xl"><PieIcon size={20} /></div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Alokasi Pengeluaran</h3>
          </div>
          <div className="h-64 w-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Out</p>
              <p className="text-sm font-black text-slate-800">{formatIDR(totalPieExpense)}</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55} 
                  outerRadius={75} 
                  paddingAngle={5} 
                  dataKey="value" 
                  animationDuration={1000}
                  label={renderCustomizedLabel}
                >
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="#fff" strokeWidth={3} />)}
                </Pie>
                <Tooltip formatter={(val: number) => formatIDR(val)} />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Riwayat Transaksi</h3>
          <button onClick={() => setShowAddForm(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest">
            + Catat Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-xs font-bold uppercase">Belum ada transaksi</div>
          ) : (
            <>
              {paginatedTransactions.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 flex justify-between items-center group hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: cat?.color || '#cbd5e1' }}>
                        {cat?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{cat?.name || 'Lainnya'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t.date} • {t.note || 'Cash'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-700'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                      </p>
                      <button onClick={() => deleteTransaction(t.id)} className="text-slate-200 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {totalPages > 1 && (
                <div className="col-span-full flex items-center justify-between px-4 pt-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-30">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-30">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="bg-white w-full max-w-lg rounded-t-[44px] md:rounded-[44px] p-8 md:p-12 animate-in zoom-in-95 slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Catat Keuangan</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-3 bg-slate-50 rounded-2xl">✕</button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-6">
              <div className="flex bg-slate-100 p-2 rounded-2xl">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest ${formData.type === 'expense' ? 'bg-white text-red-500 shadow-lg' : 'text-slate-500'}`}>Keluar</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-500'}`}>Masuk</button>
              </div>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl tracking-tighter">Rp</span>
                <input type="text" inputMode="numeric" autoFocus value={formatNumericInput(formData.amount)} onChange={e => setFormData({ ...formData, amount: e.target.value.replace(/\D/g, '') })} placeholder="0" className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 pl-16 text-3xl font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Kategori</label>
                  <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Tanggal</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Catatan</label>
                <input type="text" placeholder="Beli apa?" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest mt-4">SIMPAN DATA</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
