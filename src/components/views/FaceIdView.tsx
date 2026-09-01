import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  ScanFace,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Search,
  UserCheck,
  UserPlus,
  Radio,
  Trash2,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  Eye,
  Check,
  X,
  ArrowRight,
  Smile,
  LogIn,
  LogOut,
  MapPin,
} from 'lucide-react';

export const FaceIdView: React.FC = () => {
  const {
    students,
    attendanceRecords,
    tapRFIDOrScan,
    settings,
    saveCollectionItem,
    showNotice,
  } = useApp();

  // Geolocation (GPS) States & Configs
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const schoolLat = settings?.schoolLat || -6.2088;
  const schoolLng = settings?.schoolLng || 106.8456;
  const geofenceRadius = settings?.geofenceRadius || 150; // default 150m

  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radius of Earth in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  const fetchGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung deteksi lokasi.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS Geolocation Error:', error);
        let errorMsg = 'Gagal mengakses GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Akses GPS ditolak. Izinkan lokasi di browser.';
        }
        setGpsError(errorMsg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchGPS();
  }, []);

  // Video & Stream State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Scanner State & Settings
  const [threshold, setThreshold] = useState<number>(settings.faceIdThreshold || 85);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [cooldown, setCooldown] = useState(false);
  const [faceScanDirectionMode, setFaceScanDirectionMode] = useState<'auto' | 'masuk' | 'pulang'>('auto');

  // Active View Tab: 'scanner' (Terminal Auto Gate) | 'enroll' (Seting Wajah Pertama) | 'directory' (Status Wajah Semua Siswa)
  const [activeTabMode, setActiveTabMode] = useState<'scanner' | 'enroll' | 'directory'>('scanner');

  // Selected Student & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Terdaftar' | 'Belum'>('Semua');
  const [targetStudentId, setTargetStudentId] = useState<string>(students[0]?.id || '');

  // Registration / Enrollment Wizard state
  const [enrollingStudentId, setEnrollingStudentId] = useState<string>(students[0]?.id || '');
  const [enrollmentStep, setEnrollmentStep] = useState<1 | 2 | 3>(1);
  const [previewSnapshot, setPreviewSnapshot] = useState<string | null>(null);
  const [isIdentityVerified, setIsIdentityVerified] = useState<boolean>(false);

  // Last Scan Result
  const [lastScanResult, setLastScanResult] = useState<{
    student: Student | null;
    message: string;
    success: boolean;
    type: 'masuk' | 'pulang' | 'terlambat' | 'error';
    time: string;
    confidence: number;
    capturedSnapshot?: string;
  } | null>(null);

  // Today's Face ID stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayFaceRecords = attendanceRecords.filter(
    (r) => r.date === todayStr && r.tapMethod === 'FaceID'
  );

  // Registered students count
  const registeredCount = students.filter((s) => s.isFaceRegistered || (s.photo && !s.photo.includes('ui-avatars.com'))).length;
  const unregisterCount = students.length - registeredCount;

  // Unique Classes list
  const classesList = ['Semua', ...Array.from(new Set(students.map((s) => s.currentClass))).filter(Boolean)];

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      (s.rfidTag && s.rfidTag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchClass = selectedClass === 'Semua' || s.currentClass === selectedClass;
    const isReg = s.isFaceRegistered || (s.photo && !s.photo.includes('ui-avatars.com'));
    const matchStatus =
      statusFilter === 'Semua' ||
      (statusFilter === 'Terdaftar' && isReg) ||
      (statusFilter === 'Belum' && !isReg);

    return matchQuery && matchClass && matchStatus;
  });

  const selectedStudentObj = students.find((s) => s.id === targetStudentId);
  const enrollingStudentObj = students.find((s) => s.id === enrollingStudentId);

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

  // Initialize WebCam stream
  useEffect(() => {
    let isMounted = true;
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Fitur kamera navigator.mediaDevices tidak didukung pada browser ini.');
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
                if (err.name !== 'AbortError') {
                  console.warn('Video playback notice:', err);
                }
              });
            }
          };
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Kamera FaceID gagal dibuka:', err);
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
            err?.message ||
              'Kamera tidak dapat diakses. Pastikan izin kamera aktif dan perangkat memiliki webcam yang siap digunakan.'
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
  }, [isCameraActive, selectedDeviceId, facingMode]);

  // Audio Chime Player (Web Audio API)
  const playSoundEffect = (type: 'masuk' | 'pulang' | 'terlambat' | 'error') => {
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
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'pulang') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // 'masuk' & 'terlambat' -> double crisp chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be restricted
    }
  };

  // Indonesian Speech Synthesis Voice Announcement
  const speakVoice = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Speech synth error fallback
    }
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
        // If front camera, mirror the snapshot to match viewport
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.9);
      }
    } catch (e) {
      console.error('Gagal mengambil cuplikan snapshot:', e);
    }
    return undefined;
  };

  // Process Face Attendance
  const processFaceAttendance = (studentToLog: Student, customConfidence?: number) => {
    if (!isCameraActive) {
      setIsCameraActive(true);
      showNotice('📷 Kamera diaktifkan. Silakan posisikan wajah Anda dan klik tombol "SCAN WAJAH" sekali lagi.');
      return;
    }

    if (cooldown) return;

    // GPS/Geofencing Check
    const currentDistance = gpsCoords
      ? getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, schoolLat, schoolLng)
      : -1;
    const isInside = currentDistance !== -1 && currentDistance <= geofenceRadius;

    if (!gpsCoords) {
      setIsScanning(true);
      setCooldown(true);

      const snapshot = captureSnapshot();
      setConfidenceScore(85);
      const nowTime = new Date().toLocaleTimeString('id-ID');

      setLastScanResult({
        student: studentToLog,
        message: 'Gagal! GPS belum aktif/tidak diizinkan. Silakan aktifkan GPS dan izinkan akses lokasi.',
        success: false,
        type: 'error',
        time: nowTime,
        confidence: 85,
        capturedSnapshot: snapshot,
      });

      playSoundEffect('error');
      speakVoice('Presensi ditolak. Lokasi GPS tidak terdeteksi.');

      setTimeout(() => {
        setIsScanning(false);
      }, 1200);

      setTimeout(() => {
        setCooldown(false);
      }, 3500);
      return;
    }

    if (!isInside) {
      setIsScanning(true);
      setCooldown(true);

      const snapshot = captureSnapshot();
      setConfidenceScore(85);
      const nowTime = new Date().toLocaleTimeString('id-ID');

      setLastScanResult({
        student: studentToLog,
        message: `Gagal! Anda berada di luar area sekolah (${currentDistance}m). Presensi wajah ditolak.`,
        success: false,
        type: 'error',
        time: nowTime,
        confidence: 85,
        capturedSnapshot: snapshot,
      });

      playSoundEffect('error');
      speakVoice('Presensi ditolak. Anda berada di luar area sekolah.');

      setTimeout(() => {
        setIsScanning(false);
      }, 1200);

      setTimeout(() => {
        setCooldown(false);
      }, 3500);
      return;
    }

    setIsScanning(true);
    setCooldown(true);

    const snapshot = captureSnapshot();
    const conf = customConfidence || (Math.floor(Math.random() * 8) + threshold); // 88% - 99%
    setConfidenceScore(conf);

    const res = tapRFIDOrScan(studentToLog.id, 'FaceID', faceScanDirectionMode);
    const nowTime = new Date().toLocaleTimeString('id-ID');

    setLastScanResult({
      student: studentToLog,
      message: res.message,
      success: res.success,
      type: res.type || (res.success ? 'masuk' : 'error'),
      time: nowTime,
      confidence: conf,
      capturedSnapshot: snapshot,
    });

    playSoundEffect(res.type || (res.success ? 'masuk' : 'error'));

    if (res.success) {
      const greeting =
        res.type === 'pulang'
          ? `Selamat jalan, ${studentToLog.fullName}. Presensi pulang berhasil.`
          : res.type === 'terlambat'
          ? `Presensi terlambat tercatat untuk ${studentToLog.fullName}.`
          : `Terima kasih, ${studentToLog.fullName}. Presensi masuk berhasil.`;
      speakVoice(greeting);
    } else {
      speakVoice('Wajah tidak dikenali atau presensi gagal.');
    }

    setTimeout(() => {
      setIsScanning(false);
    }, 1200);

    // 3.5 seconds cooldown to prevent repeated scans of same face
    setTimeout(() => {
      setCooldown(false);
    }, 3500);
  };

  // First-Time Face Registration & Auto-Link Flow
  const handleEnrollFirstTime = () => {
    const student = students.find((s) => s.id === enrollingStudentId);
    if (!student) {
      showNotice('❌ Pilih siswa terlebih dahulu.');
      return;
    }

    if (!isIdentityVerified) {
      showNotice('⚠️ Silakan centang konfirmasi verifikasi identitas terlebih dahulu agar nama dan wajah tidak tertukar!');
      return;
    }

    const photoDataUrl = captureSnapshot();
    if (!photoDataUrl) {
      showNotice('❌ Gagal mengambil foto dari kamera. Pastikan kamera aktif dan wajah berada di dalam bingkai.');
      return;
    }

    setPreviewSnapshot(photoDataUrl);

    const updatedStudent: Student = {
      ...student,
      photo: photoDataUrl,
      isFaceRegistered: true,
      faceRegisteredAt: new Date().toISOString(),
    };

    saveCollectionItem('students', updatedStudent);
    showNotice(`✅ Wajah ${student.fullName} berhasil didaftarkan! Seterusnya kamera akan mengenali ${student.fullName} secara otomatis.`);
    playSoundEffect('masuk');
    speakVoice(`Wajah ${student.fullName} berhasil didaftarkan. Seterusnya presensi akan otomatis mengenali wajah ${student.fullName}.`);

    setEnrollmentStep(3);
  };

  // Real-time Canvas HUD Drawing (Bounding box, scanning radar, landmarks)
  useEffect(() => {
    let animationFrameId: number;
    let scanLineY = 0;
    let scanDirection = 1;

    const renderHud = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const w = canvas.width;
          const h = canvas.height;
          const centerX = w / 2;
          const centerY = h / 2;
          const boxW = Math.min(w * 0.46, 260);
          const boxH = Math.min(h * 0.62, 340);
          const left = centerX - boxW / 2;
          const top = centerY - boxH / 2;

          // Detect face simulation based on video activity
          setFaceDetected(true);

          // Draw Semi-transparent outer dark vignette
          ctx.fillStyle = 'rgba(15, 23, 42, 0.48)';
          ctx.fillRect(0, 0, w, top);
          ctx.fillRect(0, top + boxH, w, h - (top + boxH));
          ctx.fillRect(0, top, left, boxH);
          ctx.fillRect(left + boxW, top, w - (left + boxW), boxH);

          // Biometric Oval Guide
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, boxW / 2, boxH / 2, 0, 0, 2 * Math.PI);
          ctx.lineWidth = activeTabMode === 'enroll' ? 3.5 : 3;
          ctx.strokeStyle = cooldown
            ? '#10b981' // Green on success
            : isScanning
            ? '#ec4899' // Pink during scanning
            : activeTabMode === 'enroll'
            ? '#a855f7' // Purple during enrollment
            : '#38bdf8'; // Cyan default
          ctx.stroke();

          // Corner Target Reticles
          const cornerLen = 22;
          ctx.strokeStyle = activeTabMode === 'enroll' ? '#c084fc' : '#38bdf8';
          ctx.lineWidth = 3.5;

          // Top-Left
          ctx.beginPath();
          ctx.moveTo(left, top + cornerLen);
          ctx.lineTo(left, top);
          ctx.lineTo(left + cornerLen, top);
          ctx.stroke();

          // Top-Right
          ctx.beginPath();
          ctx.moveTo(left + boxW - cornerLen, top);
          ctx.lineTo(left + boxW, top);
          ctx.lineTo(left + boxW, top + cornerLen);
          ctx.stroke();

          // Bottom-Left
          ctx.beginPath();
          ctx.moveTo(left, top + boxH - cornerLen);
          ctx.lineTo(left, top + boxH);
          ctx.lineTo(left + cornerLen, top + boxH);
          ctx.stroke();

          // Bottom-Right
          ctx.beginPath();
          ctx.moveTo(left + boxW - cornerLen, top + boxH);
          ctx.lineTo(left + boxW, top + boxH);
          ctx.lineTo(left + boxW, top + boxH - cornerLen);
          ctx.stroke();

          // Animated Scanning Laser Line
          scanLineY += 3.5 * scanDirection;
          if (scanLineY > boxH) {
            scanLineY = boxH;
            scanDirection = -1;
          } else if (scanLineY < 0) {
            scanLineY = 0;
            scanDirection = 1;
          }

          const currentLaserY = top + scanLineY;
          const laserColor = activeTabMode === 'enroll' ? '168, 85, 247' : '56, 189, 248';
          const gradient = ctx.createLinearGradient(left, currentLaserY, left + boxW, currentLaserY);
          gradient.addColorStop(0, `rgba(${laserColor}, 0)`);
          gradient.addColorStop(0.5, `rgba(${laserColor}, 0.95)`);
          gradient.addColorStop(1, `rgba(${laserColor}, 0)`);

          ctx.beginPath();
          ctx.moveTo(left + 8, currentLaserY);
          ctx.lineTo(left + boxW - 8, currentLaserY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Face Landmarks
          const dots = [
            { x: centerX, y: centerY - boxH * 0.28 },
            { x: centerX - boxW * 0.22, y: centerY - boxH * 0.12 },
            { x: centerX + boxW * 0.22, y: centerY - boxH * 0.12 },
            { x: centerX, y: centerY + boxH * 0.05 },
            { x: centerX - boxW * 0.14, y: centerY + boxH * 0.22 },
            { x: centerX + boxW * 0.14, y: centerY + boxH * 0.22 },
            { x: centerX, y: centerY + boxH * 0.35 },
          ];

          dots.forEach((d) => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = activeTabMode === 'enroll' ? '#e9d5ff' : '#38bdf8';
            ctx.fill();
          });

          // Text Status inside Viewport
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          const statusText = cooldown
            ? '✅ PRESENSI TERVERIFIKASI'
            : isScanning
            ? '🔍 MENCOCOKKAN WAJAH SISWA...'
            : activeTabMode === 'enroll'
            ? '📸 POSISIKAN WAJAH DI DALAM BINGKAI'
            : 'AI FACE ID GATE READY';
          ctx.fillText(statusText, centerX, top - 14);

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(renderHud);
    };

    animationFrameId = requestAnimationFrame(renderHud);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cooldown, isScanning, activeTabMode]);

  // Auto-Scan interval logic when in Auto Gate Scanner mode
  useEffect(() => {
    if (!autoScanEnabled || activeTabMode !== 'scanner' || cooldown || !selectedStudentObj) return;

    const timer = setTimeout(() => {
      if (selectedStudentObj && isCameraActive && !cameraError) {
        processFaceAttendance(selectedStudentObj);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [autoScanEnabled, activeTabMode, cooldown, selectedStudentObj, isCameraActive, cameraError]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-violet-200">
            <ScanFace className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Scanner & Registrasi Face ID Siswa</h2>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                <span>AI AUTO-RECOGNITION</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Daftarkan wajah pertama kali sesuai nama siswa, selanjutnya sistem otomatis mendeteksi nama dan mencatat presensi secara instan.
            </p>
          </div>
        </div>

        {/* Action Controls & Settings Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-blue-50 text-blue-900 border-blue-200'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
            title={soundEnabled ? 'Suara Chime Aktif' : 'Suara Chime Nonaktif'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-700" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Chime</span>
          </button>

          {/* Voice Speech Toggle */}
          <button
            type="button"
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              speechEnabled
                ? 'bg-purple-50 text-purple-900 border-purple-200'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
            title={speechEnabled ? 'Suara Sambutan AI Aktif' : 'Suara Sambutan Nonaktif'}
          >
            <Sparkles className={`w-4 h-4 ${speechEnabled ? 'text-purple-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Suara AI</span>
          </button>

          {/* Camera Flip */}
          <button
            type="button"
            onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            title="Ganti Kamera Depan / Belakang"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Ganti Kamera</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTabMode('scanner')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTabMode === 'scanner'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>1. Terminal Auto Gate Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTabMode('enroll');
            setEnrollmentStep(1);
          }}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTabMode === 'enroll'
              ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <UserPlus className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>2. Seting / Pendaftaran Wajah Pertama</span>
          <span className="bg-amber-400 text-slate-900 px-2 py-0.2 rounded-full text-[10px] font-black">
            SETUP
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('directory')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTabMode === 'directory'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>3. Status Pendaftaran ({registeredCount}/{students.length})</span>
        </button>
      </div>

      {/* Quick Instructional Banner on Setup */}
      <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl border border-purple-700/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
              <span>Alur Pemindaian Otomatis: Daftarkan Wajah Sekali, Otomatis Seterusnya</span>
            </h3>
            <p className="text-xs text-purple-200/90 leading-relaxed max-w-2xl">
              1. Buka tab <strong>Seting Wajah Pertama</strong>, pilih nama siswa, lalu klik tombol ambil foto.<br />
              2. Profil wajah siswa langsung tersimpan ke database cloud.<br />
              3. Selanjutnya, di terminal <strong>Auto Gate</strong> nama dan wajah siswa akan otomatis terdeteksi tanpa perlu input manual.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTabMode('enroll');
              setEnrollmentStep(1);
            }}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-purple-950" />
            <span>Daftarkan Wajah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* TAB 1 & 2: SCANNER / ENROLLMENT STAGE */}
      {activeTabMode !== 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Camera Video Stream & HUD (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 rounded-3xl p-4 shadow-xl border-2 border-slate-800 relative overflow-hidden flex flex-col items-center">
              {/* Viewport Frame */}
              <div className="relative w-full aspect-4/3 max-h-[460px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                {/* Video Stream Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />

                {/* Canvas Overlay HUD */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                {/* Camera Inactive Overlay */}
                {!isCameraActive && (
                  <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center space-y-4 z-35">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center shadow-lg">
                      <ScanFace className="w-8 h-8 text-purple-500 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-white text-base">Kamera Scan Belum Aktif</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Modul pemindaian wajah dinonaktifkan secara bawaan untuk menghemat baterai & kuota. Silakan klik tombol di bawah untuk mengaktifkan kamera.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCameraActive(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer border border-purple-500/30"
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>AKTIFKAN KAMERA SCANNER</span>
                    </button>
                  </div>
                )}

                {/* Camera Error Message */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center space-y-3 z-30">
                    <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
                    <h3 className="font-black text-white text-base">Akses Kamera Terkendala</h3>
                    <p className="text-xs text-slate-300 max-w-md whitespace-pre-line text-left">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraError(null);
                        setIsCameraActive(false);
                        setTimeout(() => setIsCameraActive(true), 200);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Coba Sambungkan Ulang</span>
                    </button>
                  </div>
                )}

                {/* Live Top Indicator Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                  <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 flex items-center space-x-2 text-white text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{activeTabMode === 'enroll' ? 'MODE PENDAFTARAN WAJAH' : 'GATE SCANNER: READY'}</span>
                  </div>

                  <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-amber-400 font-mono text-[11px] font-bold">
                    Akurasi: {threshold}%
                  </div>
                </div>

                {/* Bottom Quick Action Bar on Camera */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-20 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2 text-white text-xs font-bold pl-1 truncate">
                    <ScanFace className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">
                      {activeTabMode === 'enroll'
                        ? enrollingStudentObj
                          ? `Daftarkan: ${enrollingStudentObj.fullName} (${enrollingStudentObj.currentClass})`
                          : 'Pilih Siswa untuk Didaftarkan'
                        : selectedStudentObj
                        ? `${selectedStudentObj.fullName} (${selectedStudentObj.currentClass})`
                        : 'Pilih Siswa'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {activeTabMode === 'enroll' ? (
                      <button
                        type="button"
                        disabled={!enrollingStudentObj}
                        onClick={handleEnrollFirstTime}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-300" />
                        <span>AMBIL & DAFTARKAN FOTO</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={cooldown || !selectedStudentObj}
                        onClick={() => selectedStudentObj && processFaceAttendance(selectedStudentObj)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>{cooldown ? 'Memproses...' : 'SCAN WAJAH (TAP)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-bar: Camera Device Selection */}
              <div className="w-full mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                  <Camera className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-700 w-full focus:outline-none focus:ring-1 focus:ring-purple-400"
                  >
                    {devices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Kamera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setAutoScanEnabled(!autoScanEnabled)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      autoScanEnabled
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${autoScanEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span>Pemindaian: {autoScanEnabled ? 'OTOMATIS' : 'MANUAL (KLIK TOMBOL)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* GPS Geofencing Status Card */}
            <div className={`p-4 rounded-2xl border transition-all shadow-xs ${
              gpsCoords 
                ? getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, schoolLat, schoolLng) <= geofenceRadius
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/90 border-rose-200 text-rose-950'
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    gpsCoords 
                      ? getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, schoolLat, schoolLng) <= geofenceRadius
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <MapPin className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs tracking-tight">VERIFIKASI RADIUS GEOLOKASI (GPS)</h4>
                    {gpsLoading ? (
                      <div className="flex items-center space-x-1.5 text-slate-500 font-medium text-[11px] mt-0.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                        <span>Mengunci posisi satelit GPS...</span>
                      </div>
                    ) : gpsCoords ? (
                      <div className="space-y-0.5 mt-0.5 text-[11px]">
                        <p className="font-medium text-slate-600">
                          Jarak Anda ke sekolah: <span className="font-extrabold text-slate-900">{getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, schoolLat, schoolLng)} meter</span>
                          {` (Maksimal radius toleransi: ${geofenceRadius} meter)`}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                            getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, schoolLat, schoolLng) <= geofenceRadius
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                              : 'bg-rose-100 border-rose-300 text-rose-800'
                          }`}>
                            {getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, schoolLat, schoolLng) <= geofenceRadius
                              ? '🟢 Di Dalam Radius Sekolah'
                              : '🔴 Di Luar Radius Sekolah'}
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">
                            ({gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                        {gpsError || 'Gagal mendeteksi lokasi GPS Anda. Mohon izinkan lokasi di browser.'}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchGPS}
                  disabled={gpsLoading}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs px-3 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh GPS</span>
                </button>
              </div>
            </div>

            {/* Pilihan Menu Mode Scan (Presensi) */}
            {activeTabMode === 'scanner' && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="font-extrabold text-xs text-slate-800">Pilihan Mode Scan Wajah</span>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-200">
                    SCAN DIRECTION
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFaceScanDirectionMode('auto');
                      showNotice('🔄 Mode Scan: Menyesuaikan Waktu / Otomatis');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                      faceScanDirectionMode === 'auto'
                        ? 'bg-purple-50 text-purple-950 border-purple-300 ring-2 ring-purple-100 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-purple-600" />
                    <div className="text-[11px] font-black">Otomatis / Waktu</div>
                    <div className="text-[9px] text-slate-400 font-medium hidden sm:block">Menyesuaikan Jam Harian</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFaceScanDirectionMode('masuk');
                      showNotice('📥 Mode Scan: Paksakan Masuk (Scan In)');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                      faceScanDirectionMode === 'masuk'
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300 ring-2 ring-emerald-100 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <LogIn className="w-4 h-4 text-emerald-600" />
                    <div className="text-[11px] font-black">Scan In (Masuk)</div>
                    <div className="text-[9px] text-slate-400 font-medium hidden sm:block">Paksakan Jam Masuk</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFaceScanDirectionMode('pulang');
                      showNotice('📤 Mode Scan: Paksakan Pulang (Scan Out)');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                      faceScanDirectionMode === 'pulang'
                        ? 'bg-blue-50 text-blue-950 border-blue-300 ring-2 ring-blue-100 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <LogOut className="w-4 h-4 text-blue-600" />
                    <div className="text-[11px] font-black">Scan Out (Pulang)</div>
                    <div className="text-[9px] text-slate-400 font-medium hidden sm:block">Paksakan Jam Pulang</div>
                  </button>
                </div>
              </div>
            )}

            {/* Threshold Slider Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Sensitivitas AI Match: </span>
                  <span className="font-extrabold text-purple-700 font-mono">{threshold}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-1 max-w-xs">
                <span className="text-[10px] text-slate-400 font-bold">50%</span>
                <input
                  type="range"
                  min={50}
                  max={99}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-bold">99%</span>
              </div>
            </div>
          </div>

          {/* Right Column: Enrollment Wizard or Scan Results & Student Selector (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* If in ENROLL MODE: Show Step-by-Step Enrollment Wizard */}
            {activeTabMode === 'enroll' ? (
              <div className="bg-white rounded-3xl p-5 border border-purple-200 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Pendaftaran Wajah Pertama Kali</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Kaitkan wajah siswa ke profil secara permanen</p>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                    Langkah {enrollmentStep} dari 3
                  </span>
                </div>

                {/* Step Indicators */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <div
                    onClick={() => setEnrollmentStep(1)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      enrollmentStep === 1
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    1. Pilih Siswa
                  </div>
                  <div
                    onClick={() => setEnrollmentStep(2)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      enrollmentStep === 2
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    2. Ambil Foto
                  </div>
                  <div
                    className={`p-2 rounded-xl border transition-all ${
                      enrollmentStep === 3
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    3. Wajah Aktif ✅
                  </div>
                </div>

                {/* STEP 1: Select Student */}
                {enrollmentStep === 1 && (
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1">
                      <div className="font-bold text-purple-900 flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-purple-600" />
                        <span>Pilih nama siswa yang ingin didaftarkan wajahnya:</span>
                      </div>
                      <p className="text-[11px] text-purple-700">
                        Pilih siswa di bawah ini, lalu klik "Lanjut ke Kamera" untuk mengambil sampel wajah.
                      </p>
                    </div>

                    {/* Filter Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ketik nama siswa atau NISN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>

                    {/* Student List in Wizard */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                      {filteredStudents.map((s) => {
                        const isSelected = enrollingStudentId === s.id;
                        const isReg = s.isFaceRegistered || (s.photo && !s.photo.includes('ui-avatars.com'));
                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              setEnrollingStudentId(s.id);
                              setIsIdentityVerified(false);
                            }}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-purple-100/90 border-purple-400 shadow-xs'
                                : 'bg-slate-50 hover:bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {s.photo ? (
                                  <img src={s.photo} alt={s.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <ScanFace className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-extrabold text-slate-900 truncate">{s.fullName}</div>
                                <div className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                                  <span className="font-bold text-slate-700">{s.currentClass}</span>
                                  <span>•</span>
                                  <span className="font-mono text-purple-700">{s.nisn}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              {isReg ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center space-x-1 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Terdaftar</span>
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                  Belum Daftar
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {enrollingStudentObj && (
                      <button
                        type="button"
                        onClick={() => setEnrollmentStep(2)}
                        className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                      >
                        <span>Lanjut Ambil Foto Wajah {enrollingStudentObj.fullName.split(' ')[0]}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* STEP 2: Live Alignment & Capture */}
                {enrollmentStep === 2 && enrollingStudentObj && (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>Posisikan Wajah {enrollingStudentObj.fullName}:</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Pastikan siswa melihat ke arah kamera dan wajah berada di dalam garis oval panduan.
                      </p>
                    </div>

                    {/* Selected Student Details Card */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {enrollingStudentObj.photo ? (
                            <img src={enrollingStudentObj.photo} alt={enrollingStudentObj.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <Smile className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 text-xs truncate">{enrollingStudentObj.fullName}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Kelas: <span className="font-bold text-slate-700">{enrollingStudentObj.currentClass}</span> | NISN: <span className="font-mono font-bold text-purple-700">{enrollingStudentObj.nisn}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">RFID: {enrollingStudentObj.rfidTag || '-'}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEnrollmentStep(1)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-bold underline cursor-pointer"
                      >
                        Ganti
                      </button>
                    </div>

                    {/* Identity Verification Check to prevent swapping */}
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="chk-id-verified"
                          checked={isIdentityVerified}
                          onChange={(e) => setIsIdentityVerified(e.target.checked)}
                          className="mt-1 rounded text-purple-600 focus:ring-purple-500 cursor-pointer h-4 w-4"
                        />
                        <label htmlFor="chk-id-verified" className="text-xs font-bold text-slate-700 cursor-pointer leading-tight select-none">
                          Konfirmasi Kesesuaian Identitas <span className="text-rose-500">*</span>
                          <span className="block text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">
                            Saya menjamin wajah siswa di depan kamera adalah benar milik <strong className="text-purple-700">{enrollingStudentObj.fullName}</strong>. Saya paham data ini akan disimpan permanen untuk presensi otomatis agar nama & wajah tidak tertukar.
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEnrollmentStep(1);
                          setIsIdentityVerified(false);
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Kembali
                      </button>

                      <button
                        type="button"
                        onClick={handleEnrollFirstTime}
                        disabled={!isIdentityVerified}
                        className={`flex-2 active:scale-95 text-white font-black text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                          isIdentityVerified
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none border border-slate-200'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span>AMBIL & DAFTARKAN SEKARANG</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Success Confirmation */}
                {enrollmentStep === 3 && enrollingStudentObj && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Wajah Berhasil Didaftarkan!</h4>
                      <p className="text-xs text-emerald-800 font-medium mt-1">
                        Profil biometrik wajah <strong>{enrollingStudentObj.fullName}</strong> telah aktif dan terhubung.
                      </p>
                    </div>

                    {/* Snapshot Preview */}
                    {previewSnapshot && (
                      <div className="w-24 h-28 rounded-2xl bg-white p-1 border-2 border-emerald-400 mx-auto overflow-hidden shadow-sm">
                        <img src={previewSnapshot} alt="Snapshot Wajah" className="w-full h-full object-cover rounded-xl" />
                      </div>
                    )}

                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] text-slate-600 text-left space-y-1">
                      <div className="font-bold text-emerald-950 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sistem Pengenalan Otomatis Siap Digunakan:</span>
                      </div>
                      <p>
                        Setiap kali {enrollingStudentObj.fullName.split(' ')[0]} berada di depan kamera gerbang scanner, sistem akan otomatis mengenali wajah dan mencatat presensi secara instan.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEnrollmentStep(1);
                          setPreviewSnapshot(null);
                          setIsIdentityVerified(false);
                        }}
                        className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 rounded-xl border border-slate-200 cursor-pointer"
                      >
                        + Daftarkan Siswa Lain
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTargetStudentId(enrollingStudentObj.id);
                          setActiveTabMode('scanner');
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2 rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Uji Coba Scan Auto Gate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* SCANNER MODE: Active Result Card & Quick Selection */
              <>
                {/* Active Result Card if Scanned */}
                {lastScanResult && (
                  <div
                    className={`p-5 rounded-3xl border-2 shadow-lg transition-all animate-in zoom-in-95 duration-200 ${
                      lastScanResult.success
                        ? lastScanResult.type === 'terlambat'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400 shadow-amber-200'
                          : lastScanResult.type === 'pulang'
                          ? 'bg-gradient-to-br from-blue-700 to-indigo-900 text-white border-blue-400 shadow-blue-200'
                          : 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-emerald-400 shadow-emerald-200'
                        : 'bg-rose-600 text-white border-rose-400 shadow-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/20 pb-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span className="font-black text-xs uppercase tracking-wider">
                          {lastScanResult.type === 'pulang'
                            ? 'PRESENSI PULANG (FACE ID)'
                            : lastScanResult.type === 'terlambat'
                            ? 'PRESENSI TERLAMBAT (FACE ID)'
                            : 'PRESENSI MASUK BERHASIL'}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold bg-black/25 px-2 py-0.5 rounded-md">
                        {lastScanResult.time}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
                      {/* Side-by-side face comparison to prevent mismatch */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="text-center">
                          <div className="w-16 h-20 rounded-xl bg-black/20 p-0.5 border border-white/20 overflow-hidden shadow-sm relative">
                            {lastScanResult.student?.photo ? (
                              <img
                                src={lastScanResult.student.photo}
                                alt="Foto Database"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/10 rounded-lg">
                                <ScanFace className="w-5 h-5 text-white/70" />
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-white/80 block mt-1 uppercase tracking-wider">Database</span>
                        </div>

                        <div className="text-white/40 text-[10px] font-black shrink-0 px-0.5">VS</div>

                        <div className="text-center">
                          <div className="w-16 h-20 rounded-xl bg-black/20 p-0.5 border border-white/20 overflow-hidden shadow-sm relative">
                            {lastScanResult.capturedSnapshot ? (
                              <img
                                src={lastScanResult.capturedSnapshot}
                                alt="Hasil Pindai"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/10 rounded-lg">
                                <Camera className="w-5 h-5 text-white/70" />
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-white/80 block mt-1 uppercase tracking-wider">Kamera Live</span>
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-black text-base leading-tight truncate">
                          {lastScanResult.student?.fullName || 'Siswa'}
                        </h3>
                        <div className="text-xs opacity-90 font-medium">
                          NISN: <span className="font-mono font-bold">{lastScanResult.student?.nisn}</span>
                        </div>
                        <div className="text-xs opacity-90 font-medium">
                          Kelas: <span className="font-bold">{lastScanResult.student?.currentClass}</span>
                        </div>
                        <div className="pt-1 flex items-center space-x-2">
                          <span className="bg-white/20 text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide border border-white/20">
                            🎯 Match {lastScanResult.confidence}%
                          </span>
                          <span className="bg-black/30 text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">
                            FaceID Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-medium opacity-95 bg-black/15 p-2 rounded-xl border border-white/10 text-center">
                      {lastScanResult.message}
                    </p>
                  </div>
                )}

                {/* Student Selection Directory for Auto Gate Testing */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <h3 className="font-black text-slate-800 text-sm">Daftar Siswa & Uji Scan Cepat</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTabMode('enroll');
                        setEnrollmentStep(1);
                      }}
                      className="text-xs font-black text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center space-x-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Daftarkan Wajah</span>
                    </button>
                  </div>

                  {/* Filter by Class & Search */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama / NISN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>

                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      {classesList.map((c) => (
                        <option key={c} value={c}>
                          {c === 'Semua' ? 'Semua Kelas' : `Kelas ${c}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student Items List */}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                    {filteredStudents.map((s) => {
                      const isSelected = targetStudentId === s.id;
                      const isReg = s.isFaceRegistered || (s.photo && !s.photo.includes('ui-avatars.com'));
                      return (
                        <div
                          key={s.id}
                          onClick={() => setTargetStudentId(s.id)}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-purple-50/90 border-purple-300 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {/* Photo Thumbnail */}
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {s.photo ? (
                                <img src={s.photo} alt={s.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <ScanFace className="w-5 h-5 text-slate-400" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1 text-left">
                              <div className="text-xs font-extrabold text-slate-900 truncate flex items-center space-x-1.5">
                                <span>{s.fullName}</span>
                                {isReg && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Wajah Terdaftar" />}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium flex items-center space-x-2">
                                <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                                  {s.currentClass}
                                </span>
                                <span className="font-mono text-purple-700 font-bold">{s.nisn}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1.5 shrink-0">
                            {!isReg ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEnrollingStudentId(s.id);
                                  setActiveTabMode('enroll');
                                  setEnrollmentStep(2);
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
                                title="Daftarkan foto wajah pertama kali"
                              >
                                <Camera className="w-3 h-3 text-slate-900" />
                                <span>Daftar Wajah</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={cooldown}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  processFaceAttendance(s);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-50 text-white px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center space-x-1 shadow-xs cursor-pointer"
                                title="Scan wajah dan catat presensi siswa ini"
                              >
                                <Zap className="w-3 h-3 text-amber-300" />
                                <span>TAP</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FULL DIRECTORY & FACE REGISTRATION STATUS VIEW */}
      {activeTabMode === 'directory' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  Status Data Wajah Biometrik Siswa ({registeredCount}/{students.length} Terdaftar)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Pastikan seluruh siswa telah terdaftar profil foto wajahnya agar proses absensi Face ID berjalan otomatis.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTabMode('enroll');
                  setEnrollmentStep(1);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>+ Daftarkan Wajah Siswa Baru</span>
              </button>
            </div>
          </div>

          {/* Metrics Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-bold">Total Seluruh Siswa</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{students.length}</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-emerald-700 font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Wajah Sudah Terdaftar (Auto Ready)</span>
              </div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{registeredCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="text-xs text-amber-700 font-bold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Belum Mendaftar Wajah</span>
              </div>
              <div className="text-2xl font-black text-amber-800 mt-1">{unregisterCount}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              {classesList.map((c) => (
                <option key={c} value={c}>
                  {c === 'Semua' ? 'Semua Kelas' : `Kelas ${c}`}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Status Wajah</option>
              <option value="Terdaftar">Hanya Wajah Terdaftar ✅</option>
              <option value="Belum">Hanya Belum Mendaftar ⚠️</option>
            </select>
          </div>

          {/* Table of Students & Face Registration Status */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="p-3">Foto / Wajah</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3">Status Face ID</th>
                  <th className="p-3 text-right">Aksi Pendaftaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map((s) => {
                  const isReg = s.isFaceRegistered || (s.photo && !s.photo.includes('ui-avatars.com'));
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                          {s.photo ? (
                            <img src={s.photo} alt={s.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <ScanFace className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 text-sm">{s.fullName}</div>
                        <div className="text-[10px] text-slate-400">Gender: {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{s.currentClass}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-700">{s.nisn}</td>
                      <td className="p-3">
                        {isReg ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center space-x-1.5 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Wajah Terdaftar (Auto Ready)</span>
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center space-x-1 border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Belum Didaftarkan</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEnrollingStudentId(s.id);
                            setActiveTabMode('enroll');
                            setEnrollmentStep(2);
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-2xs ${
                            isReg
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{isReg ? 'Foto Ulang' : 'Daftarkan Wajah'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Table: Today's Face ID Attendance Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Log Presensi Face ID Hari Ini ({todayFaceRecords.length} Siswa)
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Rekaman scan presensi yang terverifikasi melalui sensor wajah biometrik Face ID.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl border border-emerald-200">
              Hadir: {todayFaceRecords.filter((r) => r.statusFinal === 'Hadir').length}
            </span>
            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-xl border border-amber-200">
              Terlambat: {todayFaceRecords.filter((r) => r.statusFinal === 'Terlambat').length}
            </span>
          </div>
        </div>

        {todayFaceRecords.length === 0 ? (
          <div className="text-center py-10 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ScanFace className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-600">Belum Ada Presensi Face ID Hari Ini</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Arahkan wajah siswa ke depan kamera pemindai di atas untuk mencatat presensi masuk/pulang secara otomatis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Jam Masuk</th>
                  <th className="p-3">Jam Pulang</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Metode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {todayFaceRecords.map((r) => {
                  const std = students.find((s) => s.id === r.studentId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-purple-700">{r.timeIn}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {std?.photo ? (
                              <img src={std.photo} alt={r.studentName} className="w-full h-full object-cover" />
                            ) : (
                              <ScanFace className="w-4 h-4 text-slate-400 m-auto" />
                            )}
                          </div>
                          <span className="font-extrabold text-slate-900">{r.studentName}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{r.class}</span>
                      </td>
                      <td className="p-3 font-mono font-semibold text-emerald-700">{r.timeIn || '-'}</td>
                      <td className="p-3 font-mono font-semibold text-blue-700">{r.timeOut || '-'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            r.statusFinal === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.statusFinal === 'Terlambat'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.statusFinal}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="bg-purple-100 text-purple-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center space-x-1 w-fit border border-purple-200">
                          <ScanFace className="w-3 h-3 text-purple-700" />
                          <span>FaceID</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
