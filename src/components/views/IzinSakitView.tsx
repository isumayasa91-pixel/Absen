import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  Plus,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Upload,
  Eye,
  X,
  ZoomIn,
  FileText,
} from 'lucide-react';

export const IzinSakitView: React.FC = () => {
  const {
    permissions,
    addPermission,
    updatePermissionStatus,
    deletePermission,
    students,
    currentUser,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState<string | null>(null);

  // Form states
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [type, setType] = useState<'Izin' | 'Sakit' | 'Alpa'>('Sakit');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [statusApprovalChoice, setStatusApprovalChoice] = useState<'Menunggu Persetujuan' | 'Langsung Disetujui'>('Menunggu Persetujuan');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler (Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar/foto (JPG, PNG, WEBP, dll).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find((s) => s.id === studentId);
    if (!std || !reason.trim()) return;

    const finalApprovalState = statusApprovalChoice === 'Langsung Disetujui' ? 'Disetujui' : 'Menunggu Persetujuan';

    addPermission({
      studentId: std.id,
      studentName: std.fullName,
      class: std.currentClass,
      type,
      startDate,
      endDate,
      reason: reason.trim(),
      proofPhotoUrl: proofPhotoUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80',
      statusApproval: finalApprovalState,
      approvalType: statusApprovalChoice,
    });

    setReason('');
    setProofPhotoUrl('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Izin & Sakit Siswa</h2>
            <p className="text-xs text-slate-500 font-medium">Pengajuan izin ketidakhadiran, verifikasi bukti surat dokter, dan persetujuan wali kelas</p>
          </div>
        </div>

        {/* Buat Pengajuan Baru Button */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengajuan Baru</span>
        </button>
      </div>

      {/* Grid List Pengajuan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    p.type === 'Sakit'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : p.type === 'Izin'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {p.type}
                </span>
                <span className="text-xs font-bold text-slate-800">{p.studentName} ({p.class})</span>
              </div>

              {/* Status approval pill & Delete button */}
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    p.statusApproval === 'Disetujui'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : p.statusApproval === 'Ditolak'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                  }`}
                >
                  {p.statusApproval}
                </span>

                {currentUser?.role !== 'siswa' && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus surat izin/sakit "${p.studentName}"?`)) {
                        deletePermission(p.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Izin/Sakit Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl">
              "{p.reason}"
            </p>

            {/* Preview Foto Surat jika ada */}
            {p.proofPhotoUrl && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                    <img
                      src={p.proofPhotoUrl}
                      alt="Foto Surat Bukti"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate">Foto Surat Bukti Terlampir</p>
                    <p className="text-[10px] text-slate-500 font-medium">Dokumen Bukti Fisik / Surat Dokter</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewImageModalUrl(p.proofPhotoUrl || null)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center space-x-1 shrink-0 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Foto</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Periode: {p.startDate} s/d {p.endDate}</span>
              </div>

              {/* Approval actions if Menunggu */}
              {p.statusApproval === 'Menunggu Persetujuan' && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => updatePermissionStatus(p.id, 'Disetujui')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Setujui</span>
                  </button>
                  <button
                    onClick={() => updatePermissionStatus(p.id, 'Ditolak')}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-2xs flex items-center space-x-1 cursor-pointer"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Tolak</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Buat Pengajuan Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Buat Pengajuan Izin / Sakit Baru</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Jenis: Izin, Sakit, Alpa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jenis Pengajuan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Sakit', 'Izin', 'Alpa'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        type === t
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tanggal Mulai & Tanggal Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Alasan / Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Alasan / Keterangan</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tuliskan alasan izin/sakit secara detail..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                ></textarea>
              </div>

              {/* File Bukti Photo Surat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Upload File Photo Surat Dokter / Orang Tua
                </label>

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {proofPhotoUrl ? (
                  /* Preview Foto Ter-upload */
                  <div className="p-3 border-2 border-emerald-300 rounded-2xl bg-emerald-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Foto Surat Berhasil Diunggah
                      </span>
                      <button
                        type="button"
                        onClick={() => setProofPhotoUrl('')}
                        className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Hapus Foto Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-slate-100 max-h-48 flex items-center justify-center group">
                      <img
                        src={proofPhotoUrl}
                        alt="Preview Surat"
                        className="max-h-48 w-auto object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImageModalUrl(proofPhotoUrl)}
                          className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 font-bold text-xs flex items-center gap-1 shadow-md"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Perbesar</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Ganti File Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Ambil ulang dari Kamera</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Area Dropzone & Tombol Upload */
                  <div className="p-4 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/40 hover:bg-indigo-50 text-center space-y-3 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Pilih foto surat atau ambil foto langsung
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Format: JPG, PNG, WEBP, atau foto langsung dari kamera HP/laptop
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload File Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Kamera HP / Laptop</span>
                      </button>
                    </div>

                    {/* Alternatif Input URL */}
                    <div className="pt-2 border-t border-indigo-100">
                      <input
                        type="text"
                        value={proofPhotoUrl}
                        onChange={(e) => setProofPhotoUrl(e.target.value)}
                        placeholder="Atau tempelkan URL Gambar Foto Surat Dokter/Izin"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] bg-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Persetujuan: Menunggu Persetujuan / Langsung Disetujui */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Persetujuan Awal <span className="text-rose-500">*</span>
                </label>
                <select
                  value={statusApprovalChoice}
                  onChange={(e) => setStatusApprovalChoice(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Menunggu Persetujuan">Menunggu Persetujuan Wali Kelas</option>
                  <option value="Langsung Disetujui">Langsung Disetujui (By Admin / System)</option>
                </select>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengajuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal Pratinjau Foto Surat */}
      {previewImageModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
          onClick={() => setPreviewImageModalUrl(null)}
        >
          <div
            className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Foto Bukti Surat Dokter / Izin Orang Tua</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImageModalUrl(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 flex items-center justify-center overflow-auto bg-slate-950">
              <img
                src={previewImageModalUrl}
                alt="Bukti Surat Izin Dokter / Orangtua"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setPreviewImageModalUrl(null)}
                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
