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

const MainContent: React.FC = () => {
  const { activeTab, currentUser } = useApp();

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
      case 'manajemen-user':
        return <ManajemenUserView />;
      case 'monitor-live':
        return <MonitorLiveView />;
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
      case 'perpustakaan':
      case 'perpus-harian':
      case 'tap-perpus':
      case 'rekap-perpus':
        return <PerpustakaanView />;
      case 'pelanggaran':
      case 'tata-tertib':
      case 'rekap-pelanggaran':
        return <PelanggaranView />;
      case 'konfigurasi':
      case 'aturan-jam':
      case 'kalender-libur':
      case 'pengajuan-kartu':
      case 'faceid':
      case 'lokasi-siswa':
      case 'lokasi-sekolah':
      case 'setting':
        return <KonfigurasiView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-800 font-sans flex flex-col antialiased">
      <Header />
      <div className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 scrollbar-thin">
          {renderView()}
        </main>
      </div>

      {!currentUser && <LoginModal />}
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
