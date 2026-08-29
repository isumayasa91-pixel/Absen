import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherPosition } from '../../types';
import { UserCheck, UserPlus, FileSpreadsheet, KeyRound, Save, Search, CheckCircle2, Phone, Briefcase } from 'lucide-react';

export const DataGuruView: React.FC = () => {
  const {
    teachers,
    addTeacher,
    importTeachers,
    generateMassTeacherAccounts,
  } = useApp();

  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  // Form state
  const [fullNameWithTitle, setFullNameWithTitle] = useState('');
  const [nip, setNip] = useState('');
  const [position, setPosition] = useState<TeacherPosition>('Guru Mapel');
  const [phone, setPhone] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameWithTitle.trim() || !nip.trim()) return;
    addTeacher(fullNameWithTitle.trim(), nip.trim(), position, phone);
    setFullNameWithTitle('');
    setNip('');
    setPhone('');
    setShowManualModal(false);
    showNotice(`Guru ${fullNameWithTitle} berhasil ditambahkan!`);
  };

  const handleSimulatedImport = () => {
    const mock = [
      { fullNameWithTitle: 'Dra. Hj. Nurhayati, M.Pd', nip: '19780112 200212 2 004', position: 'Guru Mapel' as TeacherPosition },
      { fullNameWithTitle: 'Agus Subagyo, S.Kom', nip: '19890405 201402 1 003', position: 'Guru Mapel' as TeacherPosition },
    ];
    importTeachers(mock);
    setShowImportModal(false);
    showNotice('Data guru berhasil diimport!');
  };

  const handleMassAccount = () => {
    generateMassTeacherAccounts();
    showNotice('Akun login massal untuk seluruh guru berhasil dibuat!');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullNameWithTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.includes(searchQuery) ||
      t.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Data Tenaga Pendidik / Guru</h2>
            <p className="text-xs text-slate-500 font-medium">Manajemen master pendidik, NIP, jabatan tugas tambahan, dan akses login</p>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Generate Akun Masal */}
          <button
            onClick={handleMassAccount}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Generate Akun Masal</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel</span>
          </button>

          {/* Tambah Manual */}
          <button
            onClick={() => setShowManualModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Table & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama guru beserta gelar, NIP, atau jabatan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Table Guru */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Lengkap Beserta Gelar</th>
                <th className="p-3">NIP</th>
                <th className="p-3">Jabatan (Dropdown)</th>
                <th className="p-3">Kontak WA / HP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-black flex items-center justify-center text-xs shrink-0">
                      {t.fullNameWithTitle.charAt(0)}
                    </div>
                    <span>{t.fullNameWithTitle}</span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-600">{t.nip}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center space-x-1 ${
                        t.position === 'Kepala Sekolah'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : t.position === 'Guru BK'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : t.position === 'Wali Kelas'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Briefcase className="w-3 h-3" />
                      <span>{t.position}</span>
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    <span className="inline-flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{t.phone || '08123456789'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Tambah Data Guru Manual</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Nama Lengkap Beserta Gelar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Beserta Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullNameWithTitle}
                  onChange={(e) => setFullNameWithTitle(e.target.value)}
                  placeholder="Contoh: Drs. H. Suryono, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* NIP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIP / NUPTK <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Format: 19820315 200801 1 005"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Jabatan Dropdown (Guru Mapel, Wali Kelas, Guru BK, Kepala Sekolah) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jabatan (Dropdown) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as TeacherPosition)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Guru Mapel">Guru Mapel</option>
                  <option value="Wali Kelas">Wali Kelas</option>
                  <option value="Guru BK">Guru BK</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                </select>
              </div>

              {/* Kontak */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data Guru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Data Guru dari Excel</span>
            </h3>

            <div className="p-4 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">Upload File .xlsx Format Data Guru</p>
              <p className="text-[11px] text-emerald-700">Format: Nama Lengkap Beserta Gelar | NIP | Jabatan</p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSimulatedImport}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 cursor-pointer"
              >
                Proses Import Guru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
