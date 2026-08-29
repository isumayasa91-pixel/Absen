import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, UserPlus, FileSpreadsheet, KeyRound, Plus, Save, Search, CheckCircle2, QrCode, Trash2 } from 'lucide-react';

export const DataSiswaView: React.FC = () => {
  const {
    students,
    addStudent,
    importStudents,
    generateMassStudentAccounts,
    deleteStudent,
    classes,
  } = useApp();

  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('Semua Kelas');
  const [notification, setNotification] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [currentClass, setCurrentClass] = useState(classes[0]?.className || 'X IPA 1');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nisn.trim()) return;
    addStudent(fullName.trim(), currentClass, nisn.trim(), gender);
    setFullName('');
    setNisn('');
    setShowManualModal(false);
    showNotice(`Siswa ${fullName} berhasil ditambahkan!`);
  };

  const handleSimulatedImport = () => {
    const mock = [
      { fullName: 'Hendra Setiawan', currentClass: 'X IPA 1', nisn: '0089123001', gender: 'L' },
      { fullName: 'Intan Nuraini', currentClass: 'X IPA 2', nisn: '0089123002', gender: 'P' },
    ];
    importStudents(mock);
    setShowImportModal(false);
    showNotice('Data siswa berhasil diimport dari file Excel!');
  };

  const handleMassAccount = () => {
    generateMassStudentAccounts();
    showNotice('Akun login massal untuk seluruh siswa berhasil dibuat/diperbarui!');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.currentClass.toLowerCase().includes(searchQuery.toLowerCase());
    const matchClass = classFilter === 'Semua Kelas' || s.currentClass === classFilter;
    return matchQuery && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Data Peserta Didik / Siswa</h2>
            <p className="text-xs text-slate-500 font-medium">Manajemen master data siswa, NISN, RFID Tag, dan pembuatan akun login</p>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Generate Akun Massal */}
          <button
            onClick={handleMassAccount}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Generate Akun Massal</span>
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

      {/* Controls & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NISN..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Semua Kelas">Semua Kelas ({students.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        {/* Table Siswa */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">NISN</th>
                <th className="p-3">Kelas Aktif</th>
                <th className="p-3 text-center">Gender</th>
                <th className="p-3">Kartu RFID / QR</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi / Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-[10px]">
                      {s.fullName.charAt(0)}
                    </div>
                    <span>{s.fullName}</span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-600">{s.nisn}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {s.currentClass}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        s.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {s.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      <QrCode className="w-3 h-3 text-slate-500" />
                      <span>{s.rfidTag || `RFID-${s.nisn.slice(-4)}`}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus data siswa "${s.fullName}"?`)) {
                          deleteStudent(s.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Siswa Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              <span>Tambah Data Siswa Manual</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ahmad Rizky Saputra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* NISN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NISN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="10 Digit NISN (contoh: 0078912349)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Kelas Aktif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kelas Aktif <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentClass}
                  onChange={(e) => setCurrentClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.className}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jenis Kelamin / Gender <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('L')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      gender === 'L'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Laki-Laki (L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('P')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      gender === 'P'
                        ? 'bg-pink-600 text-white border-pink-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Perempuan (P)
                  </button>
                </div>
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
                  <span>Simpan Data Siswa</span>
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
              <span>Import Data Siswa Massal via Excel</span>
            </h3>

            <div className="p-4 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">Upload File .xlsx Format Data Siswa</p>
              <p className="text-[11px] text-emerald-700">Format: Nama Lengkap | Kelas | NISN | Gender (L/P)</p>
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
                Proses Import Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
