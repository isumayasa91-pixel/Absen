import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  ScanBarcode,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Clock,
  Radio,
  Sparkles,
  School,
  Zap,
} from 'lucide-react';

interface RfidScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RfidScanModal: React.FC<RfidScanModalProps> = ({ isOpen, onClose }) => {
  const { students, tapRFIDOrScan, settings } = useApp();
  const [scanInput, setScanInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScanResult, setLastScanResult] = useState<{
    student: Student | null;
    message: string;
    success: boolean;
    type: 'masuk' | 'pulang' | 'terlambat' | 'error';
    time: string;
  } | null>(null);

  const [scanHistory, setScanHistory] = useState<
    Array<{
      id: string;
      studentName: string;
      className: string;
      time: string;
      type: 'masuk' | 'pulang' | 'terlambat' | 'error';
      message: string;
    }>
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Play audio chime using Web Audio API
  const playChime = (type: 'masuk' | 'pulang' | 'terlambat' | 'error') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'terlambat') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15); // A4
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'pulang') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // 'masuk' -> crisp double beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const processScan = (query: string) => {
    if (!query.trim()) return;

    const res = tapRFIDOrScan(query, 'RFID');
    const nowTime = new Date().toLocaleTimeString('id-ID');

    setLastScanResult({
      student: res.student,
      message: res.message,
      success: res.success,
      type: res.type || (res.success ? 'masuk' : 'error'),
      time: nowTime,
    });

    playChime(res.type || (res.success ? 'masuk' : 'error'));

    if (res.student) {
      setScanHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          studentName: res.student?.fullName || query,
          className: res.student?.currentClass || '-',
          time: nowTime,
          type: res.type || 'masuk',
          message: res.message,
        },
        ...prev.slice(0, 14),
      ]);
    }

    setScanInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScan(scanInput);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 space-y-6 animate-in zoom-in-95 duration-200 my-6">
        {/* Header Terminal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/30">
              <ScanBarcode className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-slate-900 text-lg tracking-tight">Terminal Scan Kartu RFID Siswa</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  SENSOR ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Tempelkan kartu RFID pada scanner USB atau ketik ID/NISN di bawah ini
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-blue-50 text-blue-900 border-blue-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="Toggle Suara Beep Scan"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-red-600" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Suara Beep' : 'Mute'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Live Input Field & Scanner Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Zap className="w-5 h-5 text-red-600 animate-bounce" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Tempelkan kartu RFID / Scan Barcode di sini..."
                  className="w-full pl-11 pr-24 py-3.5 bg-slate-900 text-amber-300 font-mono text-base font-black rounded-2xl border-2 border-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-900/30 shadow-inner placeholder:text-slate-500 tracking-wider"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs px-4 rounded-xl shadow-xs cursor-pointer transition-all flex items-center space-x-1"
                >
                  <span>Scan</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-medium flex items-center justify-between px-1">
                <span>💡 Scanner USB mendukung auto-submit saat kartu ditempelkan.</span>
                <span className="text-blue-900 font-bold">Jam Sekarang: {new Date().toLocaleTimeString('id-ID')}</span>
              </p>
            </form>

            {/* Display Visual Result Card Popup */}
            {lastScanResult ? (
              <div
                className={`p-5 rounded-2xl border-2 shadow-lg transition-all animate-in zoom-in-95 duration-150 ${
                  !lastScanResult.success
                    ? 'bg-red-50/90 border-red-500 text-red-950'
                    : lastScanResult.type === 'terlambat'
                    ? 'bg-amber-50/90 border-amber-500 text-amber-950'
                    : lastScanResult.type === 'pulang'
                    ? 'bg-blue-50/90 border-blue-600 text-blue-950'
                    : 'bg-emerald-50/90 border-emerald-500 text-emerald-950'
                }`}
              >
                {lastScanResult.success && lastScanResult.student ? (
                  <div className="flex items-center space-x-4">
                    {/* Student Photo */}
                    <div className="w-20 h-24 rounded-2xl bg-white border-2 border-blue-900 overflow-hidden shrink-0 shadow-md relative">
                      {lastScanResult.student.photo ? (
                        <img
                          src={lastScanResult.student.photo}
                          alt={lastScanResult.student.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-blue-900 font-black p-1 text-center">
                          <UserCheck className="w-8 h-8 text-blue-900/50 mb-1" />
                          <span className="text-[8px]">PAS FOTO</span>
                        </div>
                      )}
                    </div>

                    {/* Student Text Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white ${
                            lastScanResult.type === 'terlambat'
                              ? 'bg-amber-600'
                              : lastScanResult.type === 'pulang'
                              ? 'bg-blue-900'
                              : 'bg-emerald-600'
                          }`}
                        >
                          {lastScanResult.type === 'terlambat'
                            ? '⚠️ HADIR TERLAMBAT'
                            : lastScanResult.type === 'pulang'
                            ? '🔵 PRESENSI PULANG'
                            : '✅ HADIR TEPAT WAKTU'}
                        </span>
                        <span className="text-xs font-mono font-bold">{lastScanResult.time}</span>
                      </div>

                      <h4 className="text-lg font-black leading-tight text-slate-900 truncate">
                        {lastScanResult.student.fullName}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                        <div>
                          <span className="text-slate-500">Kelas:</span>{' '}
                          <span className="font-extrabold text-blue-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {lastScanResult.student.currentClass}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">NISN:</span>{' '}
                          <span className="font-mono font-black text-slate-900">{lastScanResult.student.nisn}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-600 pt-0.5">
                        <div>
                          Tag RFID: <span className="bg-white px-1.5 py-0.5 rounded border text-blue-900">{lastScanResult.student.rfidTag}</span>
                        </div>
                        <div className="bg-white p-1 rounded-lg border border-slate-300 shadow-2xs flex items-center space-x-1.5">
                          <QRCodeSVG
                            value={lastScanResult.student.rfidTag || lastScanResult.student.nisn}
                            size={32}
                            level="M"
                            fgColor="#0f172a"
                            bgColor="#ffffff"
                          />
                          <span className="text-[9px] font-mono font-bold text-slate-500">QR ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-red-900">
                    <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
                    <div>
                      <h4 className="font-black text-sm">Gagal Melakukan Pemindaian</h4>
                      <p className="text-xs font-semibold">{lastScanResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <Radio className="w-7 h-7 text-red-600 animate-pulse" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Menunggu Pemindaian Kartu RFID</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Silakan tempelkan fisik kartu siswa pada alat scanner RFID USB atau klik salah satu kartu demo di sebelah kanan.
                </p>
              </div>
            )}

            {/* Quick Demo Student Cards for 1-Click Testing */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Simulasi TAP Kartu (1-Click Demo):</span>
                <span className="text-slate-400 font-normal">{students.length} Siswa Terdaftar</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {students.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => processScan(s.rfidTag || s.nisn || s.id)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/80 hover:border-blue-900 text-left flex items-center space-x-2.5 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-extrabold flex items-center justify-center text-xs shrink-0 group-hover:bg-red-600 transition-colors">
                      {s.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-950">{s.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {s.currentClass} &bull; {s.rfidTag}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Scan History Session */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-1.5 font-black text-xs text-slate-800">
                <Clock className="w-4 h-4 text-blue-900" />
                <span>Riwayat Scan Sesi Ini</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{scanHistory.length} Record</span>
            </div>

            {scanHistory.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200/90 text-xs flex items-center justify-between shadow-2xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 truncate">{item.studentName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                        <span className="font-semibold text-blue-900">{item.className}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-600">{item.time}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        item.type === 'terlambat'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : item.type === 'pulang'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {item.type === 'terlambat' ? 'Terlambat' : item.type === 'pulang' ? 'Pulang' : 'Hadir'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                <p>Belum ada aktivitas scan pada sesi ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            Tutup Terminal Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
