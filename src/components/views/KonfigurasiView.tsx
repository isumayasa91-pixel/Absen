import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const KonfigurasiView: React.FC = () => {
  const { activeTab: globalActiveTab, settings, updateSettings } = useApp();

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

  // Card requests
  const [cardRequests, setCardRequests] = useState([
    { id: '1', studentName: 'Ahmad Subagyo', class: 'X IPA 1', reason: 'Kartu Hilang', date: '2026-08-20', status: 'Diproses' },
    { id: '2', studentName: 'Siti Rahma', class: 'XI IPS 1', reason: 'Kartu Rusak/Patah', date: '2026-08-22', status: 'Selesai Cetak' },
  ]);

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
      {activeConfigTab === 'kartu' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Pengajuan & Cetak Ulang Kartu Siswa RFID</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Alasan Pengajuan</th>
                  <th className="p-3">Tanggal Pengajuan</th>
                  <th className="p-3 text-center">Status Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {cardRequests.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-bold text-slate-900">{c.studentName}</td>
                    <td className="p-3">{c.class}</td>
                    <td className="p-3 text-slate-600">{c.reason}</td>
                    <td className="p-3 font-mono">{c.date}</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    <input
                      type="text"
                      value={formData.schoolLogo || ''}
                      onChange={(e) => setFormData({ ...formData, schoolLogo: e.target.value })}
                      placeholder="https://domain-sekolah.sch.id/logo.png"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-700"
                    />
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
