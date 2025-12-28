
import React, { useState } from 'react';
import { Globe, ArrowRight, Plus, Trash2, Edit2, ExternalLink as ExternalLinkIcon, Check, X, AlertCircle } from 'lucide-react';
import { ExternalLink } from '../types.ts';

interface PortalViewProps {
  links: ExternalLink[];
  setLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>;
}

const PortalView: React.FC<PortalViewProps> = ({ links, setLinks }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: ''
  });

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', url: '' });
    setShowForm(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, link: ExternalLink) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(link.id);
    setFormData({
      name: link.name,
      description: link.description,
      url: link.url
    });
    setShowForm(true);
  };

  const handlePrepareDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleteConfirmId === id) {
      // Second click: perform delete
      setLinks(prev => prev.filter(link => link.id !== id));
      setDeleteConfirmId(null);
    } else {
      // First click: show confirmation state
      setDeleteConfirmId(id);
      // Reset confirmation if not clicked again within 3 seconds
      setTimeout(() => {
        setDeleteConfirmId(prev => prev === id ? null : prev);
      }, 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;

    let cleanUrl = formData.url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    if (editingId) {
      setLinks(prev => prev.map(l => l.id === editingId ? {
        ...l,
        name: formData.name,
        description: formData.description || 'Web app external.',
        url: cleanUrl
      } : l));
    } else {
      const newLink: ExternalLink = {
        id: generateId(),
        name: formData.name,
        description: formData.description || 'Web app external.',
        url: cleanUrl
      };
      setLinks(prev => [newLink, ...prev]);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', url: '' });
  };

  return (
    <div className="p-6 md:p-10 space-y-8 pb-32">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Portal Website</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daftar aplikasi eksternal terpilih</p>
        </div>
        
        {/* FITUR TAMBAH DINONAKTIFKAN SEMENTARA */}
        {/* 
        <button 
          onClick={handleOpenAdd}
          className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          <Plus size={28} />
        </button> 
        */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {links.length === 0 ? (
          <div className="col-span-full bg-white border-2 border-dashed border-slate-100 p-16 rounded-[40px] text-center">
            <p className="text-slate-300 text-xs font-black uppercase tracking-widest">Portal belum tersedia</p>
          </div>
        ) : (
          links.map((link) => (
            <div 
              key={link.id} 
              className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 relative group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Globe size={24} />
                </div>
                
                {/* FITUR EDIT & HAPUS DINONAKTIFKAN SEMENTARA */}
                {/* 
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleOpenEdit(e, link)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => handlePrepareDelete(e, link.id)}
                    className={`p-3 rounded-xl transition-all active:scale-90 flex items-center gap-2 ${
                      deleteConfirmId === link.id 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-100' 
                      : 'bg-red-50 text-red-400 hover:bg-red-100'
                    }`}
                    title={deleteConfirmId === link.id ? "Klik lagi untuk Hapus" : "Hapus"}
                  >
                    {deleteConfirmId === link.id ? <Check size={18} /> : <Trash2 size={18} />}
                    {deleteConfirmId === link.id && <span className="text-[8px] font-black uppercase">YAKIN?</span>}
                  </button>
                </div> 
                */}
              </div>

              <div className="flex-1 space-y-2 mb-8">
                <h3 className="text-lg font-black text-slate-800">{link.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium italic">
                  "{link.description}"
                </p>
              </div>

              <div className="mt-auto">
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all group-hover:bg-indigo-600"
                >
                  Kunjungi Website <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
          <div className="relative z-10 md:max-w-md">
            <h4 className="font-black text-lg uppercase tracking-tight mb-2">OmniPro Hub</h4>
            <p className="text-xs text-indigo-100 opacity-80 leading-relaxed font-medium">
              Integrasikan semua alat kerja eksternal Anda dalam satu dashboard pusat yang mudah diakses dari perangkat manapun.
            </p>
          </div>
          <ExternalLinkIcon className="absolute -right-4 -bottom-4 opacity-10 hidden md:block" size={180} />
          <ExternalLinkIcon className="absolute -right-2 -bottom-2 opacity-10 md:hidden" size={100} />
        </div>
      </div>

      {/* MODAL FORM TETAP ADA DI KODE TAPI TIDAK DAPAT DIPANGGIL KARENA BUTTON DIATAS DIKOMENTAR */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="bg-white w-full max-w-lg rounded-t-[44px] md:rounded-[44px] p-8 md:p-12 animate-in zoom-in-95 slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingId ? 'Update Portal' : 'Portal Baru'}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Website</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Nama Aplikasi</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Contoh: Admin Panel" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Deskripsi Ringkas</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Apa kegunaan link ini?" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">URL Tujuan</label>
                <input 
                  type="text" 
                  required
                  value={formData.url} 
                  onChange={e => setFormData({ ...formData, url: e.target.value })} 
                  placeholder="https://..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest mt-4"
              >
                {editingId ? 'SIMPAN PERUBAHAN' : 'TAMBAH KE PORTAL'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalView;
