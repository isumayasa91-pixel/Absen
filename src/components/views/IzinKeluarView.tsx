import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, Plus, Save, Clock, CheckSquare, Trash2 } from 'lucide-react';

export const IzinKeluarView: React.FC = () => {
  const { leavePermissions, addLeavePermission, deleteLeavePermission, students, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeOut, setTimeOut] = useState('10:30');
  const [leaveType, setLeaveType] = useState<'Izin Sementara (kembali)' | 'Pulang Awal (Tidak Kembali)'>('Izin Sementara (kembali)');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find((s) => s.id === studentId);
    if (!std || !reason.trim()) return;

    addLeavePermission({
      studentId: std.id,
      studentName: std.fullName,
      class: std.currentClass,
      date,
      timeOut,
      leaveType,
      reason: reason.trim(),
      status: leaveType.includes('kembali') ? 'Berlaku' : 'Selesai',
    });

    setReason('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Surat Izin Keluar Sekolah</h2>
            <p className="text-xs text-slate-500 font-medium">Pemberian izin meninggalkan gerbang sekolah saat jam pelajaran berlangsung</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-orange-200 flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Izin Keluar Baru</span>
        </button>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">
          Daftar Surat Izin Keluar Aktif
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Siswa & Kelas</th>
                <th className="p-3">Tanggal & Jam Keluar</th>
                <th className="p-3">Tipe Surat Izin</th>
                <th className="p-3">Alasan Keperluan</th>
                <th className="p-3 text-center">Status Gerbang</th>
                <th className="p-3 text-center">Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {leavePermissions.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">
                    <div>{l.studentName}</div>
                    <span className="text-[10px] text-slate-500 font-semibold">{l.class}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{l.date}</div>
                    <span className="text-[10px] text-orange-700 font-mono font-bold">Pukul {l.timeOut} WIB</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 font-extrabold text-[11px] border border-orange-100">
                      {l.leaveType}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{l.reason}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {currentUser?.role !== 'siswa' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus izin keluar "${l.studentName}"?`)) {
                            deleteLeavePermission(l.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Surat Izin Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Izin Keluar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-orange-600" />
              <span>Buat Izin Keluar Sekolah Baru</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pilih Siswa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Siswa <span className="text-rose-500">*</span>
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.currentClass})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal & Waktu Keluar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Waktu Keluar</label>
                  <input
                    type="time"
                    required
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Tipe Izin: Kotak centang (Izin Sementara (kembali), Pulang Awal (Tidak Kembali)) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tipe Izin Keluar (Pilih salah satu) <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-orange-50/50 transition-colors">
                    <input
                      type="radio"
                      name="leaveTypeChoice"
                      checked={leaveType === 'Izin Sementara (kembali)'}
                      onChange={() => setLeaveType('Izin Sementara (kembali)')}
                      className="w-4 h-4 text-orange-600 accent-orange-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Izin Sementara (kembali ke sekolah)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-orange-50/50 transition-colors">
                    <input
                      type="radio"
                      name="leaveTypeChoice"
                      checked={leaveType === 'Pulang Awal (Tidak Kembali)'}
                      onChange={() => setLeaveType('Pulang Awal (Tidak Kembali)')}
                      className="w-4 h-4 text-orange-600 accent-orange-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Pulang Awal (Tidak Kembali ke sekolah)</span>
                  </label>
                </div>
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Alasan Keperluan</label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Berobat dokter gigi / Acara keluarga mendadak"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cetak & Simpan Izin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
