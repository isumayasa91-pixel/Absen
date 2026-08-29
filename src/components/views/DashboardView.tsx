import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/excelExport';
import {
  Users,
  UserCheck,
  Stethoscope,
  FileCheck2,
  UserX,
  Award,
  Download,
  Zap,
  TrendingUp,
  Radio,
  PlusCircle,
  FileText,
  Calendar,
  CheckCircle2,
  ClockAlert,
  FileSpreadsheet,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    students,
    attendanceRecords,
    classes,
    setActiveTab,
    announcements,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);

  const totalStudentsCount = students.length;
  const hadirCount = todayRecords.filter((r) => r.statusFinal === 'Hadir').length;
  const sakitCount = todayRecords.filter((r) => r.statusFinal === 'Sakit').length;
  const izinCount = todayRecords.filter((r) => r.statusFinal === 'Izin').length;
  const alpaCount = todayRecords.filter((r) => r.statusFinal === 'Alpa').length;
  const dispenCount = todayRecords.filter((r) => r.statusFinal === 'Dispen').length;
  const terlambatCount = todayRecords.filter((r) => r.statusFinal === 'Terlambat').length;

  // Class rekap summary data
  const classSummary = classes.map((c) => {
    const classStd = students.filter((s) => s.currentClass === c.className);
    const totalClassStd = classStd.length || c.studentCount || 30;
    const cRecords = todayRecords.filter((r) => r.class === c.className);

    const cHadir = cRecords.filter((r) => r.statusFinal === 'Hadir').length;
    const cSakit = cRecords.filter((r) => r.statusFinal === 'Sakit').length;
    const cIzin = cRecords.filter((r) => r.statusFinal === 'Izin').length;
    const cAlpa = cRecords.filter((r) => r.statusFinal === 'Alpa').length;
    const cTerlambat = cRecords.filter((r) => r.statusFinal === 'Terlambat').length;
    const cDispen = cRecords.filter((r) => r.statusFinal === 'Dispen').length;

    const rate = Math.round(((cHadir + cTerlambat + cDispen) / (totalClassStd || 1)) * 100);

    return {
      className: c.className,
      homeroomTeacher: c.homeroomTeacher,
      totalStudents: totalClassStd,
      hadir: cHadir,
      terlambat: cTerlambat,
      sakit: cSakit,
      izin: cIzin,
      alpa: cAlpa,
      dispen: cDispen,
      percentage: `${rate}%`,
    };
  });

  const handleDownloadRekapKelas = () => {
    const dataToExport = classSummary.map((c) => ({
      'Nama Kelas': c.className,
      'Wali Kelas': c.homeroomTeacher,
      'Total Siswa': c.totalStudents,
      'Hadir (Tepat Waktu)': c.hadir,
      Terlambat: c.terlambat,
      Sakit: c.sakit,
      Izin: c.izin,
      Alpa: c.alpa,
      Dispensasi: c.dispen,
      'Persentase Kehadiran': c.percentage,
    }));
    exportToExcel(dataToExport, `Rekap_Kehadiran_Per_Kelas_${todayStr}`);
  };

  // Weekly stats mockup data
  const weeklyData = [
    { day: 'Senin', hadir: 140, terlambat: 12, sakit: 4, izin: 3, alpa: 2 },
    { day: 'Selasa', hadir: 145, terlambat: 8, sakit: 3, izin: 2, alpa: 1 },
    { day: 'Rabu', hadir: 148, terlambat: 5, sakit: 2, izin: 4, alpa: 0 },
    { day: 'Kamis', hadir: 142, terlambat: 10, sakit: 5, izin: 1, alpa: 3 },
    { day: 'Jumat', hadir: 139, terlambat: 15, sakit: 6, izin: 2, alpa: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-violet-800 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden border border-indigo-500/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/15 border border-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-100 mb-2 shadow-inner">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Presensi Real-Time Active</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Selamat Datang di Panel Presensi Digital</h2>
            <p className="text-sm text-indigo-100/90 font-medium max-w-xl mt-1">
              Pantau tingkat kedisiplinan dan kehadiran siswa secara langsung hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('monitor-live')}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 flex items-center space-x-2 transition-all cursor-pointer border border-emerald-400/30"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Simulasi TAP RFID</span>
            </button>
            <button
              onClick={() => setActiveTab('izin-sakit')}
              className="bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/25 backdrop-blur text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
            >
              <FileCheck2 className="w-4 h-4 text-blue-200" />
              <span>Izin Baru</span>
            </button>
            <button
              onClick={() => setActiveTab('pengumuman')}
              className="bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/25 backdrop-blur text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Pengumuman</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (Total Murid, Hadir, Sakit, Izin, Alpa, Dispen) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        {/* Total Murid */}
        <div className="bg-white p-4.5 rounded-2xl border border-indigo-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Murid</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{totalStudentsCount}</div>
          <span className="text-[11px] text-slate-500 font-semibold">Terdaftar di sistem</span>
        </div>

        {/* Hadir */}
        <div className="bg-white p-4.5 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">Hadir</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">{hadirCount}</div>
          <span className="text-[11px] text-emerald-700 font-bold">Tepat waktu</span>
        </div>

        {/* Sakit */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-white to-amber-50/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">Sakit</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800">{sakitCount}</div>
          <span className="text-[11px] text-amber-700 font-bold">Surat/Keterangan</span>
        </div>

        {/* Izin */}
        <div className="bg-white p-4.5 rounded-2xl border border-blue-200/80 bg-gradient-to-b from-white to-blue-50/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider">Izin</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-800">{izinCount}</div>
          <span className="text-[11px] text-blue-700 font-bold">Izin resmi</span>
        </div>

        {/* Alpa */}
        <div className="bg-white p-4.5 rounded-2xl border border-rose-200/80 bg-gradient-to-b from-white to-rose-50/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">Alpa</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold border border-rose-200">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-800">{alpaCount}</div>
          <span className="text-[11px] text-rose-700 font-bold">Tanpa keterangan</span>
        </div>

        {/* Dispen */}
        <div className="bg-white p-4.5 rounded-2xl border border-purple-200/80 bg-gradient-to-b from-white to-purple-50/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider">Dispen</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold border border-purple-200">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-800">{dispenCount}</div>
          <span className="text-[11px] text-purple-700 font-bold">Dispensasi lomba</span>
        </div>
      </div>

      {/* Grid Charts & Recent Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistik Minggu Ini */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <span>Statistik Kehadiran Minggu Ini</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Perbandingan jumlah presensi siswa per hari kerja</p>
            </div>
            <span className="text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-lg">
              Minggu Aktif
            </span>
          </div>

          {/* Custom SVG / Bar Chart Representation */}
          <div className="h-48 pt-4 flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
            {weeklyData.map((d, i) => {
              const totalDay = d.hadir + d.terlambat + d.sakit + d.izin + d.alpa;
              const maxVal = 160;
              const hadirH = (d.hadir / maxVal) * 100;
              const lateH = (d.terlambat / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1 h-36 bg-slate-50/80 rounded-xl p-1 relative">
                    {/* Hadir Bar */}
                    <div
                      style={{ height: `${hadirH}%` }}
                      className="w-1/2 bg-gradient-to-t from-violet-600 to-indigo-500 group-hover:from-violet-700 group-hover:to-indigo-600 rounded-t-md transition-all relative shadow-2xs"
                      title={`Hadir: ${d.hadir}`}
                    ></div>
                    {/* Terlambat Bar */}
                    <div
                      style={{ height: `${lateH}%` }}
                      className="w-1/2 bg-gradient-to-t from-amber-500 to-orange-400 group-hover:from-amber-600 group-hover:to-orange-500 rounded-t-md transition-all shadow-2xs"
                      title={`Terlambat: ${d.terlambat}`}
                    ></div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-gradient-to-r from-violet-600 to-indigo-500 inline-block shadow-2xs"></span>
              <span className="font-bold text-slate-700">Hadir Tepat Waktu</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-gradient-to-r from-amber-500 to-orange-400 inline-block shadow-2xs"></span>
              <span className="font-bold text-slate-700">Terlambat</span>
            </div>
          </div>
        </div>

        {/* Aktifitas Baru Stream Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Aktifitas Baru</span>
            </h3>
            <span className="text-[10px] bg-rose-50 text-rose-700 font-black px-2 py-0.5 rounded-full border border-rose-200">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {todayRecords.length > 0 ? (
              todayRecords.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-start space-x-3 text-xs p-2.5 rounded-xl bg-slate-50/80 hover:bg-violet-50/40 border border-slate-100 transition-colors">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-extrabold text-white text-[10px] shadow-2xs ${
                      r.statusFinal === 'Hadir'
                        ? 'bg-emerald-600'
                        : r.statusFinal === 'Terlambat'
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  >
                    {r.statusFinal.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate">{r.studentName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{r.timeIn}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Class {r.class} &bull; <span className="font-bold text-slate-700">{r.statusFinal}</span> via {r.tapMethod}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                Belum ada rekaman presensi terbaru hari ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rekap Per Kelas Section (Bisa di Download) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Rekap Kehadiran Per Kelas</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Rangkuman persentase dan statistik presensi tiap kelas hari ini</p>
          </div>

          <button
            onClick={handleDownloadRekapKelas}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs shadow-emerald-200 flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Rekap Excel Per Kelas</span>
          </button>
        </div>

        {/* Table Rekap Per Kelas */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/50 text-slate-700 font-black uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Kelas</th>
                <th className="p-3">Wali Kelas</th>
                <th className="p-3 text-center">Total Siswa</th>
                <th className="p-3 text-center text-emerald-700">Hadir</th>
                <th className="p-3 text-center text-amber-700">Terlambat</th>
                <th className="p-3 text-center text-amber-700">Sakit</th>
                <th className="p-3 text-center text-blue-700">Izin</th>
                <th className="p-3 text-center text-rose-700">Alpa</th>
                <th className="p-3 text-center">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classSummary.map((c, i) => (
                <tr key={i} className="hover:bg-violet-50/30 transition-colors">
                  <td className="p-3 font-extrabold text-slate-900">{c.className}</td>
                  <td className="p-3">{c.homeroomTeacher}</td>
                  <td className="p-3 text-center font-bold">{c.totalStudents}</td>
                  <td className="p-3 text-center font-extrabold text-emerald-600">{c.hadir}</td>
                  <td className="p-3 text-center font-extrabold text-amber-600">{c.terlambat}</td>
                  <td className="p-3 text-center font-extrabold text-amber-600">{c.sakit}</td>
                  <td className="p-3 text-center font-extrabold text-blue-600">{c.izin}</td>
                  <td className="p-3 text-center font-extrabold text-rose-600">{c.alpa}</td>
                  <td className="p-3 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-black text-[11px] border border-indigo-200">
                      {c.percentage}
                    </span>
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
