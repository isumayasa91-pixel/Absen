import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Clock,
  Calendar,
  CreditCard,
  ScanFace,
  Navigation,
  MapPin,
  Sliders,
  Save,
  CheckCircle2,
  Plus,
  Building2,
  School,
  Sparkles,
  Key,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Image as ImageIcon,
  UserCheck,
  Globe,
  Award,
  Trash2,
  Search,
  Filter,
  User,
  AlertCircle,
  FileText,
  Tag,
  Printer,
  QrCode,
  Download,
  Upload,
} from 'lucide-react';

export const KonfigurasiView: React.FC = () => {
  const {
    activeTab: globalActiveTab,
    settings,
    updateSettings,
    students,
    classes,
    cardRequests,
    addCardRequest,
    updateCardRequestStatus,
    deleteCardRequest,
    updateStudentPhoto,
    updateMassStudentPhotos,
  } = useApp();

  const getSubTabFromActiveTab = (tab: string): 'jam' | 'libur' | 'kartu' | 'faceid' | 'lokasi-siswa' | 'lokasi-sekolah' | 'system' => {
    if (tab === 'kalender-libur') return 'libur';
    if (tab === 'pengajuan-kartu') return 'kartu';
    if (tab === 'faceid') return 'faceid';
    if (tab === 'lokasi-siswa') return 'lokasi-siswa';
    if (tab === 'lokasi-sekolah') return 'lokasi-sekolah';
    if (tab === 'setting' || tab === 'konfigurasi') return 'system';
    return 'jam';
  };

  const [activeConfigTab, setActiveConfigTab] = useState<
    'jam' | 'libur' | 'kartu' | 'faceid' | 'lokasi-siswa' | 'lokasi-sekolah' | 'system'
  >(() => getSubTabFromActiveTab(globalActiveTab));

  useEffect(() => {
    if ([
      'aturan-jam', 'kalender-libur', 'pengajuan-kartu', 'faceid', 'lokasi-siswa', 'lokasi-sekolah', 'setting', 'konfigurasi'
    ].includes(globalActiveTab)) {
      setActiveConfigTab(getSubTabFromActiveTab(globalActiveTab));
    }
  }, [globalActiveTab]);

  // Form states for systemSettings
  const [formData, setFormData] = useState({ ...settings });
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  // Kalender Libur List
  const [holidays, setHolidays] = useState([
    { id: '1', date: '2026-08-17', name: 'HUT Kemerdekaan RI Ke-81' },
    { id: '2', date: '2026-12-25', name: 'Hari Raya Natal' },
  ]);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  // Card requests Local UI States
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [cardReasonOption, setCardReasonOption] = useState('Kartu Hilang / Lupa Taruh');
  const [customCardReason, setCustomCardReason] = useState('');
  const [cardRequestDate, setCardRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [cardRequestStatus, setCardRequestStatus] = useState<'Menunggu' | 'Diproses' | 'Selesai Cetak' | 'Sudah Diterima'>('Menunggu');
  const [cardNotes, setCardNotes] = useState('');

  // Card Print Modal States
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedCardForPrint, setSelectedCardForPrint] = useState<any | null>(null);

  // Card Requests Filters & Search
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [cardClassFilter, setCardClassFilter] = useState('Semua Kelas');
  const [cardStatusFilter, setCardStatusFilter] = useState('Semua Status');

  // Notice toast
  const [cardNotice, setCardNotice] = useState<string | null>(null);

  // Mass Photo Upload States
  const [showMassPhotoModal, setShowMassPhotoModal] = useState(false);
  const [massPhotoItems, setMassPhotoItems] = useState<
    Array<{ fileName: string; studentId: string; previewUrl: string }>
  >([]);

  const showNotice = (msg: string) => {
    setCardNotice(msg);
    setTimeout(() => setCardNotice(null), 3500);
  };

  const handleSinglePhotoUpload = (studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (base64) {
        updateStudentPhoto(studentId, base64);
        showNotice('✅ Pas foto siswa berhasil diperbarui!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMassPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const parsedItems: Array<{ fileName: string; studentId: string; previewUrl: string }> = [];

    let loadedCount = 0;
    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const previewUrl = evt.target?.result as string;
        const fileNameNoExt = file.name.substring(0, file.name.lastIndexOf('.')).toLowerCase().trim();

        // Auto-match student by NISN or Name or Student ID
        const matchedStudent = students.find((s) => {
          const sNisn = s.nisn.toLowerCase().trim();
          const sName = s.fullName.toLowerCase().trim();
          const sId = s.id.toLowerCase().trim();
          return sNisn === fileNameNoExt || sName === fileNameNoExt || sId === fileNameNoExt || fileNameNoExt.includes(sNisn);
        });

        parsedItems.push({
          fileName: file.name,
          studentId: matchedStudent ? matchedStudent.id : '',
          previewUrl,
        });

        loadedCount++;
        if (loadedCount === fileList.length) {
          setMassPhotoItems(parsedItems);
          setShowMassPhotoModal(true);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleApplyMassPhotos = () => {
    if (massPhotoItems.length === 0) return;

    const map: { [key: string]: string } = {};
    let matchedCount = 0;

    massPhotoItems.forEach((item) => {
      if (item.studentId && item.previewUrl) {
        map[item.studentId] = item.previewUrl;
        matchedCount++;
      }
    });

    if (matchedCount === 0) {
      alert('Silakan hubungkan minimal 1 foto ke siswa sebelum menyimpan!');
      return;
    }

    updateMassStudentPhotos(map);
    setShowMassPhotoModal(false);
    setMassPhotoItems([]);
    showNotice(`✅ Berhasil mengunggah & memperbarui ${matchedCount} pas foto siswa secara masal!`);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (base64) {
        setFormData((prev) => ({ ...prev, schoolLogo: base64 }));
        showNotice('✅ Logo sekolah berhasil diunggah!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const generateRandomToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'EDU-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, morningToken: code }));
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName.trim()) return;
    setHolidays([
      ...holidays,
      { id: Date.now().toString(), date: newHolidayDate, name: newHolidayName.trim() },
    ]);
    setNewHolidayDate('');
    setNewHolidayName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Konfigurasi & Pengaturan Sistem</h2>
            <p className="text-xs text-slate-500 font-medium">Jam sekolah, kalender libur, geofencing GPS, FaceID, & kartu siswa</p>
          </div>
        </div>

        {saveNotice && (
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 no-scrollbar">
        {[
          { id: 'jam', label: 'Aturan Jam', icon: Clock },
          { id: 'libur', label: 'Kalender Libur', icon: Calendar },
          { id: 'kartu', label: 'Pengajuan Kartu', icon: CreditCard },
          { id: 'faceid', label: 'FaceID', icon: ScanFace },
          { id: 'lokasi-siswa', label: 'Lokasi Siswa', icon: Navigation },
          { id: 'lokasi-sekolah', label: 'Lokasi Sekolah', icon: MapPin },
          { id: 'system', label: 'Setting System', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeConfigTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveConfigTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: ATURAN JAM */}
      {activeConfigTab === 'jam' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Aturan Jam Presensi Masuk & Pulang</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jam Masuk Pagi (Target Tepat Waktu)
              </label>
              <input
                type="time"
                value={formData.timeInStart}
                onChange={(e) => setFormData({ ...formData, timeInStart: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Toleransi Jam Masuk (Batas Akhir)
              </label>
              <input
                type="time"
                value={formData.timeInLate}
                onChange={(e) => setFormData({ ...formData, timeInLate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jam Pulang Sore (Awal Presensi Pulang)
              </label>
              <input
                type="time"
                value={formData.timeOutStart}
                onChange={(e) => setFormData({ ...formData, timeOutStart: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Aturan Jam</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT 2: KALENDER LIBUR */}
      {activeConfigTab === 'libur' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Master Kalender Libur Sekolah</span>
          </h3>

          <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal Libur</label>
              <input
                type="date"
                required
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Keterangan Libur</label>
              <input
                type="text"
                required
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder="Contoh: Libur Hari Raya"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Hari Libur</span>
              </button>
            </div>
          </form>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Nama Libur / Keterangan</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {holidays.map((h) => (
                  <tr key={h.id}>
                    <td className="p-3 font-bold font-mono text-purple-700">{h.date}</td>
                    <td className="p-3 font-semibold text-slate-900">{h.name}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setHolidays(holidays.filter((item) => item.id !== h.id))}
                        className="text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PENGAJUAN KARTU */}
      {activeConfigTab === 'kartu' && (() => {
        const availableClassList = Array.from(new Set(students.map((s) => s.currentClass))).filter(Boolean);
        const selectedStudent = students.find((s) => s.id === selectedStudentId);

        const filteredCardRequests = cardRequests.filter((c) => {
          const q = cardSearchQuery.toLowerCase();
          const matchSearch =
            !q ||
            c.studentName.toLowerCase().includes(q) ||
            c.nisn.includes(q) ||
            c.reason.toLowerCase().includes(q);

          const matchClass = cardClassFilter === 'Semua Kelas' || c.class === cardClassFilter;
          const matchStatus = cardStatusFilter === 'Semua Status' || c.status === cardStatusFilter;

          return matchSearch && matchClass && matchStatus;
        });

        const handleAddCardSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!selectedStudent) {
            alert('Silakan pilih data siswa terlebih dahulu!');
            return;
          }
          const finalReason = cardReasonOption === 'Lainnya' ? customCardReason : cardReasonOption;
          if (!finalReason.trim()) {
            alert('Alasan pengajuan kartu wajib diisi!');
            return;
          }

          addCardRequest({
            studentId: selectedStudent.id,
            studentName: selectedStudent.fullName,
            class: selectedStudent.currentClass,
            nisn: selectedStudent.nisn,
            reason: finalReason,
            date: cardRequestDate,
            status: cardRequestStatus,
            notes: cardNotes,
          });

          setShowAddCardModal(false);
          setSelectedStudentId('');
          setCustomCardReason('');
          setCardNotes('');
          showNotice(`✅ Pengajuan kartu untuk ${selectedStudent.fullName} (${selectedStudent.currentClass}) berhasil disimpan!`);
        };

        const handleDeleteCard = (id: string, name: string) => {
          if (
            window.confirm(
              `Apakah Anda yakin ingin menghapus data pengajuan kartu siswa "${name}"?\n\nGunakan tombol hapus ini jika terdapat kesalahan input data.`
            )
          ) {
            deleteCardRequest(id);
            showNotice(`🗑️ Data pengajuan kartu "${name}" berhasil dihapus.`);
          }
        };

        const handleOpenCardPrintModal = (req: any) => {
          setSelectedCardForPrint(req);
          setShowPrintModal(true);
        };

        return (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            {/* Header & Notice Toast */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Pengajuan & Cetak Ulang Kartu Siswa RFID</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Data pengajuan terintegrasi secara otomatis dengan <strong>Master Data Siswa ({students.length} Siswa Terdaftar)</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <label className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-red-400" />
                  <span>Upload Masal Pas Foto</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleMassPhotoSelect}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowAddCardModal(!showAddCardModal)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-100 flex items-center justify-center space-x-1.5 cursor-pointer transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Pengajuan Kartu</span>
                </button>
              </div>
            </div>

            {/* Notice Alert Banner */}
            {cardNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs">
                <span>{cardNotice}</span>
                <button onClick={() => setCardNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
                  ✕
                </button>
              </div>
            )}

            {/* FORM TAMBAH PENGAJUAN (EXPANDABLE MODAL / PANEL) */}
            {showAddCardModal && (
              <form onSubmit={handleAddCardSubmit} className="bg-slate-50/90 border-2 border-emerald-200/80 p-5 rounded-2xl space-y-4 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-emerald-900 flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Form Pengajuan Kartu Siswa Baru (Sincron Data Siswa)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Pilih Siswa (Synced with Data Siswa) */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pilih Siswa Terdaftar (Sincron Data Siswa) <span className="text-rose-500">*</span></span>
                    </label>
                    <select
                      required
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Siswa dari Data Siswa --</option>
                      {students.map((std) => (
                        <option key={std.id} value={std.id}>
                          {std.fullName} — Kelas {std.currentClass} (NISN: {std.nisn})
                        </option>
                      ))}
                    </select>

                    {/* Preview Box for Selected Student */}
                    {selectedStudent && (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-emerald-900 text-xs">{selectedStudent.fullName}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                            Kelas: {selectedStudent.currentClass}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                          <div><span className="font-semibold text-slate-500">NISN:</span> <span className="font-mono font-bold text-slate-800">{selectedStudent.nisn}</span></div>
                          <div><span className="font-semibold text-slate-500">RFID Tag Current:</span> <span className="font-mono font-bold text-slate-800">{selectedStudent.rfidTag || 'Belum Terdaftar'}</span></div>
                          <div><span className="font-semibold text-slate-500">Jenis Kelamin:</span> <span className="font-bold">{selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
                          <div><span className="font-semibold text-slate-500">Status Siswa:</span> <span className="font-bold text-emerald-700">{selectedStudent.status}</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Alasan Pengajuan */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Alasan Pengajuan / Masalah Kartu <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={cardReasonOption}
                      onChange={(e) => setCardReasonOption(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="Kartu Hilang / Lupa Taruh">Kartu Hilang / Lupa Taruh</option>
                      <option value="Kartu Rusak / Patah Microchip">Kartu Rusak / Patah Microchip</option>
                      <option value="Ganti Kode RFID Tag Baru">Ganti Kode RFID Tag Baru</option>
                      <option value="Pengajuan Kartu Perdana (Siswa Baru)">Pengajuan Kartu Perdana (Siswa Baru)</option>
                      <option value="Lainnya">Lainnya (Ketik Manual)</option>
                    </select>

                    {cardReasonOption === 'Lainnya' && (
                      <input
                        type="text"
                        required
                        placeholder="Tuliskan alasan spesifik..."
                        value={customCardReason}
                        onChange={(e) => setCustomCardReason(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                      />
                    )}
                  </div>

                  {/* 3. Tanggal Pengajuan */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tanggal Pengajuan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={cardRequestDate}
                      onChange={(e) => setCardRequestDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    />
                  </div>

                  {/* 4. Status Cetak Awal */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status Cetak Awal
                    </label>
                    <select
                      value={cardRequestStatus}
                      onChange={(e) => setCardRequestStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-emerald-800"
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Selesai Cetak">Selesai Cetak</option>
                      <option value="Sudah Diterima">Sudah Diterima</option>
                    </select>
                  </div>

                  {/* 5. Catatan / Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Sudah bayar cetak ulang Rp 15.000"
                      value={cardNotes}
                      onChange={(e) => setCardNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengajuan Kartu</span>
                  </button>
                </div>
              </form>
            )}

            {/* FILTER & PENCARIAN BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari Nama Siswa / NISN / Alasan..."
                  value={cardSearchQuery}
                  onChange={(e) => setCardSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                />
              </div>

              <div>
                <select
                  value={cardClassFilter}
                  onChange={(e) => setCardClassFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="Semua Kelas">-- Filter Semua Kelas --</option>
                  {availableClassList.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={cardStatusFilter}
                  onChange={(e) => setCardStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="Semua Status">-- Filter Semua Status --</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai Cetak">Selesai Cetak</option>
                  <option value="Sudah Diterima">Sudah Diterima</option>
                </select>
              </div>
            </div>

            {/* TABEL DATA PENGAJUAN KARTU */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Nama Siswa & Kelas</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Alasan Pengajuan</th>
                    <th className="p-3">Tanggal Pengajuan</th>
                    <th className="p-3 text-center">Status Cetak</th>
                    <th className="p-3 text-center">Menu Aksi / Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCardRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                        Tidak ada data pengajuan kartu siswa yang sesuai dengan pencarian / filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCardRequests.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-xs">{c.studentName}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                            Kelas: {c.class}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 font-bold">{c.nisn || '-'}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{c.reason}</div>
                          {c.notes && <div className="text-[10px] text-slate-400 italic">Ket: {c.notes}</div>}
                        </td>
                        <td className="p-3 font-mono text-slate-600">{c.date}</td>

                        {/* Status Selectable Badge */}
                        <td className="p-3 text-center">
                          <select
                            value={c.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as any;
                              updateCardRequestStatus(c.id, newStatus);
                              if (newStatus === 'Selesai Cetak') {
                                handleOpenCardPrintModal(c);
                                showNotice(`✅ Status kartu ${c.studentName} diset ke 'Selesai Cetak'. Pratinjau cetak kartu dibuka!`);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border cursor-pointer focus:outline-none ${
                              c.status === 'Selesai Cetak'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : c.status === 'Diproses'
                                ? 'bg-sky-100 text-sky-800 border-sky-300'
                                : c.status === 'Sudah Diterima'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Menunggu">⏳ Menunggu</option>
                            <option value="Diproses">⚙️ Diproses</option>
                            <option value="Selesai Cetak">✅ Selesai Cetak</option>
                            <option value="Sudah Diterima">🎉 Sudah Diterima</option>
                          </select>
                        </td>

                        {/* Menu Cetak & Hapus ketika data salah */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenCardPrintModal(c)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                              title="Cetak Kartu Siswa RFID"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak Kartu</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCard(c.id, c.studentName)}
                              className="inline-flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                              title="Hapus data pengajuan jika salah input"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MODAL PRATINJAU & CETAK KARTU SISWA RFID */}
            {showPrintModal && selectedCardForPrint && (() => {
              const studentData = students.find((s) => s.id === selectedCardForPrint.studentId || s.nisn === selectedCardForPrint.nisn);
              const studentPhoto = studentData?.photo;

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 my-8">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold shadow-xs">
                          <Printer className="w-5 h-5 text-blue-900" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 text-base">Cetak Kartu Presensi RFID Siswa</h3>
                          <p className="text-xs text-slate-500 font-medium">Desain Biru Tua & Merah, Latar Belakang Putih (CR80 Standard)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPrintModal(false)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Printable Card Preview Canvas */}
                    <div className="space-y-4 bg-slate-100/80 p-5 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider px-1">
                        <span>📇 Pratinjau Desain Kartu RFID (CR80 Standard)</span>
                        <span className="text-blue-900 font-black">Siap Cetak Fisik / PDF</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 justify-items-center pt-1">
                        {/* TAMPILAN DEPAN / FRONT SIDE */}
                        <div className="w-[310px] h-[195px] bg-white text-slate-900 rounded-2xl p-0 shadow-xl border-2 border-blue-900 relative overflow-hidden flex flex-col justify-between shrink-0 font-sans">
                          {/* Header Bar: Biru Tua */}
                          <div className="bg-blue-900 text-white px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-md bg-white border border-blue-300 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                                {settings.schoolLogo ? (
                                  <img src={settings.schoolLogo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                                ) : (
                                  <School className="w-3.5 h-3.5 text-blue-900" />
                                )}
                              </div>
                              <div className="leading-tight text-left min-w-0">
                                <div className="text-[10px] font-black uppercase tracking-wider text-white truncate max-w-[200px]">
                                  {settings.schoolName || 'SMP NEGERI 1'}
                                </div>
                                <div className="text-[7.5px] text-red-400 font-extrabold uppercase tracking-widest">
                                  KARTU PRESENSI DIGITAL RFID
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Accent Bar: Kombinasi Merah */}
                          <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                          {/* Body Info Siswa: Latar Belakang Putih */}
                          <div className="p-3 bg-white flex space-x-3 items-center my-auto text-left relative z-10">
                            {/* Photo Box & Chip Graphic */}
                            <div className="relative shrink-0">
                              <div className="w-16 h-20 bg-slate-50 border-2 border-blue-900 rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-sm relative group">
                                {studentPhoto ? (
                                  <img src={studentPhoto} alt={selectedCardForPrint.studentName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-1 text-center">
                                    <User className="w-7 h-7 text-blue-900/40" />
                                    <span className="text-[6.5px] font-bold text-red-600 mt-0.5">PAS FOTO</span>
                                  </div>
                                )}

                                {/* Hover / Quick Upload Pas Foto */}
                                <label className="absolute inset-0 bg-blue-900/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[7.5px] font-bold">
                                  <Upload className="w-3.5 h-3.5 text-red-400 mb-0.5" />
                                  <span>Ganti Foto</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleSinglePhotoUpload(selectedCardForPrint.studentId, e)}
                                  />
                                </label>
                              </div>

                              {/* Chip Sensor RFID Graphic */}
                              <div className="absolute -top-1 -right-1 w-4 h-3 bg-gradient-to-br from-amber-400 to-yellow-300 rounded border border-amber-600 flex items-center justify-center shadow-xs">
                                <div className="w-2 h-1 border-t border-b border-amber-800" />
                              </div>
                            </div>

                            {/* Text Info */}
                            <div className="space-y-1 min-w-0 flex-1">
                              <div>
                                <div className="text-[7.5px] uppercase tracking-wider text-red-600 font-black">NAMA LENGKAP SISWA</div>
                                <div className="text-xs font-black truncate text-blue-950 leading-tight">{selectedCardForPrint.studentName}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                                <div>
                                  <span className="text-slate-500 font-bold">NISN:</span>{' '}
                                  <span className="font-mono font-black text-blue-900">{selectedCardForPrint.nisn || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold">Kelas:</span>{' '}
                                  <span className="font-extrabold text-red-600 bg-red-50 px-1 py-0.2 rounded border border-red-200">{selectedCardForPrint.class}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-[7px] text-slate-500 font-mono uppercase font-bold">TAG SENSOR RFID</div>
                                <div className="text-[8.5px] font-mono font-black text-white bg-blue-900 px-1.5 py-0.5 rounded border-l-2 border-red-600 inline-block shadow-2xs">
                                  {studentData?.rfidTag || `RFID-${selectedCardForPrint.nisn}`}
                                </div>
                              </div>
                            </div>

                            {/* Real QR Code Graphic on Card Front */}
                            <div className="shrink-0 bg-white p-1 rounded-lg border border-blue-900 shadow-xs flex flex-col items-center justify-center">
                              <QRCodeSVG
                                value={studentData?.rfidTag || selectedCardForPrint.nisn || 'STUDENT-RFID'}
                                size={44}
                                level="M"
                                fgColor="#1e3a8a"
                                bgColor="#ffffff"
                              />
                              <span className="text-[6.5px] font-mono font-black text-blue-900 mt-0.5">SCAN QR</span>
                            </div>
                          </div>

                          {/* Footer Barcode */}
                          <div className="bg-slate-50 border-t border-slate-200 px-3 py-1 flex items-center justify-between text-[8px] text-blue-950 font-mono">
                            <div className="flex items-center space-x-1.5 font-bold text-red-700">
                              <QrCode className="w-3.5 h-3.5 text-blue-900" />
                              <span className="font-mono font-black">QR-RFID-{selectedCardForPrint.nisn.slice(-6)}</span>
                            </div>
                            <span className="font-sans font-black text-[8px] text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">TA {settings.academicYear || '2026/2027'}</span>
                          </div>
                        </div>

                        {/* TAMPILAN BELAKANG / BACK SIDE */}
                        <div className="w-[310px] h-[195px] bg-white text-slate-900 rounded-2xl p-0 shadow-xl border-2 border-blue-900 relative overflow-hidden flex flex-col justify-between shrink-0 text-left font-sans">
                          {/* Header Bar: Biru Tua */}
                          <div className="bg-blue-900 text-white px-3 py-1.5 flex items-center justify-between">
                            <div className="text-[8.5px] font-black uppercase tracking-wider text-red-400">
                              KETENTUAN PENGGUNAAN KARTU PRESENSI
                            </div>
                            <div className="text-[7.5px] text-white font-mono font-bold">CR80 RFID & QR</div>
                          </div>

                          {/* Accent Bar: Kombinasi Merah */}
                          <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                          {/* Body Content: Latar Belakang Putih */}
                          <div className="p-3 text-[8px] space-y-2 flex-1 flex flex-col justify-between bg-white">
                            <div className="flex items-start justify-between space-x-2">
                              <ol className="text-[7.5px] text-slate-700 space-y-1 list-decimal pl-3.5 leading-tight font-medium flex-1">
                                <li>Kartu ini wajib dibawa setiap hari untuk tap presensi masuk & pulang.</li>
                                <li>Dilarang merusak, memotong, atau melipat area chip sensor RFID / QR.</li>
                                <li>Kartu tidak dapat dipindahtangankan kepada siswa lain.</li>
                                <li>Jika menemukan kartu ini, mohon kembalikan ke bagian piket sekolah.</li>
                              </ol>

                              {/* QR Code on Card Back */}
                              <div className="shrink-0 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs flex flex-col items-center justify-center">
                                <QRCodeSVG
                                  value={`PRESENSI:${selectedCardForPrint.nisn}:${studentData?.rfidTag || selectedCardForPrint.nisn}`}
                                  size={40}
                                  level="M"
                                  fgColor="#0f172a"
                                  bgColor="#ffffff"
                                />
                                <span className="text-[6px] font-mono font-bold text-slate-500 mt-0.5">VERIFIED</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-slate-200 pt-1.5 text-[8px] text-slate-600">
                              <div>
                                <div className="font-black text-blue-900">{settings.schoolName || 'SMP Negeri 1'}</div>
                                <div className="text-[7px] text-red-600 font-bold">Sistem Presensi Digital RFID & QR</div>
                              </div>
                              <div className="text-center min-w-[100px]">
                                <div className="text-[6.5px] text-slate-500 font-bold">Mengetahui,</div>
                                <div className="text-[6.5px] text-slate-600 font-extrabold">Kepala Sekolah</div>
                                <div className="font-extrabold text-blue-950 text-[7.5px] mt-1 border-b border-slate-400 pb-0.5 leading-tight">
                                  {settings.principalName || 'Dr. H. Ahmad Wijaya, M.Pd.'}
                                </div>
                                <div className="text-[6px] font-mono text-slate-500 font-bold mt-0.5">
                                  NIP. {settings.principalNip || '19750812 199903 1 002'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Manual Upload Pas Foto Section in Print Modal */}
                    <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-900 shrink-0" />
                        <div>
                          <span className="font-bold text-blue-950">Pas Foto Siswa: </span>
                          {studentPhoto ? (
                            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">✅ Foto Tersedia</span>
                          ) : (
                            <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded border border-red-300">⚠️ Belum Ada Foto</span>
                          )}
                        </div>
                      </div>

                      <label className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-red-400" />
                        <span>Upload Pas Foto Manual Siswa Ini</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSinglePhotoUpload(selectedCardForPrint.studentId, e)}
                        />
                      </label>
                    </div>

                    {/* Status Banner */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-900">
                          Status Kartu: <span className="bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-md font-extrabold">{selectedCardForPrint.status}</span>
                        </span>
                      </div>

                      {selectedCardForPrint.status !== 'Selesai Cetak' && selectedCardForPrint.status !== 'Sudah Diterima' && (
                        <button
                          type="button"
                          onClick={() => {
                            updateCardRequestStatus(selectedCardForPrint.id, 'Selesai Cetak');
                            setSelectedCardForPrint({ ...selectedCardForPrint, status: 'Selesai Cetak' });
                            showNotice(`✅ Status kartu ${selectedCardForPrint.studentName} diperbarui ke 'Selesai Cetak'!`);
                          }}
                          className="text-[11px] font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs"
                        >
                          Tandai Selesai Cetak
                        </button>
                      )}
                    </div>

                    {/* Modal Footer Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          updateCardRequestStatus(selectedCardForPrint.id, 'Sudah Diterima');
                          setShowPrintModal(false);
                          showNotice(`🎉 Kartu untuk ${selectedCardForPrint.studentName} ditandai 'Sudah Diterima' oleh siswa.`);
                        }}
                        className="w-full sm:w-auto text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-2 rounded-xl cursor-pointer"
                      >
                        Tandai Sudah Diterima Siswa
                      </button>

                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setShowPrintModal(false)}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                          Tutup
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="bg-blue-900 hover:bg-blue-950 active:scale-95 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition-all"
                        >
                          <Printer className="w-4 h-4 text-red-400" />
                          <span>Cetak Kartu Sekarang (Print / PDF)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* MODAL UPLOAD MASAL PAS FOTO SISWA */}
            {showMassPhotoModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 my-8">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold shadow-xs">
                        <Upload className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-base">Upload Masal Pas Foto Siswa (Kartu RFID)</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {massPhotoItems.length} File Foto Terdeteksi. Sistem mencocokkan nama file dengan NISN/Nama Siswa.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMassPhotoModal(false);
                        setMassPhotoItems([]);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Information Banner */}
                  <div className="bg-blue-50 border border-blue-200 text-blue-950 p-3.5 rounded-2xl text-xs space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-blue-900">
                      <Sparkles className="w-4 h-4 text-red-600" />
                      <span>Tips Penamaan File Foto Masal:</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600">
                      Beri nama file foto sesuai NISN (contoh: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-red-600 border border-blue-200">0078912341.jpg</code>) atau Nama Siswa (contoh: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-blue-900 border border-blue-200">Aditya Pratama.jpg</code>).
                    </p>
                  </div>

                  {/* Photo Preview Grid & Mapping */}
                  <div className="max-h-96 overflow-y-auto pr-1 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {massPhotoItems.map((item, idx) => {
                        const targetStudent = students.find((s) => s.id === item.studentId);
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border flex items-center space-x-3 transition-all ${
                              item.studentId
                                ? 'bg-emerald-50/70 border-emerald-300'
                                : 'bg-slate-50 border-amber-300'
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="w-14 h-16 bg-white border-2 border-blue-900 rounded-xl overflow-hidden shrink-0 shadow-xs relative">
                              <img src={item.previewUrl} alt={item.fileName} className="w-full h-full object-cover" />
                            </div>

                            {/* Details & Mapping */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="text-[11px] font-mono font-bold text-slate-700 truncate" title={item.fileName}>
                                📄 {item.fileName}
                              </div>

                              <select
                                value={item.studentId}
                                onChange={(e) => {
                                  const updated = [...massPhotoItems];
                                  updated[idx].studentId = e.target.value;
                                  setMassPhotoItems(updated);
                                }}
                                className="w-full text-xs font-bold px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                              >
                                <option value="">-- Pilih Siswa Terkait --</option>
                                {students.map((std) => (
                                  <option key={std.id} value={std.id}>
                                    {std.fullName} ({std.currentClass} - NISN: {std.nisn})
                                  </option>
                                ))}
                              </select>

                              {targetStudent ? (
                                <div className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span className="truncate">Terhubung ke: {targetStudent.fullName}</span>
                                </div>
                              ) : (
                                <div className="text-[10px] font-bold text-amber-700 flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Belum terhubung ke siswa</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-blue-900 hover:text-blue-950 underline cursor-pointer">
                      + Tambah File Foto Lainnya
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleMassPhotoSelect}
                      />
                    </label>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMassPhotoModal(false);
                          setMassPhotoItems([]);
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyMassPhotos}
                        className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md shadow-blue-200 flex items-center space-x-1.5 cursor-pointer transition-all"
                      >
                        <Save className="w-4 h-4 text-red-400" />
                        <span>Simpan & Terapkan Semua Foto ({massPhotoItems.filter((i) => i.studentId).length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB CONTENT 4: FACEID */}
      {activeConfigTab === 'faceid' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <ScanFace className="w-4 h-4 text-sky-600" />
            <span>Konfigurasi Sensitivitas Machine Learning FaceID Scanner</span>
          </h3>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Threshold Akurasi Pengenalan Wajah (%)
              </label>
              <input
                type="number"
                min={50}
                max={99}
                value={formData.faceIdThreshold}
                onChange={(e) => setFormData({ ...formData, faceIdThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
              />
              <span className="text-[11px] text-slate-500 font-medium">Rekomendasi: 85% untuk menghindari false-positive.</span>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
              <h4 className="font-bold text-xs text-sky-900">Status Modul FaceID Scanner Gate: ACTIVE</h4>
              <p className="text-[11px] text-sky-700">Kamera gerbang sekolah terhubung secara real-time ke web camera AI Studio preview.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan FaceID Setting</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT 5: LOKASI SISWA */}
      {activeConfigTab === 'lokasi-siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-rose-600" />
            <span>Pemantauan Geolocation Real-Time Siswa</span>
          </h3>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-800">Status GPS Tracking Radius Siswa: ON</span>
            <p className="text-xs text-slate-600 font-medium">
              Sistem akan memverifikasi koordinat GPS latitude dan longitude perangkat seluler siswa ketika melakukan TAP mandiri di luar sekolah.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: LOKASI SEKOLAH */}
      {activeConfigTab === 'lokasi-sekolah' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Koordinat Geofencing Sekolah & Radius Toleransi</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Latitude Sekolah</label>
              <input
                type="text"
                value={formData.schoolLat}
                onChange={(e) => setFormData({ ...formData, schoolLat: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Longitude Sekolah</label>
              <input
                type="text"
                value={formData.schoolLng}
                onChange={(e) => setFormData({ ...formData, schoolLng: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Radius Toleransi (Meter)</label>
              <input
                type="number"
                value={formData.schoolRadiusMeters}
                onChange={(e) => setFormData({ ...formData, schoolRadiusMeters: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Geofencing Sekolah</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT 7: SETTING SYSTEM */}
      {activeConfigTab === 'system' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* SECTION 1: DATA SEKOLAH & BRANDING */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                <Building2 className="w-4.5 h-4.5 text-indigo-600" />
                <span>Data Sekolah & Branding Aplikasi</span>
              </h3>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100">
                Profil & Identitas Lembaga
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Sekolah / Lembaga
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.schoolName || ''}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="Contoh: SMA Negeri 1 Nusa Bangsa"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Aplikasi (Branding)
                </label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-violet-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.appNameBranding || ''}
                    onChange={(e) => setFormData({ ...formData, appNameBranding: e.target.value })}
                    placeholder="Contoh: Presensi Digital Pro"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kota / Kabupaten
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Contoh: Kota Jakarta Selatan"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kepala Sekolah
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.principalName || ''}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="Contoh: Dr. H. Ahmad Wijaya, M.Pd."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIP Kepala Sekolah
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.principalNip || ''}
                    onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                    placeholder="Contoh: 19750812 199903 1 002"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Lengkap Sekolah
                </label>
                <textarea
                  rows={2}
                  value={formData.schoolAddress || ''}
                  onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                  placeholder="Contoh: Jl. Pemuda Pendidikan No. 45, Kebayoran Baru"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>

              {/* LOGO SEKOLAH */}
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Logo Sekolah & Maskot Aplikasi</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-indigo-200 bg-white p-1 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {formData.schoolLogo ? (
                      <img
                        src={formData.schoolLogo}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <School className="w-8 h-8 text-indigo-500" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={formData.schoolLogo || ''}
                        onChange={(e) => setFormData({ ...formData, schoolLogo: e.target.value })}
                        placeholder="https://domain-sekolah.sch.id/logo.png"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-700"
                      />
                      <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs inline-flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Upload File Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoFileUpload}
                        />
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-500 font-medium">Preset Logo Contoh:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            schoolLogo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
                          })
                        }
                        className="px-2 py-0.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] font-bold rounded cursor-pointer transition-colors"
                      >
                        Lambang Garuda
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            schoolLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
                          })
                        }
                        className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold rounded cursor-pointer transition-colors"
                      >
                        Buku Edukasi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: FITUR & SAKELAR MODUL (TOMBOL AKTIFKAN) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                <Sliders className="w-4.5 h-4.5 text-violet-600" />
                <span>Modul & Sakelar Otomatisasi Fitur</span>
              </h3>
              <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-[11px] font-bold rounded-lg border border-violet-100">
                Kontrol Sistem
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Aktifkan Presensi Kelas */}
              <div className="p-4 border border-slate-200/90 rounded-2xl bg-slate-50/50 flex items-start justify-between gap-3 hover:bg-white transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-slate-800">Aktifkan Presensi Kelas</span>
                    {formData.enableClassAttendance ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                        AKTIF
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">
                        NONAKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Mengizinkan guru menginput presensi siswa per mata pelajaran di ruang kelas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, enableClassAttendance: !formData.enableClassAttendance })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.enableClassAttendance ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formData.enableClassAttendance ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2. Aktifkan Presensi Daring */}
              <div className="p-4 border border-slate-200/90 rounded-2xl bg-slate-50/50 flex items-start justify-between gap-3 hover:bg-white transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-slate-800">Aktifkan Presensi Daring</span>
                    {formData.enableOnlineAttendance ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                        AKTIF
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">
                        NONAKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Memungkinkan siswa melakukan presensi mandiri secara online melalui smartphone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, enableOnlineAttendance: !formData.enableOnlineAttendance })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.enableOnlineAttendance ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formData.enableOnlineAttendance ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 3. Poin Pelanggaran Otomatis */}
              <div className="p-4 border border-amber-200/90 rounded-2xl bg-amber-50/40 flex items-start justify-between gap-3 hover:bg-amber-50/70 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="font-extrabold text-xs text-amber-950">Poin Pelanggaran Otomatis</span>
                    {formData.autoViolationPoints ? (
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-extrabold rounded-full">
                        AKTIF
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">
                        MATI
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
                    Otomatis menambahkan poin keterlambatan/alpa ke rekapitulasi kedisiplinan siswa.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, autoViolationPoints: !formData.autoViolationPoints })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.autoViolationPoints ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formData.autoViolationPoints ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 4. Wajib Token Presensi Pagi */}
              <div className="p-4 border border-violet-200/90 rounded-2xl bg-violet-50/40 flex items-start justify-between gap-3 hover:bg-violet-50/70 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-violet-600" />
                    <span className="font-extrabold text-xs text-violet-950">Wajib Token Presensi Pagi</span>
                    {formData.requireMorningToken ? (
                      <span className="px-2 py-0.5 bg-violet-200 text-violet-900 text-[10px] font-extrabold rounded-full">
                        AKTIF
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">
                        MATI
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-violet-900/80 leading-relaxed font-medium">
                    Mewajibkan input kode token unik harian untuk memverifikasi lokasi presensi pagi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, requireMorningToken: !formData.requireMorningToken })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.requireMorningToken ? 'bg-violet-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formData.requireMorningToken ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* TOKEN INPUT FIELD (IF REQUIRE MORNING TOKEN IS ACTIVE) */}
            {formData.requireMorningToken && (
              <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl text-white space-y-3 shadow-md shadow-violet-200/50 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-violet-200" />
                    <span className="font-extrabold text-xs uppercase tracking-wider">Token Presensi Pagi Hari Ini</span>
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomToken}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Acak Kode Baru</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.morningToken || ''}
                    onChange={(e) => setFormData({ ...formData, morningToken: e.target.value.toUpperCase() })}
                    placeholder="EDU-8921"
                    className="w-full px-4 py-2.5 rounded-xl bg-white text-violet-950 font-mono font-black text-sm tracking-widest uppercase focus:outline-none shadow-inner"
                  />
                  <span className="px-3 py-2 bg-emerald-400 text-emerald-950 text-xs font-black rounded-xl shrink-0">
                    VALID
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md shadow-indigo-300/40 flex items-center space-x-2 transition-all cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Sistem</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
