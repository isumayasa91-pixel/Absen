import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/excelExport';
import {
  Monitor,
  Calendar,
  Users,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Laptop,
  Cpu,
  Trash2,
  Download,
  Printer,
  Sparkles,
  QrCode,
  ScanFace,
  CreditCard,
  Edit3,
  Award,
  BookOpen,
  Check,
  X,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  HardDrive,
  CheckSquare,
  Camera,
  RefreshCw,
  Volume2,
  VolumeX,
  Sliders,
  ShieldCheck,
  UserCheck,
  Radio,
  Eye,
} from 'lucide-react';

export const LesKomputerView: React.FC = () => {
  const {
    students,
    activeTab,
    computerSessions,
    addComputerSession,
    updateComputerSession,
    deleteComputerSession,
    computerAttendances,
    addComputerAttendance,
    updateComputerAttendance,
    deleteComputerAttendance,
    clearAllComputerAttendances,
    tapComputerCourse,
    computerMembers,
    addComputerMember,
    deleteComputerMember,
    showNotice,
    settings,
    currentUser,
  } = useApp();

  const getSubTabFromActiveTab = (tab: string): 'presensi' | 'faceid' | 'sesi' | 'peserta' | 'rekap' => {
    if (tab === 'faceid-les') return 'faceid';
    if (tab === 'sesi-les') return 'sesi';
    if (tab === 'rekap-les') return 'rekap';
    return 'presensi';
  };

  const [activeSubTab, setActiveSubTab] = useState<'presensi' | 'faceid' | 'sesi' | 'peserta' | 'rekap'>(() =>
    getSubTabFromActiveTab(activeTab)
  );

  useEffect(() => {
    if (activeTab === 'les-komputer' || activeTab === 'faceid-les' || activeTab === 'sesi-les' || activeTab === 'rekap-les') {
      setActiveSubTab(getSubTabFromActiveTab(activeTab));
    }
  }, [activeTab]);

  // Selected Active Session for live attendance
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    const ongoing = computerSessions.find((s) => s.status === 'Sedang Berlangsung');
    return ongoing ? ongoing.id : computerSessions[0]?.id || '';
  });

  useEffect(() => {
    if (!selectedSessionId && computerSessions.length > 0) {
      setSelectedSessionId(computerSessions[0].id);
    }
  }, [computerSessions, selectedSessionId]);

  const currentSession = computerSessions.find((s) => s.id === selectedSessionId) || computerSessions[0];

  // Live Check-in State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedPcNumber, setSelectedPcNumber] = useState<string>('PC-01');
  const [tapMethod, setTapMethod] = useState<'RFID' | 'FaceID' | 'QR' | 'Manual'>('RFID');
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');
  const [lastCheckInNotice, setLastCheckInNotice] = useState<string>('');

  // Sesi Form Modal / State
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState<boolean>(false);
  const [newTopic, setNewTopic] = useState<string>('');
  const [newTargetClass, setNewTargetClass] = useState<string>('Semua Kelas');
  const [newInstructor, setNewInstructor] = useState<string>('Ir. Budi Santoso, M.Kom');
  const [newLabRoom, setNewLabRoom] = useState<string>('Lab Komputer 1 (Multimedia & Software)');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTimeStart, setNewTimeStart] = useState<string>('15:30');
  const [newTimeEnd, setNewTimeEnd] = useState<string>('17:00');
  const [newMaxCapacity, setNewMaxCapacity] = useState<number>(36);
  const [newDescription, setNewDescription] = useState<string>('');

  // Member Form State
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const [memberStudentId, setMemberStudentId] = useState<string>(students[0]?.id || '');
  const [memberBatch, setMemberBatch] = useState<string>('Kelompok A - Web & Coding');
  const [memberPreferredPc, setMemberPreferredPc] = useState<string>('PC-01');

  // Manual Attendance Modal State
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState<boolean>(false);
  const [manualStudentId, setManualStudentId] = useState<string>(students[0]?.id || '');
  const [manualStatus, setManualStatus] = useState<'Hadir' | 'Izin' | 'Sakit' | 'Alpa'>('Hadir');
  const [manualPcNumber, setManualPcNumber] = useState<string>('PC-01');
  const [manualTaskScore, setManualTaskScore] = useState<number>(85);
  const [manualTaskNotes, setManualTaskNotes] = useState<string>('Presensi manual oleh Guru / Instruktur.');

  // Filter state for Rekap
  const [filterSessionRekap, setFilterSessionRekap] = useState<string>('ALL');
  const [filterClassRekap, setFilterClassRekap] = useState<string>('ALL');
  const [filterSearchRekap, setFilterSearchRekap] = useState<string>('');

  // Modal Print Certificate / Laporan
  const [printStudentData, setPrintStudentData] = useState<any | null>(null);

  // Total PCs in lab (1 to 32)
  const labPcList = Array.from({ length: 32 }, (_, i) => `PC-${String(i + 1).padStart(2, '0')}`);

  // Get current session attendances
  const sessionAttendances = computerAttendances.filter((a) => a.sessionId === (currentSession?.id || ''));

  // Video & Stream State for Face ID Lab
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Scanner Tuning & Controls
  const [threshold, setThreshold] = useState<number>(85);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<boolean>(false);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);

  // Face ID Quick Simulation / Target Selector
  const [faceIdTargetStudentId, setFaceIdTargetStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [faceIdPreferredPc, setFaceIdPreferredPc] = useState<string>('');

  // Last Face ID Match & Check-in Result
  const [lastFaceIdResult, setLastFaceIdResult] = useState<{
    student: any | null;
    pcNumber: string;
    message: string;
    success: boolean;
    time: string;
    confidence: number;
    capturedSnapshot?: string;
  } | null>(null);

  // Load available video devices
  useEffect(() => {
    let isMounted = true;
    const getDevices = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = deviceList.filter((d) => d.kind === 'videoinput');
        if (isMounted) {
          setDevices(videoDevs);
        }
      } catch (err) {
        console.warn('Gagal mengambil daftar kamera:', err);
      }
    };
    getDevices();
    return () => {
      isMounted = false;
    };
  }, []);

  // WebCam Stream initializer when on Face ID tab
  useEffect(() => {
    if (activeSubTab !== 'faceid') {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let isMounted = true;
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Fitur WebCam tidak didukung pada peramban ini.');
        }

        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          const videoEl = videoRef.current;
          videoEl.srcObject = mediaStream;
          videoEl.onloadedmetadata = () => {
            if (!isMounted || !videoEl) return;
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                if (err.name !== 'AbortError') console.warn('Video playback:', err);
              });
            }
          };
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Kamera Les Komputer gagal dibuka:', err);
        const errStr = ((err?.name || '') + ' ' + (err?.message || '') + ' ' + (err?.toString() || '')).toLowerCase();
        const isPermissionError = errStr.includes('notallowed') || 
                                  errStr.includes('permission') || 
                                  errStr.includes('denied') || 
                                  errStr.includes('dismissed');

        if (isPermissionError) {
          setCameraError(
            'Izin kamera ditolak atau diabaikan (Permission dismissed). Karena aplikasi ini berjalan di dalam bingkai (iframe) AI Studio, silakan lakukan hal berikut untuk mengatasinya:\n\n' +
            '1. Klik tombol "Buka di Tab Baru" (Open in New Tab) di bagian kanan atas layar AI Studio agar aplikasi berjalan di halaman mandiri.\n' +
            '2. Klik ikon gembok/kamera di sebelah kiri bilah alamat browser (URL bar), lalu ubah izin Kamera menjadi "Izinkan" (Allow).\n' +
            '3. Muat ulang halaman dan coba aktifkan kamera kembali.'
          );
        } else {
          setCameraError(
            err?.message || 'Kamera tidak dapat diakses. Pastikan izin kamera aktif.'
          );
        }
      }
    };

    if (isCameraActive) {
      startCamera();
    }

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
        videoRef.current.srcObject = null;
      }
    };
  }, [activeSubTab, isCameraActive, selectedDeviceId, facingMode]);

  // Audio Chimes and Sound FX (Web Audio API)
  const playFaceIdSound = (type: 'success' | 'error') => {
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
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
      }
    } catch (e) {
      // AudioContext fallback
    }
  };

  const speakFaceIdVoice = (text: string) => {
    if (!speechEnabled) return;
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Capture Snapshot from Camera Video
  const captureSnapshot = (): string | undefined => {
    if (!videoRef.current) return undefined;
    try {
      const v = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth || 640;
      canvas.height = v.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (e) {
      console.error('Gagal mengambil cuplikan snapshot Face ID:', e);
    }
    return undefined;
  };

  // Process Face Attendance for Lab
  const processFaceIdCheckIn = (studentToLog: any, customPc?: string, customConfidence?: number) => {
    if (cooldown) return;
    if (!currentSession) {
      showNotice('Pilih atau buat sesi les komputer terlebih dahulu!');
      return;
    }

    setIsScanning(true);
    setCooldown(true);

    const snapshot = captureSnapshot();
    const conf = customConfidence || (Math.floor(Math.random() * 8) + threshold);
    setConfidenceScore(conf);

    // Determine target PC number: custom PC, or member's preferred PC, or next unoccupied PC
    const memberInfo = computerMembers.find((m) => m.studentId === studentToLog.id);
    const usedPcs = sessionAttendances.map((a) => a.pcNumber);
    const assignedPc =
      customPc ||
      memberInfo?.preferredPc ||
      labPcList.find((pc) => !usedPcs.includes(pc)) ||
      'PC-01';

    const res = tapComputerCourse(studentToLog.id, currentSession.id, assignedPc, 'FaceID');
    const nowTime = new Date().toLocaleTimeString('id-ID');

    setLastFaceIdResult({
      student: studentToLog,
      pcNumber: assignedPc,
      message: res.message,
      success: res.success,
      time: nowTime,
      confidence: conf,
      capturedSnapshot: snapshot,
    });

    if (res.success) {
      setLastCheckInNotice(res.message);
      playFaceIdSound('success');
      speakFaceIdVoice(`Presensi Face ID berhasil! Ananda ${studentToLog.fullName}, silakan menuju ${assignedPc}.`);
      showNotice(res.message);
    } else {
      playFaceIdSound('error');
      speakFaceIdVoice('Wajah terdeteksi namun presensi gagal.');
      showNotice(res.message);
    }

    setTimeout(() => {
      setIsScanning(false);
    }, 1000);

    setTimeout(() => {
      setCooldown(false);
    }, 2800);
  };

  // Handler: Tap / Scan Presensi Siswa
  const handleCheckInSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentSession) {
      showNotice('Pilih atau buat sesi les komputer terlebih dahulu!');
      return;
    }
    if (!selectedStudentId) {
      showNotice('Pilih siswa terlebih dahulu!');
      return;
    }

    const res = tapComputerCourse(selectedStudentId, currentSession.id, selectedPcNumber, tapMethod);
    if (res.success) {
      setLastCheckInNotice(res.message);
      showNotice(res.message);

      // Play audio feedback
      try {
        if ('speechSynthesis' in window) {
          const std = students.find((s) => s.id === selectedStudentId);
          const text = `Presensi les komputer ${std?.fullName || 'siswa'} di ${selectedPcNumber} berhasil`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'id-ID';
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        // ignore speech synthesis error
      }

      // Auto advance to next available PC
      const usedPcs = sessionAttendances.map((a) => a.pcNumber);
      const nextAvailable = labPcList.find((pc) => !usedPcs.includes(pc) && pc !== selectedPcNumber);
      if (nextAvailable) setSelectedPcNumber(nextAvailable);
    } else {
      showNotice(res.message);
    }
  };

  // Handler: Fast check-in all enrolled members
  const handleCheckInAllMembers = () => {
    if (!currentSession) return;
    let count = 0;
    computerMembers.forEach((m, idx) => {
      const pc = m.preferredPc || `PC-${String(idx + 1).padStart(2, '0')}`;
      const res = tapComputerCourse(m.studentId, currentSession.id, pc, 'Manual');
      if (res.success) count++;
    });
    showNotice(`Berhasil mencatat kehadiran ${count} siswa peserta les komputer!`);
  };

  // Handler: Add Manual Attendance
  const handleAddManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) {
      showNotice('Pilih atau buat sesi les komputer terlebih dahulu!');
      return;
    }
    if (!manualStudentId) {
      showNotice('Pilih siswa terlebih dahulu!');
      return;
    }

    const std = students.find((s) => s.id === manualStudentId);
    if (!std) return;

    // Check if attendance already exists for this student in this session
    const existing = computerAttendances.find(
      (a) => a.sessionId === currentSession.id && a.studentId === manualStudentId
    );

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const attendanceData = {
      sessionId: currentSession.id,
      sessionTopic: currentSession.topic,
      studentId: std.id,
      studentName: std.fullName,
      class: std.currentClass,
      nisn: std.nisn,
      date: currentSession.date || now.toISOString().split('T')[0],
      timeIn: existing ? existing.timeIn : timeStr,
      tapMethod: 'Manual' as const,
      pcNumber: manualStatus === 'Hadir' ? manualPcNumber : '-',
      status: manualStatus,
      taskScore: manualStatus === 'Hadir' ? manualTaskScore : undefined,
      taskNotes: manualTaskNotes,
    };

    if (existing) {
      updateComputerAttendance(existing.id, attendanceData);
      showNotice(`Presensi manual untuk ${std.fullName} berhasil diperbarui!`);
    } else {
      addComputerAttendance(attendanceData);
      showNotice(`Presensi manual untuk ${std.fullName} berhasil ditambahkan!`);
    }

    setIsManualAttendanceModalOpen(false);
  };

  // Handler: Add New Session
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) {
      showNotice('Topik materi praktikum harus diisi!');
      return;
    }

    addComputerSession({
      sessionCode: `LES-KOMP-${String(computerSessions.length + 1).padStart(2, '0')}`,
      topic: newTopic.trim(),
      targetClass: newTargetClass.trim(),
      instructor: newInstructor.trim(),
      labRoom: newLabRoom,
      date: newDate,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      maxCapacity: Number(newMaxCapacity) || 36,
      status: 'Sedang Berlangsung',
      description: newDescription.trim(),
    });

    showNotice(`Sesi materi "${newTopic}" berhasil dibuat dan diaktifkan!`);
    setIsAddSessionModalOpen(false);
    setNewTopic('');
    setNewTargetClass('Semua Kelas');
    setNewDescription('');
  };

  // Handler: Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    addComputerMember(memberStudentId, memberBatch, memberPreferredPc);
    showNotice('Peserta les komputer berhasil didaftarkan!');
    setIsAddMemberModalOpen(false);
  };

  // Handler: Export Excel Rekap
  const handleExportExcel = () => {
    const data = filteredRekap.map((att, idx) => ({
      No: idx + 1,
      Tanggal: att.date,
      'Sesi Materi': att.sessionTopic,
      'Nama Siswa': att.studentName,
      Kelas: att.class,
      NISN: att.nisn,
      'Nomor PC': att.pcNumber,
      'Jam Masuk': att.timeIn,
      Metode: att.tapMethod,
      Status: att.status,
      'Nilai Tugas': att.taskScore ?? '-',
      Catatan: att.taskNotes || '-',
    }));

    exportToExcel(data, `Rekap_Presensi_Les_Komputer_${new Date().toISOString().split('T')[0]}`);
  };

  // Filtered Students for Quick Selector
  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      s.currentClass.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      s.nisn.includes(searchStudentTerm)
  );

  // Filtered Rekap List
  const filteredRekap = computerAttendances.filter((att) => {
    const matchSession = filterSessionRekap === 'ALL' || att.sessionId === filterSessionRekap;
    const matchClass = filterClassRekap === 'ALL' || att.class === filterClassRekap;
    const matchSearch =
      !filterSearchRekap.trim() ||
      att.studentName.toLowerCase().includes(filterSearchRekap.toLowerCase()) ||
      att.sessionTopic.toLowerCase().includes(filterSearchRekap.toLowerCase()) ||
      att.pcNumber.toLowerCase().includes(filterSearchRekap.toLowerCase());
    return matchSession && matchClass && matchSearch;
  });

  // Unique classes for rekap filter
  const uniqueClasses = Array.from(new Set(students.map((s) => s.currentClass))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <Laptop className="w-7 h-7 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-300/30 text-cyan-200 text-[11px] font-bold tracking-wider uppercase">
                Laboratorium TIK & Komputer
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mt-1">
              Menu Khusus Presensi Les & Praktikum Komputer
            </h1>
            <p className="text-xs md:text-sm text-indigo-100 font-medium">
              Sistem Check-in RFID/FaceID, Denah 32 Terminal PC Lab Komputer, Penilaian Tugas & Rekap Kehadiran
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 relative z-10">
          <button
            onClick={() => setActiveSubTab('presensi')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'presensi'
                ? 'bg-white text-indigo-900 shadow-md font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Presensi Live & Denah PC</span>
          </button>
          <button
            onClick={() => setActiveSubTab('faceid')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeSubTab === 'faceid'
                ? 'bg-white text-pink-700 shadow-md font-extrabold'
                : 'text-white/90 hover:text-white hover:bg-white/10 bg-pink-500/20 border border-pink-400/30'
            }`}
          >
            <ScanFace className="w-4 h-4 text-pink-300" />
            <span>Face ID Lab Komputer</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveSubTab('sesi')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'sesi'
                ? 'bg-white text-indigo-900 shadow-md font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Jadwal & Modul</span>
          </button>
          <button
            onClick={() => setActiveSubTab('peserta')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'peserta'
                ? 'bg-white text-indigo-900 shadow-md font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Peserta</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rekap')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'rekap'
                ? 'bg-white text-indigo-900 shadow-md font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekap & Laporan</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PRESENSI LIVE & DENAH TERMINAL PC */}
      {activeSubTab === 'presensi' && (
        <div className="space-y-6">
          {/* Top Session Selector & Quick Stats Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Active Session Card */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Sesi Les Aktif Saat Ini
                    </span>
                    <h3 className="text-base font-bold text-slate-800">
                      {currentSession ? currentSession.topic : 'Belum Ada Sesi Dipilih'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {computerSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.sessionCode}] {s.topic} {s.targetClass ? `(Kelas: ${s.targetClass})` : ''} ({s.date})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsAddSessionModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sesi Baru</span>
                  </button>
                </div>
              </div>

              {currentSession && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block">Target Kelas</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">{currentSession.targetClass || 'Semua Kelas'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block">Instruktur / Guru</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">{currentSession.instructor}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block">Ruangan</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">{currentSession.labRoom}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block">Jam Praktikum</span>
                    <span className="text-xs font-bold text-slate-800 block">
                      {currentSession.timeStart} - {currentSession.timeEnd}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block">Status Sesi</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        currentSession.status === 'Sedang Berlangsung'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : currentSession.status === 'Selesai'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {currentSession.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kapasitas Lab</span>
                <span className="text-xs font-black text-indigo-600">
                  {sessionAttendances.length} / 32 PC Terisi
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 text-center">
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-lg font-black text-emerald-700">
                    {sessionAttendances.filter((a) => a.status === 'Hadir').length}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 block">Hadir</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-lg font-black text-amber-700">
                    {sessionAttendances.filter((a) => a.status === 'Izin' || a.status === 'Sakit').length}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 block">Izin/Skt</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-lg font-black text-slate-700">
                    {Math.max(0, 32 - sessionAttendances.filter((a) => a.status === 'Hadir').length)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 block">PC Bebas</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleCheckInAllMembers}
                  className="flex-1 py-1.5 px-3 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition-all border border-violet-200 cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Absen Semua</span>
                </button>
                <button
                  onClick={() => {
                    setIsManualAttendanceModalOpen(true);
                  }}
                  className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all border border-emerald-200 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Absen Manual</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Check-in Station & Lab PC Map */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Check-in Terminal (4 Cols) */}
            <div className="xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Terminal Check-In Peserta</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Pilih siswa & nomor terminal PC praktikum
                  </p>
                </div>
              </div>

              {/* Method Selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Metode Presensi</label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {(['RFID', 'FaceID', 'QR', 'Manual'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTapMethod(m)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        tapMethod === m
                          ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {m === 'RFID' && <CreditCard className="w-3 h-3" />}
                      {m === 'FaceID' && <ScanFace className="w-3 h-3" />}
                      {m === 'QR' && <QrCode className="w-3 h-3" />}
                      {m === 'Manual' && <Edit3 className="w-3 h-3" />}
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Search & Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">Pilih Siswa Peserta</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchStudentTerm}
                    onChange={(e) => setSearchStudentTerm(e.target.value)}
                    placeholder="Cari nama siswa / NISN..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin border border-slate-100 p-1.5 rounded-xl bg-slate-50/50">
                  {filteredStudents.map((std) => {
                    const isAttended = sessionAttendances.some((a) => a.studentId === std.id && a.status === 'Hadir');
                    const isSelected = selectedStudentId === std.id;
                    const memberInfo = computerMembers.find((m) => m.studentId === std.id);

                    return (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(std.id);
                          if (memberInfo?.preferredPc) {
                            setSelectedPcNumber(memberInfo.preferredPc);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs font-bold'
                            : isAttended
                            ? 'bg-emerald-50/80 text-slate-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isSelected ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {std.fullName.charAt(0)}
                          </div>
                          <div className="truncate">
                            <span className="block truncate font-semibold">{std.fullName}</span>
                            <span
                              className={`text-[10px] block ${
                                isSelected ? 'text-indigo-100' : 'text-slate-400'
                              }`}
                            >
                              {std.currentClass} • NISN: {std.nisn}
                            </span>
                          </div>
                        </div>

                        {isAttended && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isSelected ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            Hadir
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PC Number Selection */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Nomor Komputer / Terminal Lab</label>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100 scrollbar-thin">
                  {labPcList.map((pc) => {
                    const occupied = sessionAttendances.find((a) => a.pcNumber === pc && a.status === 'Hadir');
                    const isSelected = selectedPcNumber === pc;

                    return (
                      <button
                        key={pc}
                        type="button"
                        onClick={() => setSelectedPcNumber(pc)}
                        className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer truncate ${
                          isSelected
                            ? 'bg-violet-600 text-white shadow-xs ring-2 ring-violet-300'
                            : occupied
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method is FaceID Banner / Shortcut */}
              {tapMethod === 'FaceID' && (
                <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-pink-800 text-xs font-bold">
                    <ScanFace className="w-4 h-4 text-pink-600 shrink-0" />
                    <span>Mode Presensi Face ID Aktif</span>
                  </div>
                  <p className="text-[11px] text-pink-700 font-medium">
                    Gunakan kamera langsung untuk pemindaian otomatis wajah siswa di laboratorium komputer.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('faceid')}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-black shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Buka Kamera Face ID Lab Live</span>
                  </button>
                </div>
              )}

              {/* Submit Check-In Button */}
              <button
                type="button"
                onClick={() => handleCheckInSubmit()}
                className={`w-full py-3 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  tapMethod === 'FaceID'
                    ? 'bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 shadow-pink-300/30'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-indigo-300/30'
                }`}
              >
                {tapMethod === 'FaceID' ? <ScanFace className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>
                  {tapMethod === 'FaceID'
                    ? `ABSENKAN FACE ID (${selectedPcNumber})`
                    : `ABSENKAN MASUK (${selectedPcNumber})`}
                </span>
              </button>

              {lastCheckInNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{lastCheckInNotice}</span>
                </div>
              )}
            </div>

            {/* Right Lab Interactive Visual PC Layout (8 Cols) */}
            <div className="xl:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Peta Denah Terminal Lab Komputer (32 PC)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Status interaktif real-time posisi duduk dan kehadiran praktikan
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-500" />
                    <span>Terisi (Hadir)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300" />
                    <span>Kosong</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-400" />
                    <span>Izin / Sakit</span>
                  </div>
                </div>
              </div>

              {/* Lab Front / Projector Screen Marker */}
              <div className="w-full bg-slate-100 py-2 rounded-xl text-center border border-slate-200/80">
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
                  🖥️ LAYAR PROYEKTOR / MEJA INSTRUKTUR DEPAN
                </span>
              </div>

              {/* 32 PC Grid Layout */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 py-2">
                {labPcList.map((pc) => {
                  const attendance = sessionAttendances.find((a) => a.pcNumber === pc && a.status === 'Hadir');
                  const isIzinSakit = sessionAttendances.find(
                    (a) => a.pcNumber === pc && (a.status === 'Izin' || a.status === 'Sakit')
                  );
                  const isSelected = selectedPcNumber === pc;

                  return (
                    <div
                      key={pc}
                      onClick={() => {
                        setSelectedPcNumber(pc);
                        if (attendance) {
                          setSelectedStudentId(attendance.studentId);
                        }
                      }}
                      className={`relative p-2.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all cursor-pointer select-none min-h-[92px] ${
                        isSelected
                          ? 'ring-2 ring-violet-500 scale-[1.03] shadow-md z-10'
                          : ''
                      } ${
                        attendance
                          ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                          : isIzinSakit
                          ? 'bg-amber-50 border-amber-300 hover:bg-amber-100'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black px-1 rounded ${
                            attendance
                              ? 'bg-emerald-200/80 text-emerald-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {pc}
                        </span>
                        <Monitor
                          className={`w-3.5 h-3.5 ${
                            attendance
                              ? 'text-emerald-600'
                              : isIzinSakit
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        />
                      </div>

                      {attendance ? (
                        <div className="w-full my-1">
                          <span className="text-[11px] font-bold text-slate-800 block truncate leading-tight">
                            {attendance.studentName.split(' ')[0]}
                          </span>
                          <span className="text-[9px] text-emerald-700 font-semibold block truncate">
                            {attendance.timeIn}
                          </span>
                        </div>
                      ) : isIzinSakit ? (
                        <div className="w-full my-1">
                          <span className="text-[10px] font-bold text-amber-800 block truncate">
                            {isIzinSakit.studentName.split(' ')[0]}
                          </span>
                          <span className="text-[9px] text-amber-600 font-bold block">
                            {isIzinSakit.status}
                          </span>
                        </div>
                      ) : (
                        <div className="my-1">
                          <span className="text-[10px] font-semibold text-slate-400 block">Siap</span>
                        </div>
                      )}

                      <div className="w-full pt-1 border-t border-slate-200/50 flex justify-center">
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider ${
                            attendance ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {attendance ? 'TERISI' : 'KOSONG'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table of Present Students in This Session */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Kehadiran Sesi Berjalan ({sessionAttendances.length} Siswa)
                  </h4>
                  {sessionAttendances.length > 0 && currentUser?.role !== 'siswa' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Hapus seluruh presensi untuk sesi ini?')) {
                          sessionAttendances.forEach((a) => deleteComputerAttendance(a.id));
                          showNotice('Presensi sesi berhasil dibersihkan.');
                        }
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Bersihkan Presensi Sesi</span>
                    </button>
                  )}
                </div>

                {sessionAttendances.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                    Belum ada siswa yang melakukan check-in pada sesi ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Terminal</th>
                          <th className="px-3 py-2.5">Nama Siswa</th>
                          <th className="px-3 py-2.5">Kelas / NISN</th>
                          <th className="px-3 py-2.5">Jam Masuk</th>
                          <th className="px-3 py-2.5">Metode</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5">Nilai Tugas</th>
                          <th className="px-3 py-2.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sessionAttendances.map((att) => (
                          <tr key={att.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="px-3 py-2 font-black text-indigo-700">{att.pcNumber}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">{att.studentName}</td>
                            <td className="px-3 py-2 text-slate-500">
                              {att.class} • {att.nisn}
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-600">{att.timeIn}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {att.tapMethod}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={att.status}
                                onChange={(e) =>
                                  updateComputerAttendance(att.id, {
                                    status: e.target.value as any,
                                  })
                                }
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                  att.status === 'Hadir'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : att.status === 'Izin'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                <option value="Hadir">Hadir</option>
                                <option value="Izin">Izin</option>
                                <option value="Sakit">Sakit</option>
                                <option value="Alpa">Alpa</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={att.taskScore ?? ''}
                                onChange={(e) =>
                                  updateComputerAttendance(att.id, {
                                    taskScore: e.target.value === '' ? undefined : Number(e.target.value),
                                  })
                                }
                                placeholder="0-100"
                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              {currentUser?.role !== 'siswa' && (
                                <button
                                  onClick={() => deleteComputerAttendance(att.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                                  title="Hapus Presensi"
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB KHUSUS: KAMERA FACE ID LAB KOMPUTER */}
      {activeSubTab === 'faceid' && (
        <div className="space-y-6">
          {/* Top Session Selector & Live Scanner Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Session Selector */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Terminal Face ID Lab Komputer</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pindai wajah otomatis untuk check-in dan penempatan kursi PC
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  Live AI Gate
                </span>
              </div>

              <div className="pt-3">
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Pilih Sesi Materi Aktif:
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {computerSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.sessionCode}] {s.topic} {s.targetClass ? `(Kelas: ${s.targetClass})` : ''} ({s.date} • {s.timeStart}-{s.timeEnd})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Presensi Face ID</span>
                <ScanFace className="w-4 h-4 text-pink-600" />
              </div>
              <div className="py-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-pink-600">
                    {sessionAttendances.filter((a) => a.tapMethod === 'FaceID').length}
                  </span>
                  <span className="text-xs font-bold text-slate-500">Siswa Hadir Face ID</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-pink-500 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (sessionAttendances.filter((a) => a.tapMethod === 'FaceID').length / 32) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Total Hadir Sesi Ini: {sessionAttendances.filter((a) => a.status === 'Hadir').length} Siswa
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kapasitas PC Lab</span>
                <Monitor className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="py-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-indigo-600">
                    {Math.max(0, 32 - sessionAttendances.filter((a) => a.status === 'Hadir').length)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">PC Tersedia / 32</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                  ✓ {sessionAttendances.filter((a) => a.status === 'Hadir').length} PC Sedang Digunakan
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500 font-medium">
                <Sparkles className="w-3 h-3 text-pink-500 shrink-0" />
                <span>Auto-Assign PC terminal aktif</span>
              </div>
            </div>
          </div>

          {/* Main Face ID Section: Camera Viewport (Left) + Biometric Feedback & Lab Seat (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left 7 Cols: Camera Stream & HUD */}
            <div className="xl:col-span-7 space-y-4">
              {/* WebCam Terminal Frame */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
                {/* Hidden canvas for snapshot capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Top Video Header HUD */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
                    </span>
                    <span className="text-xs font-mono font-bold text-pink-300 tracking-wider">
                      LAB-FACE-GATE-01 // AI SCANNER
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        soundEnabled ? 'text-pink-300 bg-pink-500/20' : 'text-slate-500 hover:text-white'
                      }`}
                      title={soundEnabled ? 'Suara Chime Aktif' : 'Suara Chime Senyap'}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                      className="p-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                      title="Ganti Kamera (Depan / Belakang)"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Video Area */}
                <div className="relative aspect-4/3 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  {cameraError ? (
                    <div className="p-6 text-center max-w-md space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Kamera Belum Terhubung</h4>
                      <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line text-left max-w-sm">{cameraError}</p>
                      <button
                        onClick={() => {
                          setCameraError(null);
                          setIsCameraActive(false);
                          setTimeout(() => setIsCameraActive(true), 150);
                        }}
                        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Coba Muat Ulang Kamera</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${
                          facingMode === 'user' ? 'scale-x-[-1]' : ''
                        }`}
                      />

                      {/* Biometric HUD Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* Target Frame Oval */}
                        <div
                          className={`w-64 h-80 rounded-[48%] border-2 transition-all duration-300 relative flex items-center justify-center ${
                            isScanning
                              ? 'border-pink-400 ring-4 ring-pink-500/40 shadow-[0_0_50px_rgba(244,63,94,0.5)]'
                              : cooldown
                              ? 'border-emerald-400 ring-4 ring-emerald-500/30'
                              : 'border-pink-500/60 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
                          }`}
                        >
                          {/* Corner Brackets */}
                          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-pink-400" />
                          <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-pink-400" />
                          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-pink-400" />
                          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-pink-400" />

                          {/* Sweeping Laser Scan Line */}
                          <div
                            className={`absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_15px_#f43f5e] ${
                              isScanning ? 'animate-bounce' : 'animate-pulse'
                            }`}
                          />

                          {/* Center Reticle */}
                          <div className="w-10 h-10 border border-dashed border-pink-300/40 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                          </div>
                        </div>

                        {/* Top Alignment Prompt */}
                        <div className="absolute top-16 px-4 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-pink-200">
                          {isScanning
                            ? '⚡ MEMVERIFIKASI BIOMETRIK WAJAH...'
                            : cooldown
                            ? '✓ PRESENSI TERCATAT - SILAKAN DUDUK'
                            : 'ARAHKAN WAJAH KE DALAM BINGKAI'}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom HUD Bar on Video */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Ambang Batas: <strong className="text-white">{threshold}%</strong></span>
                    <span className="text-slate-600">•</span>
                    <span>Suara Pengumuman: <strong className="text-white">{speechEnabled ? 'Aktif' : 'Mati'}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    {devices.length > 1 && (
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                      >
                        {devices.map((d, i) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Kamera ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      disabled={cooldown || isScanning}
                      onClick={() => {
                        const targetStd =
                          students.find((s) => s.id === faceIdTargetStudentId) || students[0];
                        if (targetStd) {
                          processFaceIdCheckIn(targetStd, faceIdPreferredPc || undefined);
                        }
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-pink-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ScanFace className="w-4 h-4" />
                      <span>{isScanning ? 'Memproses...' : 'PINDAI WAJAH SEKARANG'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Face ID Simulation & Student Tester */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    <h4 className="text-xs font-bold text-slate-800">
                      Simulasi Cepat & Pengujian Wajah Siswa
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Uji coba instan Face ID & auto-assign kursi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Pilih Siswa yang Menghadap Kamera:
                    </label>
                    <select
                      value={faceIdTargetStudentId}
                      onChange={(e) => setFaceIdTargetStudentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      {students.map((std) => {
                        const isMember = computerMembers.some((m) => m.studentId === std.id);
                        const isAttended = sessionAttendances.some((a) => a.studentId === std.id && a.status === 'Hadir');
                        return (
                          <option key={std.id} value={std.id}>
                            {std.fullName} ({std.currentClass} - NISN: {std.nisn}) {isMember ? '★ Peserta Les' : ''} {isAttended ? '✓ Sudah Hadir' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Pilihan Kursi PC (Opsional):
                    </label>
                    <select
                      value={faceIdPreferredPc}
                      onChange={(e) => setFaceIdPreferredPc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Otomatis (Next PC)</option>
                      {labPcList.map((pc) => (
                        <option key={pc} value={pc}>
                          {pc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    disabled={cooldown || isScanning}
                    onClick={() => {
                      const targetStd = students.find((s) => s.id === faceIdTargetStudentId);
                      if (targetStd) {
                        processFaceIdCheckIn(targetStd, faceIdPreferredPc || undefined);
                      }
                    }}
                    className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-pink-600" />
                    <span>Simulasi Scan Wajah Siswa Terpilih</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Live Recognition Result & PC Seat Occupancy */}
            <div className="xl:col-span-5 space-y-4">
              {/* Latest Biometric Scan Result Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Hasil Pemindaian Terkini</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Verifikasi biometrik & alokasi kursi lab
                      </p>
                    </div>
                  </div>
                  {lastFaceIdResult && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        lastFaceIdResult.success
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {lastFaceIdResult.success ? '✓ Terverifikasi' : 'Gagal'}
                    </span>
                  )}
                </div>

                {lastFaceIdResult && lastFaceIdResult.student ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 bg-gradient-to-br from-slate-50 to-pink-50/40 rounded-2xl border border-pink-100">
                      {/* Side-by-side face comparison to prevent mismatch */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {/* 1. Database Photo */}
                        <div className="text-center">
                          <div className="w-14 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative">
                            {lastFaceIdResult.student.photo ? (
                              <img
                                src={lastFaceIdResult.student.photo}
                                alt="Foto Database"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold">N/A</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[8px] font-bold text-slate-500 block mt-1 uppercase tracking-wider">Database</span>
                        </div>

                        <div className="text-pink-400 text-[9px] font-black shrink-0 px-0.5">VS</div>

                        {/* 2. Captured Live Snapshot */}
                        <div className="text-center">
                          <div className="w-14 h-16 rounded-xl overflow-hidden bg-slate-100 border-2 border-pink-400 shadow-xs relative">
                            {lastFaceIdResult.capturedSnapshot ? (
                              <img
                                src={lastFaceIdResult.capturedSnapshot}
                                alt="Hasil Pindai"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold">N/A</span>
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 rounded-tl-md text-white">
                              <Check className="w-2 h-2" />
                            </span>
                          </div>
                          <span className="text-[8px] font-bold text-slate-500 block mt-1 uppercase tracking-wider">Live Scan</span>
                        </div>
                      </div>

                      <div className="truncate flex-1">
                        <span className="text-[10px] font-bold text-pink-600 block uppercase tracking-wider">
                          Siswa Terdeteksi
                        </span>
                        <h4 className="text-sm font-black text-slate-800 truncate">
                          {lastFaceIdResult.student.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {lastFaceIdResult.student.currentClass} • NISN: {lastFaceIdResult.student.nisn}
                        </p>
                      </div>
                    </div>

                    {/* Assigned PC Terminal Badge */}
                    <div className="p-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 rounded-2xl text-white shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-200 block">
                          Terminal PC Ditugaskan:
                        </span>
                        <span className="text-2xl font-black tracking-tight text-white">
                          {lastFaceIdResult.pcNumber}
                        </span>
                        <span className="text-[11px] text-indigo-100 font-medium block">
                          Laboratorium TIK & Komputer
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                        <Laptop className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Meta Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Akurasi Kemiripan:</span>
                        <span className="font-black text-emerald-600 text-sm">
                          {lastFaceIdResult.confidence}% Cocok
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Waktu Masuk:</span>
                        <span className="font-bold text-slate-700 text-sm">
                          {lastFaceIdResult.time} WIB
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Eye className="w-6 h-6" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-700">Belum Ada Pemindaian</h5>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Arahkan wajah siswa ke kamera atau klik tombol simulasi di samping untuk memproses presensi Face ID.
                    </p>
                  </div>
                )}
              </div>

              {/* Real-Time Mini PC Grid Preview */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800">
                      Peta 32 PC Lab Komputer (Live Status)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {sessionAttendances.filter((a) => a.status === 'Hadir').length} / 32 Terisi
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto">
                  {labPcList.map((pc) => {
                    const occupied = sessionAttendances.find((a) => a.pcNumber === pc && a.status === 'Hadir');
                    const isJustAssigned = lastFaceIdResult?.pcNumber === pc;

                    return (
                      <div
                        key={pc}
                        title={occupied ? `${pc}: ${occupied.studentName}` : `${pc}: Kosong`}
                        className={`py-2 rounded-lg text-center text-[10px] font-bold transition-all relative ${
                          isJustAssigned
                            ? 'bg-pink-600 text-white shadow-md ring-2 ring-pink-300 animate-pulse font-black'
                            : occupied
                            ? 'bg-emerald-500 text-white font-black'
                            : 'bg-white text-slate-400 border border-slate-200'
                        }`}
                      >
                        {pc.replace('PC-', '')}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-pink-500" />
                    <span>Terbaru (Face ID)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span>Terisi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-200" />
                    <span>Kosong</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Face ID Scans in This Session */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-800">
                  Daftar Kehadiran Siswa via Face ID Sesi Ini
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {sessionAttendances.filter((a) => a.tapMethod === 'FaceID').length} Rekaman
              </span>
            </div>

            {sessionAttendances.filter((a) => a.tapMethod === 'FaceID').length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Belum ada siswa yang melakukan presensi Face ID pada sesi ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Siswa</th>
                      <th className="px-3 py-2">Kelas / NISN</th>
                      <th className="px-3 py-2 text-center">Nomor PC</th>
                      <th className="px-3 py-2 text-center">Waktu Scan</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessionAttendances
                      .filter((a) => a.tapMethod === 'FaceID')
                      .map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="px-3 py-2.5 font-bold text-slate-800">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-[10px]">
                                <ScanFace className="w-3.5 h-3.5" />
                              </div>
                              <span>{att.studentName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 font-medium">
                            {att.class} • {att.nisn}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="px-2 py-0.5 bg-violet-100 text-violet-800 rounded-md font-black text-[11px]">
                              {att.pcNumber}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center font-semibold text-slate-600">
                            {att.timeIn}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Hadir Face ID
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {currentUser?.role !== 'siswa' && (
                              <button
                                onClick={() => deleteComputerAttendance(att.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                                title="Hapus Presensi"
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
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: JADWAL & MATERI PRAKTIKUM */}
      {activeSubTab === 'sesi' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Kelola Jadwal & Modul Praktikum Les Komputer
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Atur topik materi kurikulum, instruktur pengampu, jam praktikum, dan kapasitas laboratorium
              </p>
            </div>

            <button
              onClick={() => setIsAddSessionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-300/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sesi Praktikum</span>
            </button>
          </div>

          {/* List of Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {computerSessions.map((s) => {
              const attendancesCount = computerAttendances.filter((a) => a.sessionId === s.id && a.status === 'Hadir').length;

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-black">
                        {s.sessionCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Sedang Berlangsung'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : s.status === 'Selesai'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-800 leading-snug">{s.topic}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{s.description || 'Tidak ada catatan modul.'}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Kelas:</span>
                      <span className="font-bold text-slate-800">{s.targetClass || 'Semua Kelas'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Instruktur:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[160px]">{s.instructor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Ruangan:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[160px]">{s.labRoom}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Waktu:</span>
                      <span className="font-semibold text-slate-700">
                        {s.date} ({s.timeStart} - {s.timeEnd})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Kehadiran:</span>
                      <span className="font-bold text-indigo-600">
                        {attendancesCount} / {s.maxCapacity} Peserta
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSessionId(s.id);
                        setActiveSubTab('presensi');
                        showNotice(`Sesi "${s.topic}" dipilih sebagai sesi aktif!`);
                      }}
                      className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Buka Presensi</span>
                    </button>

                    <button
                      onClick={() => {
                        const newStatus =
                          s.status === 'Sedang Berlangsung'
                            ? 'Selesai'
                            : s.status === 'Terjadwal'
                            ? 'Sedang Berlangsung'
                            : 'Terjadwal';
                        updateComputerSession(s.id, { status: newStatus });
                        showNotice(`Status sesi diubah menjadi ${newStatus}`);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="Ubah Status Sesi"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {currentUser?.role !== 'siswa' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus sesi praktikum "${s.topic}"?`)) {
                            deleteComputerSession(s.id);
                            showNotice('Sesi praktikum berhasil dihapus.');
                          }
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Hapus Sesi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DAFTAR PESERTA & KELOMPOK */}
      {activeSubTab === 'peserta' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Daftar Peserta & Kelompok Les Komputer ({computerMembers.length} Siswa Terdaftar)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Kelola pembagian kelompok belajar, preferensi nomor terminal PC, dan status keaktifan peserta
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-300/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Siswa</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">NISN</th>
                    <th className="px-4 py-3">Kelompok / Gelombang</th>
                    <th className="px-4 py-3">Terminal PC Favorit</th>
                    <th className="px-4 py-3">Tgl Daftar</th>
                    <th className="px-4 py-3">Total Kehadiran</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {computerMembers.map((m) => {
                    const totalHadir = computerAttendances.filter(
                      (a) => a.studentId === m.studentId && a.status === 'Hadir'
                    ).length;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-4 py-3 font-bold text-slate-800 flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                            {m.studentName.charAt(0)}
                          </div>
                          <span>{m.studentName}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">{m.class}</td>
                        <td className="px-4 py-3 text-slate-500">{m.nisn}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 font-bold text-[11px]">
                            {m.batch}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-black text-indigo-700">{m.preferredPc}</td>
                        <td className="px-4 py-3 text-slate-500">{m.registeredDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs">
                            {totalHadir} Sesi Hadir
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {currentUser?.role !== 'siswa' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus ${m.studentName} dari daftar les komputer?`)) {
                                  deleteComputerMember(m.id);
                                  showNotice('Peserta berhasil dihapus.');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                              title="Hapus Peserta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: REKAPITULASI & EKSPOR LAPORAN */}
      {activeSubTab === 'rekap' && (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Riwayat Presensi
              </span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">
                {computerAttendances.length} Catatan
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Di seluruh sesi praktikum</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                Tingkat Hadir (%)
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {computerAttendances.length > 0
                  ? Math.round(
                      (computerAttendances.filter((a) => a.status === 'Hadir').length / computerAttendances.length) * 100
                    )
                  : 100}
                %
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Persentase kehadiran praktikan</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Rata-rata Nilai Tugas
              </span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">
                {(() => {
                  const withScore = computerAttendances.filter((a) => typeof a.taskScore === 'number');
                  if (withScore.length === 0) return '-';
                  const avg = withScore.reduce((acc, curr) => acc + (curr.taskScore || 0), 0) / withScore.length;
                  return avg.toFixed(1);
                })()}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Skala penilaian tugas 0 - 100</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-wider block">
                Total Sesi Praktikum
              </span>
              <span className="text-2xl font-black text-violet-700 mt-1 block">
                {computerSessions.length} Modul
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Tersedia di kurikulum TIK</span>
            </div>
          </div>

          {/* Filter Bar & Export */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={filterSearchRekap}
                    onChange={(e) => setFilterSearchRekap(e.target.value)}
                    placeholder="Cari siswa, sesi, PC..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Session Filter */}
                <select
                  value={filterSessionRekap}
                  onChange={(e) => setFilterSessionRekap(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Sesi Modul</option>
                  {computerSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.topic}
                    </option>
                  ))}
                </select>

                {/* Class Filter */}
                <select
                  value={filterClassRekap}
                  onChange={(e) => setFilterClassRekap(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Kelas</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Sesi / Topik</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Terminal PC</th>
                    <th className="px-4 py-3">Jam Masuk</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Nilai Praktik</th>
                    <th className="px-4 py-3">Catatan</th>
                    <th className="px-4 py-3 text-center">Cetak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRekap.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-slate-400 font-medium">
                        Tidak ada data rekap presensi yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRekap.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-4 py-3 text-slate-500 font-medium">{att.date}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 max-w-[200px] truncate">
                          {att.sessionTopic}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">{att.studentName}</td>
                        <td className="px-4 py-3 text-slate-600">{att.class}</td>
                        <td className="px-4 py-3 font-black text-indigo-700">{att.pcNumber}</td>
                        <td className="px-4 py-3 font-semibold text-slate-600">{att.timeIn}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {att.tapMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.status === 'Hadir'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'Izin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-indigo-700">
                          {att.taskScore !== undefined ? `${att.taskScore} / 100` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{att.taskNotes || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setPrintStudentData(att)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all cursor-pointer"
                            title="Cetak Bukti Presensi & Sertifikat"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH SESI PRAKTIKUM BARU */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Tambah Sesi Praktikum Komputer</h3>
              </div>
              <button
                onClick={() => setIsAddSessionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Topik / Modul Praktikum <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Contoh: Pemrograman Web & Desain Grafis Canva"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Target Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTargetClass}
                  onChange={(e) => setNewTargetClass(e.target.value)}
                  placeholder="Contoh: Semua Kelas, IX-A, atau X IPA 1 & 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Instruktur / Guru</label>
                  <input
                    type="text"
                    required
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Ruangan Lab</label>
                  <select
                    value={newLabRoom}
                    onChange={(e) => setNewLabRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                  >
                    <option value="Lab Komputer 1 (Multimedia & Software)">Lab Komputer 1 (Multimedia)</option>
                    <option value="Lab Komputer 2 (Desain & Grafika)">Lab Komputer 2 (Desain & Grafika)</option>
                    <option value="Lab Komputer 3 (Jaringan & Hardware)">Lab Komputer 3 (Jaringan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={newTimeStart}
                    onChange={(e) => setNewTimeStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={newTimeEnd}
                    onChange={(e) => setNewTimeEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Catatan / Deskripsi Modul</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Instruksi praktikum, link materi, atau tugas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-300/30 transition-all cursor-pointer"
                >
                  Simpan & Aktifkan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR PESERTA LES */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Daftarkan Siswa ke Les Komputer</h3>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Siswa</label>
                <select
                  value={memberStudentId}
                  onChange={(e) => setMemberStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.currentClass} - NISN: {s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Kelompok / Gelombang</label>
                <select
                  value={memberBatch}
                  onChange={(e) => setMemberBatch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                >
                  <option value="Kelompok A - Web & Coding">Kelompok A - Web & Coding</option>
                  <option value="Kelompok B - Office & Desain">Kelompok B - Office & Desain</option>
                  <option value="Kelompok C - TKJ & Jaringan">Kelompok C - TKJ & Jaringan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Terminal PC Favorit</label>
                <select
                  value={memberPreferredPc}
                  onChange={(e) => setMemberPreferredPc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                >
                  {labPcList.map((pc) => (
                    <option key={pc} value={pc}>
                      {pc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-300/30 transition-all cursor-pointer"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CETAK BUKTI PRESENSI / KARTU PRAKTIKUM */}
      {printStudentData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Kartu Bukti Kehadiran Praktikum</h3>
              </div>
              <button
                onClick={() => setPrintStudentData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Preview Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      {settings.schoolName || 'SMA NEGERI 1 NUSA BANGSA'}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">Laboratorium Komputer & TIK</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-black text-[11px]">
                  {printStudentData.pcNumber}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nama Siswa:</span>
                  <span className="font-bold text-slate-800">{printStudentData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Kelas / NISN:</span>
                  <span className="font-bold text-slate-700">
                    {printStudentData.class} • {printStudentData.nisn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Materi Praktikum:</span>
                  <span className="font-bold text-indigo-700 text-right max-w-[220px]">
                    {printStudentData.sessionTopic}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Waktu Check-In:</span>
                  <span className="font-semibold text-slate-700">
                    {printStudentData.date} - Pukul {printStudentData.timeIn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Status Kehadiran:</span>
                  <span className="font-black text-emerald-600">{printStudentData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nilai Tugas:</span>
                  <span className="font-black text-indigo-700">
                    {printStudentData.taskScore !== undefined ? `${printStudentData.taskScore} / 100` : 'Belum Dinilai'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPrintStudentData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-300/30 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT PRESENSI MANUAL LES KOMPUTER */}
      {isManualAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Input Presensi Manual Les Komputer</h3>
              </div>
              <button
                onClick={() => setIsManualAttendanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualAttendance} className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Sesi Aktif:
                </span>
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-950">
                  [{currentSession?.sessionCode}] {currentSession?.topic} ({currentSession?.date})
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Siswa</label>
                <select
                  value={manualStudentId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setManualStudentId(id);
                    const m = computerMembers.find((member) => member.studentId === id);
                    if (m?.preferredPc) {
                      setManualPcNumber(m.preferredPc);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => {
                    const isMember = computerMembers.some((m) => m.studentId === s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.currentClass}) {isMember ? '★ Peserta Les' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Status Kehadiran</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpa">Alpa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Terminal PC {manualStatus !== 'Hadir' && <span className="text-slate-400 font-medium">(Opsional)</span>}
                  </label>
                  <select
                    disabled={manualStatus !== 'Hadir'}
                    value={manualStatus === 'Hadir' ? manualPcNumber : '-'}
                    onChange={(e) => setManualPcNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {manualStatus !== 'Hadir' ? (
                      <option value="-">Tanpa PC (Tidak Hadir)</option>
                    ) : (
                      labPcList.map((pc) => (
                        <option key={pc} value={pc}>
                          {pc}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {manualStatus === 'Hadir' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Penilaian Tugas Praktikum (Opsional)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Nilai Tugas</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={manualTaskScore}
                        onChange={(e) => setManualTaskScore(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Catatan Tugas</label>
                      <input
                        type="text"
                        value={manualTaskNotes}
                        onChange={(e) => setManualTaskNotes(e.target.value)}
                        placeholder="Catatan aktivitas atau tugas..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200/50 transition-all cursor-pointer"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
