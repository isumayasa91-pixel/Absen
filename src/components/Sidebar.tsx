import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  School,
  Users,
  UserCheck,
  BookOpenCheck,
  UserCog,
  Radio,
  ClockAlert,
  UserX,
  FileSpreadsheet,
  FileCheck2,
  LogOut as LeaveIcon,
  GraduationCap,
  Library,
  ScanBarcode,
  BookMarked,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  ScanFace,
  MapPin,
  Map,
  Settings,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, announcements, permissions, logout } = useApp();

  const pendingPermissionsCount = permissions.filter((p) => p.statusApproval === 'Menunggu Persetujuan').length;

  const menuGroups = [
    {
      title: 'MAIN NAVIGATION',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-600 bg-indigo-50' },
        {
          key: 'pengumuman',
          label: 'Pengumuman',
          icon: Megaphone,
          color: 'text-amber-600 bg-amber-50',
          badge: announcements.length > 0 ? announcements.length : undefined,
        },
      ],
    },
    {
      title: 'MENU AKADEMIK',
      items: [
        { key: 'tahun-ajaran', label: 'Tahun Ajaran', icon: CalendarDays, color: 'text-blue-600 bg-blue-50' },
        { key: 'data-kelas', label: 'Data Kelas', icon: School, color: 'text-cyan-600 bg-cyan-50' },
        { key: 'data-siswa', label: 'Data Siswa', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
        { key: 'data-guru', label: 'Data Guru', icon: UserCheck, color: 'text-teal-600 bg-teal-50' },
        { key: 'jurnal-guru', label: 'Jurnal Guru', icon: BookOpenCheck, color: 'text-purple-600 bg-purple-50' },
      ],
    },
    {
      title: 'MENU PENGATURAN',
      items: [
        { key: 'manajemen-user', label: 'Manajemen User', icon: UserCog, color: 'text-purple-600 bg-purple-50' },
      ],
    },
    {
      title: 'MENU PRESENSI',
      items: [
        { key: 'monitor-live', label: 'Monitor Live', icon: Radio, color: 'text-rose-600 bg-rose-50 border border-rose-200' },
        { key: 'terlambat', label: 'Terlambat', icon: ClockAlert, color: 'text-amber-600 bg-amber-50' },
        { key: 'alpa', label: 'Alpa', icon: UserX, color: 'text-rose-600 bg-rose-50' },
        { key: 'rekap-laporan', label: 'Rekap Laporan', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50' },
        {
          key: 'izin-sakit',
          label: 'Izin & Sakit',
          icon: FileCheck2,
          color: 'text-blue-600 bg-blue-50',
          badge: pendingPermissionsCount > 0 ? pendingPermissionsCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        { key: 'izin-keluar', label: 'Izin Keluar', icon: LeaveIcon, color: 'text-orange-600 bg-orange-50' },
        { key: 'rekap-semester', label: 'Rekap Semester', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50' },
      ],
    },
    {
      title: 'MENU PERPUSTAKAAN',
      items: [
        { key: 'perpus-harian', label: 'Perpustakaan Harian', icon: Library, color: 'text-pink-600 bg-pink-50' },
        { key: 'tap-perpus', label: 'TAP Perpus', icon: ScanBarcode, color: 'text-purple-600 bg-purple-50' },
        { key: 'rekap-perpus', label: 'Rekap Perpustakaan', icon: BookMarked, color: 'text-sky-600 bg-sky-50' },
      ],
    },
    {
      title: 'MENU PELANGGARAN',
      items: [
        { key: 'tata-tertib', label: 'Tata Tertib', icon: ShieldAlert, color: 'text-[#E11D48] bg-rose-50' },
        { key: 'pelanggaran', label: 'Pelanggaran', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
        { key: 'rekap-pelanggaran', label: 'Rekap Pelanggaran', icon: FileText, color: 'text-orange-600 bg-orange-50' },
      ],
    },
    {
      title: 'MENU KONFIGURASI',
      items: [
        { key: 'aturan-jam', label: 'Aturan Jam', icon: Clock, color: 'text-blue-600 bg-blue-50' },
        { key: 'kalender-libur', label: 'Kalender Libur', icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
        { key: 'pengajuan-kartu', label: 'Pengajuan Kartu', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
        { key: 'faceid', label: 'FaceID', icon: ScanFace, color: 'text-violet-600 bg-violet-50' },
        { key: 'lokasi-siswa', label: 'Lokasi Siswa', icon: MapPin, color: 'text-rose-600 bg-rose-50' },
        { key: 'lokasi-sekolah', label: 'Lokasi Sekolah', icon: Map, color: 'text-cyan-600 bg-cyan-50' },
        { key: 'setting', label: 'Setting System', icon: Settings, color: 'text-slate-700 bg-slate-100' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-indigo-100/80 h-[calc(100vh-65px)] overflow-y-auto shrink-0 py-4 px-3 sticky top-[65px] scrollbar-thin">
      <div className="space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-black uppercase tracking-wider text-violet-600/90 mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-300/40 font-bold scale-[1.01]'
                        : 'text-slate-700 hover:bg-violet-50/80 hover:text-indigo-950 font-semibold'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'bg-white/20 text-white' : item.color
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white text-indigo-700'
                              : item.badgeColor || 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-90" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Keluar Aplikasi / Sesi Option */}
        <div className="pt-3 border-t border-indigo-100/80">
          <h3 className="px-3 text-[11px] font-black uppercase tracking-wider text-rose-600/90 mb-2">
            SESI APLIKASI
          </h3>
          <button
            id="btn-sidebar-logout"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
                logout();
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 hover:text-rose-900 border border-rose-200/80 transition-all cursor-pointer shadow-2xs group"
            title="Keluar Aplikasi"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-6.5 h-6.5 rounded-lg bg-rose-200/70 text-rose-700 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <LeaveIcon className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold">Keluar Aplikasi</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </aside>
  );
};
