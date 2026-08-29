import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarDays, CheckCircle2, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';

export const TahunAjaranView: React.FC = () => {
  const { academicYears, addAcademicYear, deleteAcademicYear } = useApp();
  const [yearName, setYearName] = useState('2026/2027');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [isActive, setIsActive] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearName.trim()) return;
    addAcademicYear(yearName.trim(), semester, isActive);
    setSuccessMsg(`Tahun Ajaran ${yearName} (${semester}) berhasil disimpan!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Pengaturan Tahun Ajaran & Semester</h2>
          <p className="text-xs text-slate-500 font-medium">Kelola periode aktif perkuliahan/persekolahan dan semester berjalan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Tahun Ajaran */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Tambah / Setting Tahun Ajaran</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Tahun Ajaran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Tahun Ajaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={yearName}
                onChange={(e) => setYearName(e.target.value)}
                placeholder="Contoh: 2026/2027"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Format baku: YYYY/YYYY (contoh: 2026/2027)</span>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Semester Pilihan <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSemester('Ganjil')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    semester === 'Ganjil'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Ganjil
                </button>
                <button
                  type="button"
                  onClick={() => setSemester('Genap')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    semester === 'Genap'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Genap
                </button>
              </div>
            </div>

            {/* Checkbox Aktifkan tahun ajaran ini */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                id="check-active-ay"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="check-active-ay" className="text-xs font-bold text-blue-900 cursor-pointer select-none">
                Aktifkan tahun ajaran ini sebagai default
              </label>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Menu Simpan Data */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Tahun Ajaran</span>
            </button>
          </form>
        </div>

        {/* List Data Tahun Ajaran */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>Daftar Tahun Ajaran Terdaftar</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Tahun Ajaran</th>
                  <th className="p-3">Semester</th>
                  <th className="p-3 text-center">Status Presensi</th>
                  <th className="p-3 text-center">Aksi / Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {academicYears.map((ay) => (
                  <tr key={ay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{ay.yearName}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                        Semester {ay.semester}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {ay.isActive ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aktif Berjalan</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 font-semibold text-[11px]">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus tahun ajaran "${ay.yearName} (${ay.semester})"?`)) {
                            deleteAcademicYear(ay.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Tahun Ajaran Ini"
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
      </div>
    </div>
  );
};
