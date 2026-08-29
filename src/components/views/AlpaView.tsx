import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/excelExport';
import { UserX, Search, Download, Trash2 } from 'lucide-react';

export const AlpaView: React.FC = () => {
  const { attendanceRecords, deleteAttendanceRecord, classes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('Semua Kelas');

  const todayStr = new Date().toISOString().split('T')[0];

  const alpaRecords = attendanceRecords.filter((r) => r.statusFinal === 'Alpa');

  const filteredAlpa = alpaRecords.filter((r) => {
    const matchSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchClass = classFilter === 'Semua Kelas' || r.class === classFilter;
    return matchSearch && matchClass;
  });

  const handleExport = () => {
    const data = filteredAlpa.map((r) => ({
      'Nama Siswa': r.studentName,
      Kelas: r.class,
      Tanggal: r.date,
      Status: 'Alpa (Tanpa Keterangan)',
      'Jam Masuk': r.timeIn,
    }));
    exportToExcel(data, `Daftar_Keabsenan_Alpa_${todayStr}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Daftar Keabsenan / Siswa Alpa</h2>
            <p className="text-xs text-slate-500 font-medium">Monitoring siswa tidak hadir tanpa keterangan hari ini</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel Alpa</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Menu Pencarian */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa alpa..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Filter Semua Kelas */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="Semua Kelas">Semua Kelas ({alpaRecords.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        {/* Daftar Keabsenan Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Status Masuk</th>
                <th className="p-3 text-center">Tindakan Piket</th>
                <th className="p-3 text-center">Aksi / Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAlpa.length > 0 ? (
                filteredAlpa.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{r.studentName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold text-[11px]">
                        {r.class}
                      </span>
                    </td>
                    <td className="p-3">{r.date}</td>
                    <td className="p-3 font-extrabold text-rose-700">Tanpa Keterangan (Alpa)</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        Follow-up Orangtua
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus catatan alpa "${r.studentName}"?`)) {
                            deleteAttendanceRecord(r.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Catatan Alpa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium text-xs">
                    Tidak ada siswa yang alpa sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
