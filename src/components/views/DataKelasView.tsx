import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, FileSpreadsheet, Plus, Save, Users, CheckCircle2, Upload, Trash2, AlertCircle } from 'lucide-react';

export const DataKelasView: React.FC = () => {
  const { classes, addClass, importClasses, deleteClass, clearAllClasses, teachers, academicYears } = useApp();
  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const activeAY = academicYears.find((y) => y.isActive) || academicYears[0];

  // Manual Form
  const [className, setClassName] = useState('');
  const [homeroomTeacher, setHomeroomTeacher] = useState(teachers[0]?.fullNameWithTitle || 'Budi Santoso, M.Pd');
  const [academicYear, setAcademicYear] = useState(activeAY?.yearName || '2026/2027');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    addClass(className.trim(), homeroomTeacher, academicYear);
    setClassName('');
    setShowManualModal(false);
  };

  const handleSimulatedImport = () => {
    const mockImport = [
      { className: 'XI MIPA 2', homeroomTeacher: 'Siti Aminah, S.Pd', academicYear: activeAY.yearName },
      { className: 'XII IPS 2', homeroomTeacher: 'Drs. Bambang Hidayat', academicYear: activeAY.yearName },
    ];
    importClasses(mockImport);
    setShowImportModal(false);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kelas "${name}"?`)) {
      deleteClass(id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin MENGOSONGKAN SELURUH data kelas? Action ini tidak dapat dibatalkan.')) {
      clearAllClasses();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Data Rombongan Belajar / Kelas</h2>
            <p className="text-xs text-slate-500 font-medium">Kelola daftar kelas, wali kelas penanggungjawab, dan kapasitas murid</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {classes.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-95 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Kosongkan Semua Data Kelas"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Kosongkan Semua Kelas</span>
            </button>
          )}

          {/* Menu Import Excel */}
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
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Grid Kelas Cards */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">Data Kelas Masih Kosong</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Seluruh data kelas telah dikosongkan. Silakan tambahkan kelas baru atau import dari file Excel.
            </p>
          </div>
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-100">
                  TA {c.academicYear}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-slate-500 text-xs font-bold">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{c.studentCount || 0} Siswa</span>
                  </div>

                  <button
                    onClick={() => handleDeleteClass(c.id, c.className)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Kelas Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{c.className}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Wali Kelas: <span className="font-bold text-slate-700">{c.homeroomTeacher}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Tambah Data Kelas Manual</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Nama Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Contoh: X IPA 3 / XI IPS 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Wali Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Wali Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={homeroomTeacher}
                  onChange={(e) => setHomeroomTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.fullNameWithTitle}>
                      {t.fullNameWithTitle} ({t.nip})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tahun Ajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.yearName}>
                      {ay.yearName} ({ay.semester})
                    </option>
                  ))}
                </select>
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
                  <span>Simpan Data Kelas</span>
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
              <span>Import Data Kelas dari File Excel</span>
            </h3>

            <div className="p-4 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl text-center space-y-2">
              <Upload className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-emerald-900">Upload File .xlsx atau .csv Data Kelas</p>
              <p className="text-[11px] text-emerald-700">Format Kolom: Nama Kelas | Wali Kelas | Tahun Ajaran</p>
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Proses & Import Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
