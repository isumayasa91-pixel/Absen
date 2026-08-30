import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Bell, ShieldCheck, Key, Clock, School, UserCheck, ScanBarcode } from 'lucide-react';
import { RfidScanModal } from './RfidScanModal';

export const Header: React.FC = () => {
  const { currentUser, logout, settings, academicYears } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRfidModalOpen, setIsRfidModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAY = academicYears.find((y) => y.isActive) || academicYears[0];

  return (
    <>
      <header id="app-header" className="bg-white/90 backdrop-blur-md border-b border-indigo-100/80 sticky top-0 z-30 shadow-xs transition-all">
        <div className="h-1 w-full bg-gradient-to-r from-blue-900 via-indigo-600 to-red-600"></div>
        <div className="px-4 lg:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-300/40 shrink-0 font-bold">
              {settings.schoolLogo ? (
                <img src={settings.schoolLogo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <School className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-slate-900 text-base lg:text-lg leading-tight tracking-tight">
                  {settings.appNameBranding || 'Presensi Digital Pro'}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 border border-emerald-200 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {settings.schoolName} &bull; TA {activeAY ? `${activeAY.yearName} (${activeAY.semester})` : '2026/2027'}
              </p>
            </div>
          </div>

          {/* Right Controls & User Info */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {/* Quick RFID Scan Button */}
            <button
              id="btn-scan-rfid-header"
              onClick={() => setIsRfidModalOpen(true)}
              className="flex items-center space-x-1.5 bg-blue-900 hover:bg-blue-950 active:scale-95 text-white border border-blue-900 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/20 cursor-pointer"
              title="Terminal Scan Kartu RFID"
            >
              <ScanBarcode className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Scan Kartu RFID</span>
            </button>

            {/* Token Indicator if enabled */}
            {settings.requireMorningToken && (
              <div className="hidden md:flex items-center space-x-1.5 bg-amber-50/90 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Token Pagi:</span>
                <span className="font-mono bg-amber-200/90 px-1.5 py-0.5 rounded text-amber-950 tracking-wider">
                  {settings.morningToken}
                </span>
              </div>
            )}

            {/* Clock Ticker */}
            <div className="hidden xl:flex items-center space-x-1.5 bg-indigo-50/70 text-indigo-950 border border-indigo-100 px-2.5 py-1 rounded-xl text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} &bull;{' '}
                <span className="font-mono font-bold text-indigo-950">{currentTime.toLocaleTimeString('id-ID')}</span>
              </span>
            </div>

            {/* User Badge */}
            {currentUser && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-50 to-indigo-50/60 border border-indigo-100 pl-2.5 pr-1.5 py-1 rounded-xl shadow-2xs">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-extrabold text-slate-800 leading-none">{currentUser.name}</span>
                  <span className="text-[10px] text-indigo-600 capitalize font-bold">{currentUser.role} &bull; {currentUser.accessLevel}</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
              </div>
            )}

            {/* Keluar Aplikasi Button (Pojok kanan atas) */}
            <button
              id="btn-logout-top-right"
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
                  logout();
                }
              }}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-rose-700 hover:text-rose-800 border border-rose-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              title="Keluar Aplikasi"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Keluar Aplikasi</span>
            </button>
          </div>
        </div>
      </header>

      <RfidScanModal isOpen={isRfidModalOpen} onClose={() => setIsRfidModalOpen(false)} />
    </>
  );
};
