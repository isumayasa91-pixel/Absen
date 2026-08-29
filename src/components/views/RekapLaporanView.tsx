import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/excelExport';
import { FileSpreadsheet, Download, Calendar, Filter, UserCheck, ClockAlert, UserX, Trash2 } from 'lucide-react';

export const RekapLaporanView: React.FC = () => {
  const { attendanceRecords, deleteAttendanceRecord, classes } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [activeTabReport, setActiveTabReport] = useState<'kehadiran' | 'alpa' | 'terlambat'>('kehadiran');

  const filteredRecords = attendanceRecords.filter((r) => {
    const matchDate = !selectedDate || r.date === selectedDate;
    const matchClass = selectedClass === 'Semua Kelas' || r.class === selectedClass;
    return matchDate && matchClass;
  });

  const rekapHadir = filteredRecords.filter((r) => r.statusFinal === 'Hadir' || r.statusFinal === 'Dispen');
  const rekapAlpa = filteredRecords.filter((r) => r.statusFinal === 'Alpa');
  const rekapTerlambat = filteredRecords.filter((r) => r.statusFinal === 'Terlambat');

  const handleExportHarian = () => {
    const listToExport =
      activeTabReport === 'kehadiran'
        ? filteredRecords
        : activeTabReport === 'alpa'
        ? rekapAlpa
        : rekapTerlambat;

    const data = listToExport.map((r) => ({
      'Nama Siswa': r.studentName,
      Kelas: r.class,
      Tanggal: r.date,
      'Status Akhir': r.statusFinal,
      'Jam Masuk': r.timeIn,
      'Jam Pulang': r.timeOut,
      Metode: r.tapMethod,
      Catatan: r.notes || '-',
    }));

    exportToExcel(
      data,
      `Rekap_${activeTabReport.toUpperCase()}_Harian_${selectedDate}`,
      `Laporan ${activeTabReport}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Rekap Laporan Presensi Harian</h2>
            <p className="text-xs text-slate-500 font-medium">Ekspor laporan rekap harian kehadiran, alpa, dan terlambat ke format Excel</p>
          </div>
        </div>

        {/* Ekspor Harian Button */}
        <button
          onClick={handleExportHarian}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-200 flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Harian (Download Excel)</span>
        </button>
      </div>

      {/* Controls & Sub-tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* Sub tabs: Rekap Kehadiran, Rekap Alpa, Rekap Terlambat */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTabReport('kehadiran')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTabReport === 'kehadiran'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Rekap Kehadiran ({filteredRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTabReport('alpa')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTabReport === 'alpa'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>Rekap Alpa ({rekapAlpa.length})</span>
            </button>

            <button
              onClick={() => setActiveTabReport('terlambat')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTabReport === 'terlambat'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ClockAlert className="w-4 h-4" />
              <span>Rekap Terlambat ({rekapTerlambat.length})</span>
            </button>
          </div>

          {/* Date & Class Selectors */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3 text-center">Status Final</th>
                <th className="p-3">Jam Masuk</th>
                <th className="p-3">Jam Pulang</th>
                <th className="p-3">Metode Scan</th>
                <th className="p-3 text-center">Aksi / Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(activeTabReport === 'kehadiran'
                ? filteredRecords
                : activeTabReport === 'alpa'
                ? rekapAlpa
                : rekapTerlambat
              ).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{r.studentName}</td>
                  <td className="p-3 font-semibold">{r.class}</td>
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        r.statusFinal === 'Hadir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.statusFinal === 'Terlambat'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.statusFinal}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">{r.timeIn}</td>
                  <td className="p-3 font-mono text-slate-600">{r.timeOut}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{r.tapMethod}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus catatan presensi "${r.studentName}" tanggal ${r.date}?`)) {
                          deleteAttendanceRecord(r.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Catatan Presensi Ini"
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
  );
};
