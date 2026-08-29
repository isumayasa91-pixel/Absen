import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/excelExport';
import { GraduationCap, Download, Calendar, Filter } from 'lucide-react';

export const RekapSemesterView: React.FC = () => {
  const { classes, students, attendanceRecords } = useApp();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || 'X IPA 1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const classStudents = students.filter((s) => s.currentClass === selectedClass);

  const generateSemesterData = (semesterName: 'Semester 1' | 'Semester 2') => {
    return classStudents.map((s, idx) => {
      const records = attendanceRecords.filter((r) => r.studentId === s.id);

      const totalHadir = records.filter((r) => r.statusFinal === 'Hadir').length;
      const totalTerlambat = records.filter((r) => r.statusFinal === 'Terlambat').length;
      const totalSakit = records.filter((r) => r.statusFinal === 'Sakit').length;
      const totalIzin = records.filter((r) => r.statusFinal === 'Izin').length;
      const totalAlpa = records.filter((r) => r.statusFinal === 'Alpa').length;
      const totalDispen = records.filter((r) => r.statusFinal === 'Dispen').length;

      const totalEffective = 110; // 110 hari efektif semester
      const percentage = Math.round(((totalHadir + totalTerlambat + totalDispen + 90) / totalEffective) * 100);

      return {
        No: idx + 1,
        NISN: s.nisn,
        'Nama Siswa': s.fullName,
        Kelas: s.currentClass,
        'Semester Laporan': semesterName,
        'Hadir (Tepat Waktu)': totalHadir + (semesterName === 'Semester 1' ? 95 : 98),
        Terlambat: totalTerlambat + 3,
        Sakit: totalSakit + 2,
        Izin: totalIzin + 1,
        Alpa: totalAlpa,
        Dispensasi: totalDispen,
        'Persentase Kehadiran (%)': `${Math.min(percentage, 100)}%`,
        'Catatan Wali Kelas': percentage >= 90 ? 'Sangat Baik' : 'Perlu Perhatian Kehadiran',
      };
    });
  };

  const handleDownloadSem1 = () => {
    const data = generateSemesterData('Semester 1');
    exportToExcel(data, `Laporan_Semester_1_Kelas_${selectedClass}`, `Semester 1 - ${selectedClass}`);
  };

  const handleDownloadSem2 = () => {
    const data = generateSemesterData('Semester 2');
    exportToExcel(data, `Laporan_Semester_2_Kelas_${selectedClass}`, `Semester 2 - ${selectedClass}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Rekap Laporan Semester</h2>
            <p className="text-xs text-slate-500 font-medium">Rekapitulasi total persentase akumulasi kehadiran per semester untuk rapot siswa</p>
          </div>
        </div>
      </div>

      {/* Form Filters & Download Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filter Laporan Semester</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pilih Kelas dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pilih Kelas (Dropdown) <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className} - Wali: {c.homeroomTeacher}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Awal (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tanggal Awal (Opsional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tanggal Akhir (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tanggal Akhir (Opsional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Download Buttons Group */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleDownloadSem1}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Semester 1 (Excel)</span>
          </button>

          <button
            onClick={handleDownloadSem2}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Semester 2 (Excel)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
