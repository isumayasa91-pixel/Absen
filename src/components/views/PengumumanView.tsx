import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import { Megaphone, Plus, Save, X, Calendar, User, Search, Pin, Trash2, Pencil } from 'lucide-react';

export const PengumumanView: React.FC = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, classes } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetClass, setTargetClass] = useState('Semua Kelas');

  // Edit states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTargetClass, setEditTargetClass] = useState('Semua Kelas');

  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addAnnouncement(title.trim(), content.trim(), targetClass);
    setTitle('');
    setContent('');
    setTargetClass('Semua Kelas');
    setShowModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editTitle.trim() || !editContent.trim()) return;
    updateAnnouncement(editingAnnouncement.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      targetClass: editTargetClass,
    });
    setEditingAnnouncement(null);
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.targetClass.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Pengumuman</h2>
              <p className="text-xs text-slate-500 font-medium">Buat dan kelola pengumuman sekolah untuk seluruh kelas</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengumuman</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kata kunci pengumuman atau target kelas..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
        />
      </div>

      {/* Announcements List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200 uppercase">
                    Target: {ann.targetClass}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-base leading-snug">{ann.title}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingAnnouncement(ann);
                      setEditTitle(ann.title);
                      setEditContent(ann.content);
                      setEditTargetClass(ann.targetClass);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Pengumuman"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus pengumuman "${ann.title}"?`)) {
                        deleteAnnouncement(ann.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Pengumuman Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line">{ann.content}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <div className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ann.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ann.date}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200/80 text-slate-400 text-xs font-medium">
            Belum ada pengumuman yang sesuai.
          </div>
        )}
      </div>

      {/* Modal Tambah Pengumuman */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>Tambah Pengumuman Baru</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Judul Pengumuman */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Ujian Tengah Semester & Kartu RFID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Isi Pengumuman */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Isi Pengumuman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan pesan lengkap pengumuman di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Target Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.className}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengumuman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pengumuman */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Edit Pengumuman</h3>
                  <p className="text-xs text-slate-500 font-medium">Ubah isi atau target kelas pengumuman</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Contoh: Libur Semester Ganjil"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Isi Pengumuman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Tuliskan detail informasi pengumuman..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editTargetClass}
                  onChange={(e) => setEditTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.className}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
