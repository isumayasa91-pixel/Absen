import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { Radio, ScanBarcode, Edit, Plus, Save, Clock, CheckCircle2, UserCheck, AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import { RfidScanModal } from '../RfidScanModal';

export const MonitorLiveView: React.FC = () => {
  const {
    students,
    attendanceRecords,
    deleteAttendanceRecord,
    tapRFIDOrScan,
    manualInputAttendance,
  } = useApp();

  const [selectedStudentForTap, setSelectedStudentForTap] = useState(students[0]?.id || '');
  const [tapNotice, setTapNotice] = useState<{ success: boolean; msg: string } | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Manual input modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFinal, setStatusFinal] = useState<AttendanceStatus>('Hadir');
  const [statusIn, setStatusIn] = useState<'Hadir' | 'Terlambat' | 'Belum'>('Hadir');
  const [statusOut, setStatusOut] = useState<'Pulang' | 'Belum'>('Belum');
  const [timeIn, setTimeIn] = useState('06:45:00');
  const [timeOut, setTimeOut] = useState('15:00:00');

  const handleTapSimulation = (method: 'RFID' | 'FaceID' | 'QR') => {
    if (!selectedStudentForTap) return;
    const res = tapRFIDOrScan(selectedStudentForTap, method);
    setTapNotice({ success: res.success, msg: res.message });
    setTimeout(() => setTapNotice(null), 4000);
  };

  const handleManualInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    manualInputAttendance({
      studentId,
      date,
      statusFinal,
      statusIn,
      statusOut,
      timeIn,
      timeOut,
    });
    setShowManualModal(false);
    setTapNotice({ success: true, msg: 'Input presensi manual berhasil tersimpan!' });
    setTimeout(() => setTapNotice(null), 4000);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Pemantauan Presensi Real Time</h2>
              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                LIVE GATE SCANNER
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Monitoring TAP RFID, FaceID scanner, dan ubah status presensi manual</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="bg-blue-900 hover:bg-blue-950 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
          >
            <ScanBarcode className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Buka Terminal Scan RFID Fullscreen</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Kelola / Input Presensi Baru</span>
          </button>
        </div>
      </div>

      {tapNotice && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in shadow-xs ${
            tapNotice.success
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{tapNotice.msg}</span>
        </div>
      )}

      {/* Grid Simulator TAP RFID & Live Feed Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TAP RFID Simulator Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <ScanBarcode className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-sm text-white tracking-wide">TAP RFID & QR SCANNER GATE</h3>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Simulasikan pemindaian kartu RFID / scan barcode QR siswa di pintu gerbang utama sekolah.
          </p>

          <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Pilih Siswa (Simulasi TAP)</label>
            <select
              value={selectedStudentForTap}
              onChange={(e) => setSelectedStudentForTap(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.currentClass}) - {s.rfidTag}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => handleTapSimulation('RFID')}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 shadow-md"
            >
              <ScanBarcode className="w-4 h-4 text-indigo-200" />
              <span>TAP RFID</span>
            </button>
            <button
              onClick={() => handleTapSimulation('FaceID')}
              className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>SCAN FACE</span>
            </button>
            <button
              onClick={() => handleTapSimulation('QR')}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>SCAN QR</span>
            </button>
          </div>
        </div>

        {/* Live Stream Table / Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Log Presensi Hari Ini ({todayRecords.length} Siswa Terdaftar)</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">{todayStr}</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Siswa & Kelas</th>
                  <th className="p-3">Masuk (Pagi)</th>
                  <th className="p-3">Pulang (Sore)</th>
                  <th className="p-3 text-center">Metode</th>
                  <th className="p-3 text-center">Status Akhir</th>
                  <th className="p-3 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {todayRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{r.studentName}</div>
                      <span className="text-[10px] text-slate-500 font-normal">Kelas {r.class}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{r.timeIn}</td>
                    <td className="p-3 font-mono text-slate-600">{r.timeOut}</td>
                    <td className="p-3 text-center font-semibold text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono border border-slate-200">
                        {r.tapMethod}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
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
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus log presensi real-time "${r.studentName}"?`)) {
                            deleteAttendanceRecord(r.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Log Presensi"
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

      {/* Modal Input Presensi Baru / Ubah Status Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Edit className="w-4 h-4 text-indigo-600" />
              <span>Kelola & Input Presensi Baru Manual</span>
            </h3>

            <form onSubmit={handleManualInputSubmit} className="space-y-4">
              {/* Pilih siswa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Siswa <span className="text-rose-500">*</span>
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.currentClass})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tanggal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Akhir Harian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Akhir Harian <span className="text-rose-500">*</span>
                </label>
                <select
                  value={statusFinal}
                  onChange={(e) => setStatusFinal(e.target.value as AttendanceStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Alpa">Alpa</option>
                  <option value="Dispen">Dispen</option>
                </select>
              </div>

              {/* Status Masuk & Pulang */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Masuk (Pagi)
                  </label>
                  <select
                    value={statusIn}
                    onChange={(e) => setStatusIn(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Belum">Belum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Pulang (Sore)
                  </label>
                  <select
                    value={statusOut}
                    onChange={(e) => setStatusOut(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="Belum">Belum</option>
                    <option value="Pulang">Pulang</option>
                  </select>
                </div>
              </div>

              {/* Jam Masuk & Jam Pulang */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jam Masuk (Pagi)
                  </label>
                  <input
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jam Pulang (Sore)
                  </label>
                  <input
                    type="time"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                  />
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
                  <span>Simpan Presensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RfidScanModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} />
    </div>
  );
};
