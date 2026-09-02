import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PengumumanView } from './components/views/PengumumanView';
import { TahunAjaranView } from './components/views/TahunAjaranView';
import { DataKelasView } from './components/views/DataKelasView';
import { DataSiswaView } from './components/views/DataSiswaView';
import { DataGuruView } from './components/views/DataGuruView';
import { JurnalGuruView } from './components/views/JurnalGuruView';
import { ManajemenUserView } from './components/views/ManajemenUserView';
import { MonitorLiveView } from './components/views/MonitorLiveView';
import { TerlambatView } from './components/views/TerlambatView';
import { AlpaView } from './components/views/AlpaView';
import { RekapLaporanView } from './components/views/RekapLaporanView';
import { IzinSakitView } from './components/views/IzinSakitView';
import { IzinKeluarView } from './components/views/IzinKeluarView';
import { RekapSemesterView } from './components/views/RekapSemesterView';
import { PerpustakaanView } from './components/views/PerpustakaanView';
import { PelanggaranView } from './components/views/PelanggaranView';
import { KonfigurasiView } from './components/views/KonfigurasiView';
import { FaceIdView } from './components/views/FaceIdView';
import { LesKomputerView } from './components/views/LesKomputerView';
import { DownloadLoginView } from './components/views/DownloadLoginView';
import { LokasiSiswaView } from './components/views/LokasiSiswaView';
import { DaftarNilaiView } from './components/views/DaftarNilaiView';
import { DownloadJurnalGuruView } from './components/views/DownloadJurnalGuruView';

const MainContent: React.FC = () => {
  const { activeTab, currentUser, quotaExceeded } = useApp();

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'pengumuman':
        return <PengumumanView />;
      case 'tahun-ajaran':
        return <TahunAjaranView />;
      case 'data-kelas':
        return <DataKelasView />;
      case 'data-siswa':
        return <DataSiswaView />;
      case 'data-guru':
        return <DataGuruView />;
      case 'jurnal-guru':
        return <JurnalGuruView />;
      case 'download-jurnal-guru':
      case 'unduh-jurnal-guru':
      case 'download-jurnal':
        return <DownloadJurnalGuruView />;
      case 'daftar-nilai':
      case 'nilai':
        return <DaftarNilaiView />;
      case 'manajemen-user':
        return <ManajemenUserView />;
      case 'monitor-live':
        return <MonitorLiveView />;
      case 'faceid':
      case 'scan-face':
      case 'faceid-scanner':
        return <FaceIdView />;
      case 'terlambat':
        return <TerlambatView />;
      case 'alpa':
        return <AlpaView />;
      case 'rekap-laporan':
        return <RekapLaporanView />;
      case 'izin-sakit':
        return <IzinSakitView />;
      case 'izin-keluar':
        return <IzinKeluarView />;
      case 'rekap-semester':
        return <RekapSemesterView />;
      case 'les-komputer':
      case 'faceid-les':
      case 'sesi-les':
      case 'rekap-les':
      case 'absen-les-komputer':
      case 'les':
        return <LesKomputerView />;
      case 'perpustakaan':
      case 'perpus-harian':
      case 'tap-perpus':
      case 'rekap-perpus':
        return <PerpustakaanView />;
      case 'pelanggaran':
      case 'tata-tertib':
      case 'rekap-pelanggaran':
        return <PelanggaranView />;
      case 'lokasi-siswa':
        return <LokasiSiswaView />;
      case 'konfigurasi':
      case 'aturan-jam':
      case 'kalender-libur':
      case 'pengajuan-kartu':
      case 'faceid-config':
      case 'lokasi-sekolah':
      case 'setting':
        return <KonfigurasiView />;
      case 'download-login':
        return <DownloadLoginView />;
      default:
        return <DashboardView />;
    }
  };

  if (!currentUser) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-800 font-sans flex flex-col antialiased animate-fade-in">
      <Header />
      
      {quotaExceeded && (
        <div className="bg-amber-500 text-white px-4 py-3 text-center text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-2 border-b border-amber-600/50 shadow-md">
          <span className="flex items-center gap-1.5 font-black uppercase bg-amber-600 px-2 py-0.5 rounded-md text-[10px] tracking-wide">
            ⚠️ Batas Kuota Tercapai
          </span>
          <span>Aplikasi mencapai batas kuota harian gratis pembacaan database Firestore (Spark Plan).</span>
          <div className="flex gap-2 items-center mt-1 sm:mt-0">
            <a
              href="https://console.firebase.google.com/project/gen-lang-client-0131415670/firestore/databases/ai-studio-aplikasipresensi-b5e66c8a-ad9a-4072-aff3-572cdced10e8/data?openUpgradeDialog=true"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-amber-100 font-black cursor-pointer ml-1"
            >
              Upgrade ke Paket Blaze (Google Console) ↗
            </a>
            <span className="text-white/60">atau tunggu reset kuota harian otomatis besok hari.</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 scrollbar-thin">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
