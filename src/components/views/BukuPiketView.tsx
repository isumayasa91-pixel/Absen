import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  Plus,
  Trash2,
  Printer,
  Calendar,
  Clock,
  UserCheck,
  Users,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Search,
  RefreshCw,
  LogOut,
  Edit3,
  Eye,
  Building,
} from 'lucide-react';
import {
  PiketBookRecord,
  PiketTeacherAttendance,
  PiketClassAttendance,
  EarlyLeaveRecord,
} from '../../types';

export const BukuPiketView: React.FC = () => {
  const {
    piketRecords,
    savePiketRecord,
    deletePiketRecord,
    teachers,
    classes,
    students,
    attendanceRecords,
    settings,
    currentUser,
    showNotice,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper daftar hari Indonesia
  const getDayName = (dateStr: string) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Senin' : days[d.getDay()];
  };

  // Default daftar kelas SMP standar jika belum ada di data kelas
  const defaultSmpClasses = [
    'VII A', 'VII B', 'VII C', 'VII D', 'VII E',
    'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E',
    'IX A', 'IX B', 'IX C', 'IX D', 'IX E',
  ];

  // Ambil kelas aktif gabungan dari master data dan standar
  const availableClassNames = useMemo(() => {
    const masterClassNames = classes.map((c) => c.className);
    const combined = Array.from(new Set([...defaultSmpClasses, ...masterClassNames]));
    return combined;
  }, [classes]);

  // Tab State: 'editor' | 'history' | 'print'
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'history' | 'print'>('editor');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<PiketBookRecord>(() => {
    // Check if record exists for today
    const existing = piketRecords.find((r) => r.date === todayStr);
    if (existing) return existing;

    // Build initial form
    const initialTeachersList: PiketTeacherAttendance[] = teachers.map((t) => ({
      teacherId: t.id,
      teacherName: t.fullNameWithTitle,
      nip: t.nip,
      subject: t.position || 'Guru Mapel',
      status: 'Hadir',
      timeSlot: 'Jam 1-6',
      substituteTeacher: '-',
      notes: '',
    }));

    const initialClassList: PiketClassAttendance[] = availableClassNames.map((cls) => {
      const clsStudents = students.filter((s) => s.currentClass === cls);
      const total = clsStudents.length > 0 ? clsStudents.length : 32;
      return {
        className: cls,
        totalStudents: total,
        hadir: total,
        sakit: 0,
        izin: 0,
        alpa: 0,
        dispen: 0,
        terlambat: 0,
        absentStudentNames: '-',
      };
    });

    const defaultPiketIds = [
      teachers[0]?.id || '',
      teachers[1]?.id || '',
      teachers[2]?.id || '',
    ].filter(Boolean);

    const defaultPiketNames = [
      teachers[0]?.fullNameWithTitle || '',
      teachers[1]?.fullNameWithTitle || '',
      teachers[2]?.fullNameWithTitle || '',
    ].filter(Boolean);

    const defaultPiketNips = [
      teachers[0]?.nip || '',
      teachers[1]?.nip || '',
      teachers[2]?.nip || '',
    ].filter(Boolean);

    return {
      id: `pkt-${todayStr}`,
      date: todayStr,
      dayName: getDayName(todayStr),
      lessonStartTime: '07:15 WITA',
      piketTeacherIds: defaultPiketIds,
      piketTeacherNames: defaultPiketNames,
      piketTeacherNips: defaultPiketNips,
      teacherAttendances: initialTeachersList,
      classAttendances: initialClassList,
      earlyLeaves: [],
      importantEvents: '',
      principalName: settings.principalName || 'Dr. H. Ahmad Wijaya, M.Pd.',
      principalNip: settings.principalNip || '19750812 199903 1 002',
      notes: '',
      createdAt: `${todayStr} 07:00:00`,
    };
  });

  // Sinkronisasi otomatis presensi hari itu dari database attendanceRecords
  const handleAutoSyncFromAttendance = () => {
    const targetDate = formData.date;
    const recordsOnDate = attendanceRecords.filter((a) => a.date === targetDate);

    const updatedClasses = formData.classAttendances.map((c) => {
      const clsStudents = students.filter((s) => s.currentClass === c.className);
      const totalStudents = clsStudents.length > 0 ? clsStudents.length : c.totalStudents;

      if (recordsOnDate.length === 0) {
        return {
          ...c,
          totalStudents,
        };
      }

      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      let dispen = 0;
      const absentDetails: string[] = [];

      clsStudents.forEach((std) => {
        const att = recordsOnDate.find((r) => r.studentId === std.id);
        if (!att || att.statusFinal === 'Hadir' || att.statusFinal === 'Terlambat') {
          hadir++;
        } else if (att.statusFinal === 'Sakit') {
          sakit++;
          absentDetails.push(`${std.fullName} (Sakit)`);
        } else if (att.statusFinal === 'Izin') {
          izin++;
          absentDetails.push(`${std.fullName} (Izin)`);
        } else if (att.statusFinal === 'Alpa') {
          alpa++;
          absentDetails.push(`${std.fullName} (Alpa)`);
        } else if (att.statusFinal === 'Dispensasi') {
          dispen++;
          absentDetails.push(`${std.fullName} (Dispensasi)`);
        }
      });

      return {
        ...c,
        totalStudents,
        hadir,
        sakit,
        izin,
        alpa,
        dispen,
        absentStudentNames: absentDetails.length > 0 ? absentDetails.join(', ') : '-',
      };
    });

    setFormData((prev) => ({
      ...prev,
      classAttendances: updatedClasses,
    }));

    showNotice(`Sinkronisasi absensi siswa tanggal ${targetDate} berhasil!`);
  };

  // Set Guru Piket untuk Slot Tertentu (Slot 1, 2, 3)
  const handleSetPiketTeacherSlot = (slotIndex: number, teacherId: string) => {
    const currentIds = [...(formData.piketTeacherIds || [])];
    const currentNames = [...(formData.piketTeacherNames || [])];
    const currentNips = [...(formData.piketTeacherNips || [])];

    // Ensure array has at least 3 slots
    while (currentIds.length < 3) currentIds.push('');
    while (currentNames.length < 3) currentNames.push('');
    while (currentNips.length < 3) currentNips.push('');

    if (!teacherId) {
      currentIds[slotIndex] = '';
      currentNames[slotIndex] = '';
      currentNips[slotIndex] = '';
    } else {
      const teacher = teachers.find((t) => t.id === teacherId);
      if (teacher) {
        currentIds[slotIndex] = teacher.id;
        currentNames[slotIndex] = teacher.fullNameWithTitle;
        currentNips[slotIndex] = teacher.nip || '-';
      }
    }

    setFormData((prev) => ({
      ...prev,
      piketTeacherIds: currentIds,
      piketTeacherNames: currentNames,
      piketTeacherNips: currentNips,
    }));
  };

  // Pilih Guru Piket (Dropdown / Toggle Sync)
  const handleTogglePiketTeacher = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;

    const exists = formData.piketTeacherIds.includes(teacherId);
    let newIds = [...formData.piketTeacherIds];
    let newNames = [...formData.piketTeacherNames];
    let newNips = [...(formData.piketTeacherNips || [])];

    if (exists) {
      if (newIds.filter(Boolean).length === 1) {
        showNotice('Minimal pilih satu guru piket!');
        return;
      }
      newIds = newIds.filter((id) => id !== teacherId);
      newNames = newNames.filter((name) => name !== teacher.fullNameWithTitle);
      newNips = newNips.filter((nip) => nip !== teacher.nip);
    } else {
      newIds.push(teacher.id);
      newNames.push(teacher.fullNameWithTitle);
      newNips.push(teacher.nip);
    }

    setFormData((prev) => ({
      ...prev,
      piketTeacherIds: newIds,
      piketTeacherNames: newNames,
      piketTeacherNips: newNips,
    }));
  };

  // Tambah Guru ke tabel absen guru piket
  const handleAddTeacherRow = () => {
    const newRow: PiketTeacherAttendance = {
      teacherId: `tch-custom-${Date.now()}`,
      teacherName: '',
      nip: '-',
      subject: '',
      status: 'Hadir',
      timeSlot: 'Jam 1-6',
      substituteTeacher: '-',
      notes: '',
    };
    setFormData((prev) => ({
      ...prev,
      teacherAttendances: [...prev.teacherAttendances, newRow],
    }));
  };

  const handleUpdateTeacherRow = (index: number, field: keyof PiketTeacherAttendance, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.teacherAttendances];
      updated[index] = { ...updated[index], [field]: value };
      
      // Jika yang diubah teacherName dan merupakan guru terdaftar, sinkronkan NIP
      if (field === 'teacherName') {
        const found = teachers.find((t) => t.fullNameWithTitle === value);
        if (found) {
          updated[index].nip = found.nip;
          updated[index].teacherId = found.id;
          if (found.position) updated[index].subject = found.position;
        }
      }
      return { ...prev, teacherAttendances: updated };
    });
  };

  const handleDeleteTeacherRow = (index: number) => {
    setFormData((prev) => {
      const updated = prev.teacherAttendances.filter((_, i) => i !== index);
      return { ...prev, teacherAttendances: updated };
    });
  };

  // Update data absen kelas
  const handleUpdateClassAttendance = (
    index: number,
    field: keyof PiketClassAttendance,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updated = [...prev.classAttendances];
      const target = { ...updated[index], [field]: value };

      // Kalkulasi otomatis siswa hadir jika total dan tidak hadir diubah
      if (['totalStudents', 'sakit', 'izin', 'alpa', 'dispen'].includes(field)) {
        const total = Number(field === 'totalStudents' ? value : target.totalStudents) || 0;
        const s = Number(field === 'sakit' ? value : target.sakit) || 0;
        const i = Number(field === 'izin' ? value : target.izin) || 0;
        const a = Number(field === 'alpa' ? value : target.alpa) || 0;
        const d = Number(field === 'dispen' ? value : (target.dispen || 0)) || 0;
        target.hadir = Math.max(0, total - (s + i + a + d));
      }

      updated[index] = target;
      return { ...prev, classAttendances: updated };
    });
  };

  // Siswa mendahului pulang
  const handleAddEarlyLeave = () => {
    const newLeave: EarlyLeaveRecord = {
      id: `el-${Date.now()}`,
      studentName: '',
      className: availableClassNames[0] || 'VII A',
      timeOut: '10:00 WITA',
      reason: 'Sakit / Keperluan Keluarga',
      pickedUpBy: 'Orang Tua / Wali',
    };
    setFormData((prev) => ({
      ...prev,
      earlyLeaves: [...prev.earlyLeaves, newLeave],
    }));
  };

  const handleUpdateEarlyLeave = (index: number, field: keyof EarlyLeaveRecord, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.earlyLeaves];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, earlyLeaves: updated };
    });
  };

  const handleDeleteEarlyLeave = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      earlyLeaves: prev.earlyLeaves.filter((_, i) => i !== index),
    }));
  };

  // Hitung Rekapitulasi Statistik
  const calculatedRekap = useMemo(() => {
    let totalStudents = 0;
    let totalHadir = 0;
    let totalSakit = 0;
    let totalIzin = 0;
    let totalAlpa = 0;
    let totalDispen = 0;

    formData.classAttendances.forEach((c) => {
      totalStudents += Number(c.totalStudents) || 0;
      totalHadir += Number(c.hadir) || 0;
      totalSakit += Number(c.sakit) || 0;
      totalIzin += Number(c.izin) || 0;
      totalAlpa += Number(c.alpa) || 0;
      totalDispen += Number(c.dispen) || 0;
    });

    const totalTeachers = formData.teacherAttendances.length;
    const teachersPresent = formData.teacherAttendances.filter((t) => t.status === 'Hadir').length;
    const teachersAbsent = totalTeachers - teachersPresent;

    const studentPercentage = totalStudents > 0 ? ((totalHadir / totalStudents) * 100).toFixed(1) : '100';

    return {
      totalStudents,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa,
      totalDispen,
      studentPercentage,
      totalTeachers,
      teachersPresent,
      teachersAbsent,
    };
  }, [formData.classAttendances, formData.teacherAttendances]);

  // Simpan Buku Piket ke DB
  const handleSave = () => {
    if (formData.piketTeacherNames.length === 0) {
      showNotice('Harap pilih minimal satu Guru Piket!');
      return;
    }

    const recordToSave: PiketBookRecord = {
      ...formData,
      principalName: settings.principalName || formData.principalName,
      principalNip: settings.principalNip || formData.principalNip,
      rekapSummary: calculatedRekap,
      updatedAt: new Date().toISOString(),
    };

    savePiketRecord(recordToSave);
  };

  // Buka Record Tertentu untuk Diedit atau Dicetak
  const handleSelectRecord = (rec: PiketBookRecord, viewMode: 'editor' | 'print') => {
    setFormData(rec);
    setSelectedRecordId(rec.id);
    setActiveSubTab(viewMode);
  };

  // Reset Form untuk Buat Buku Piket Baru
  const handleNewRecord = () => {
    const newDate = new Date().toISOString().split('T')[0];
    const initialTeachersList: PiketTeacherAttendance[] = teachers.map((t) => ({
      teacherId: t.id,
      teacherName: t.fullNameWithTitle,
      nip: t.nip,
      subject: t.position || 'Guru Mapel',
      status: 'Hadir',
      timeSlot: 'Jam 1-6',
      substituteTeacher: '-',
      notes: '',
    }));

    const initialClassList: PiketClassAttendance[] = availableClassNames.map((cls) => {
      const clsStudents = students.filter((s) => s.currentClass === cls);
      const total = clsStudents.length > 0 ? clsStudents.length : 32;
      return {
        className: cls,
        totalStudents: total,
        hadir: total,
        sakit: 0,
        izin: 0,
        alpa: 0,
        dispen: 0,
        terlambat: 0,
        absentStudentNames: '-',
      };
    });

    const defaultPiketIds = [
      teachers[0]?.id || '',
      teachers[1]?.id || '',
      teachers[2]?.id || '',
    ].filter(Boolean);

    const defaultPiketNames = [
      teachers[0]?.fullNameWithTitle || '',
      teachers[1]?.fullNameWithTitle || '',
      teachers[2]?.fullNameWithTitle || '',
    ].filter(Boolean);

    const defaultPiketNips = [
      teachers[0]?.nip || '',
      teachers[1]?.nip || '',
      teachers[2]?.nip || '',
    ].filter(Boolean);

    setFormData({
      id: `pkt-${Date.now()}`,
      date: newDate,
      dayName: getDayName(newDate),
      lessonStartTime: '07:15 WITA',
      piketTeacherIds: defaultPiketIds,
      piketTeacherNames: defaultPiketNames,
      piketTeacherNips: defaultPiketNips,
      teacherAttendances: initialTeachersList,
      classAttendances: initialClassList,
      earlyLeaves: [],
      importantEvents: '',
      principalName: settings.principalName,
      principalNip: settings.principalNip,
      notes: '',
      createdAt: `${newDate} 07:00:00`,
    });
    setSelectedRecordId(null);
    setActiveSubTab('editor');
  };

  // Filter Buku Piket di Tab Riwayat
  const filteredHistory = useMemo(() => {
    return piketRecords.filter((r) => {
      const matchMonth = filterMonth ? r.date.startsWith(filterMonth) : true;
      const matchSearch =
        r.date.includes(searchTerm) ||
        r.dayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.piketTeacherNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.importantEvents && r.importantEvents.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchMonth && matchSearch;
    });
  }, [piketRecords, filterMonth, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-rose-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
            <ClipboardList className="w-8 h-8 text-rose-200" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Buku Piket Harian Sekolah</h1>
            <p className="text-rose-100 text-sm mt-0.5">
              Pencatatan resmi kehadiran Guru, Siswa (Kelas VII A - IX E), Kejadian Penting, Siswa Pulang & Pengesahan
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
          <button
            id="tab-buku-piket-editor"
            onClick={() => setActiveSubTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'editor'
                ? 'bg-white text-rose-900 shadow-md scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Input / Edit Piket
          </button>
          <button
            id="tab-buku-piket-history"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-white text-rose-900 shadow-md scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Riwayat Buku Piket ({piketRecords.length})
          </button>
          <button
            id="tab-buku-piket-print"
            onClick={() => setActiveSubTab('print')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'print'
                ? 'bg-white text-rose-900 shadow-md scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Printer className="w-4 h-4" />
            Format Cetak / Dokumen
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: FORM INPUT & EDITOR */}
      {activeSubTab === 'editor' && (
        <div className="space-y-6">
          {/* Header Bar Kontrol Editor */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {formData.dayName}, {formData.date}
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Mulai: {formData.lessonStartTime}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="btn-piket-sync-absensi"
                onClick={handleAutoSyncFromAttendance}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
                title="Tarik data presensi siswa hari ini dari database presensi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sinkronkan Absensi Siswa Hari Ini
              </button>
              <button
                id="btn-piket-new"
                onClick={handleNewRecord}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Buat Tanggal Baru
              </button>
              <button
                id="btn-piket-save"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan Buku Piket
              </button>
              <button
                id="btn-piket-view-print"
                onClick={() => setActiveSubTab('print')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Pratinjau Cetak
              </button>
            </div>
          </div>

          {/* 1. INFORMASI UMUM & GURU PIKET */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building className="w-5 h-5 text-rose-600" />
              1. Informasi Hari, Waktu & Petugas Guru Piket
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Tanggal Piket
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      date: newDate,
                      dayName: getDayName(newDate),
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Hari
                </label>
                <input
                  type="text"
                  value={formData.dayName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dayName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Pelajaran Di Mulai
                </label>
                <input
                  type="text"
                  value={formData.lessonStartTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lessonStartTime: e.target.value }))}
                  placeholder="Contoh: 07:15 WITA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Pilihan Petugas Guru Piket (3 Orang - Sinkron Data Guru) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-rose-600" />
                  Petugas Guru Piket (3 Orang - Dipilih Dari Data Guru)
                </label>
                <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  3 Orang Petugas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((slotIdx) => {
                  const teacherId = formData.piketTeacherIds?.[slotIdx] || '';
                  const teacherName = formData.piketTeacherNames?.[slotIdx] || '';
                  const teacherNip = formData.piketTeacherNips?.[slotIdx] || '';
                  const selectedTeacher = teachers.find((t) => t.id === teacherId);

                  return (
                    <div
                      key={slotIdx}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        teacherId
                          ? 'bg-rose-50/40 border-rose-200 shadow-sm'
                          : 'bg-slate-50 border-dashed border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">
                            {slotIdx + 1}
                          </span>
                          Petugas Piket {slotIdx + 1} {slotIdx === 0 ? '(Koordinator)' : ''}
                        </span>
                        {teacherId && (
                          <button
                            type="button"
                            onClick={() => handleSetPiketTeacherSlot(slotIdx, '')}
                            className="text-[10px] text-slate-400 hover:text-rose-600 font-bold"
                            title="Kosongkan petugas ini"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Dropdown Pilihan Guru */}
                      <div>
                        <select
                          value={teacherId}
                          onChange={(e) => handleSetPiketTeacherSlot(slotIdx, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 shadow-sm"
                        >
                          <option value="">-- Pilih Guru Piket {slotIdx + 1} --</option>
                          {teachers.map((tch) => (
                            <option key={tch.id} value={tch.id}>
                              {tch.fullNameWithTitle} {tch.nip ? `(${tch.nip})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Detail Guru Terpilih */}
                      {teacherId ? (
                        <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-xl border border-rose-100 text-slate-700">
                          <div className="font-bold text-slate-900 truncate">
                            {teacherName || selectedTeacher?.fullNameWithTitle}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            NIP: {teacherNip || selectedTeacher?.nip || '-'}
                          </div>
                          <div className="text-[10px] text-rose-600 font-medium">
                            Mapel: {selectedTeacher?.position || 'Guru Mapel'}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl border border-dashed border-slate-200 text-center text-[11px] text-slate-400 italic">
                          Belum ada guru yang dipilih
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. A. ABSEN GURU */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                A. Absen Guru
              </h2>
              <button
                type="button"
                onClick={handleAddTeacherRow}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris Guru
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center">No</th>
                    <th className="px-3 py-3 w-56">Nama Guru</th>
                    <th className="px-3 py-3 w-40">NIP</th>
                    <th className="px-3 py-3 w-36">Mata Pelajaran</th>
                    <th className="px-3 py-3 w-32">Status Hadir</th>
                    <th className="px-3 py-3 w-28">Jam Ke-</th>
                    <th className="px-3 py-3 w-44">Guru Pengganti / Tugas</th>
                    <th className="px-3 py-3">Keterangan</th>
                    <th className="px-2 py-3 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {formData.teacherAttendances.map((tch, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <select
                          value={tch.teacherName}
                          onChange={(e) => handleUpdateTeacherRow(idx, 'teacherName', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 text-xs"
                        >
                          <option value="">-- Pilih Guru --</option>
                          {teachers.map((t) => (
                            <option key={t.id} value={t.fullNameWithTitle}>
                              {t.fullNameWithTitle}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={tch.nip || ''}
                          onChange={(e) => handleUpdateTeacherRow(idx, 'nip', e.target.value)}
                          placeholder="NIP Guru"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={tch.subject || ''}
                          onChange={(e) => handleUpdateTeacherRow(idx, 'subject', e.target.value)}
                          placeholder="Mata Pelajaran"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={tch.status}
                          onChange={(e) => handleUpdateTeacherRow(idx, 'status', e.target.value as any)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-bold text-xs ${
                            tch.status === 'Hadir'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : tch.status === 'Izin'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : tch.status === 'Sakit'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : tch.status === 'Tugas Luar'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Tugas Luar">Tugas Luar</option>
                          <option value="Terlambat">Terlambat</option>
                          <option value="Alpa">Alpa</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={tch.timeSlot || ''}
                          onChange={(e) => handleUpdateTeacherRow(idx, 'timeSlot', e.target.value)}
                          placeholder="Jam 1-4"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={tch.substituteTeacher || ''}
                          onChange={(e) => handleUpdateTeacherRow(idx, 'substituteTeacher', e.target.value)}
                          placeholder="Guru Pengganti / Tugas"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={tch.notes || ''}
                          onChange={(e) => handleUpdateTeacherRow(idx, 'notes', e.target.value)}
                          placeholder="Keterangan tambahan"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTeacherRow(idx)}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. B. ABSEN SISWA (KELAS VII A s/d IX E) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  B. Absen Siswa (Kelas VII A s/d IX E)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekap kehadiran siswa per kelas lengkap dengan daftar siswa yang berhalangan hadir.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoSyncFromAttendance}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Ambil Otomatis Dari Presensi Hari Ini
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center">No</th>
                    <th className="px-3 py-3 w-28">Kelas</th>
                    <th className="px-3 py-3 w-20 text-center">Jml Siswa</th>
                    <th className="px-3 py-3 w-20 text-center bg-emerald-50 text-emerald-900">Hadir</th>
                    <th className="px-3 py-3 w-20 text-center bg-amber-50 text-amber-900">Sakit</th>
                    <th className="px-3 py-3 w-20 text-center bg-blue-50 text-blue-900">Izin</th>
                    <th className="px-3 py-3 w-20 text-center bg-rose-50 text-rose-900">Alpa</th>
                    <th className="px-3 py-3 w-20 text-center bg-purple-50 text-purple-900">Dispen</th>
                    <th className="px-3 py-3">Nama Siswa Tidak Hadir / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {formData.classAttendances.map((cls, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="px-3 py-2 font-black text-slate-900">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-black">
                          {cls.className}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={cls.totalStudents}
                          onChange={(e) => handleUpdateClassAttendance(idx, 'totalStudents', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-center font-bold text-xs"
                        />
                      </td>
                      <td className="px-3 py-2 text-center bg-emerald-50/40">
                        <input
                          type="number"
                          min="0"
                          value={cls.hadir}
                          onChange={(e) => handleUpdateClassAttendance(idx, 'hadir', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-emerald-300 text-center font-bold text-emerald-800 text-xs bg-emerald-50/60"
                        />
                      </td>
                      <td className="px-3 py-2 text-center bg-amber-50/40">
                        <input
                          type="number"
                          min="0"
                          value={cls.sakit}
                          onChange={(e) => handleUpdateClassAttendance(idx, 'sakit', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-amber-300 text-center font-bold text-amber-800 text-xs bg-amber-50/60"
                        />
                      </td>
                      <td className="px-3 py-2 text-center bg-blue-50/40">
                        <input
                          type="number"
                          min="0"
                          value={cls.izin}
                          onChange={(e) => handleUpdateClassAttendance(idx, 'izin', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-blue-300 text-center font-bold text-blue-800 text-xs bg-blue-50/60"
                        />
                      </td>
                      <td className="px-3 py-2 text-center bg-rose-50/40">
                        <input
                          type="number"
                          min="0"
                          value={cls.alpa}
                          onChange={(e) => handleUpdateClassAttendance(idx, 'alpa', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-rose-300 text-center font-bold text-rose-800 text-xs bg-rose-50/60"
                        />
                      </td>
                      <td className="px-3 py-2 text-center bg-purple-50/40">
                        <input
                          type="number"
                          min="0"
                          value={cls.dispen || 0}
                          onChange={(e) => handleUpdateClassAttendance(idx, 'dispen', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-purple-300 text-center font-bold text-purple-800 text-xs bg-purple-50/60"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={cls.absentStudentNames || ''}
                          onChange={(e) => handleUpdateClassAttendance(idx, 'absentStudentNames', e.target.value)}
                          placeholder="Nama siswa & alasan (contoh: Andi (Sakit), Budi (Izin))"
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="px-3 py-2.5 text-center font-black">
                      TOTAL REKAP SISWA
                    </td>
                    <td className="px-3 py-2.5 text-center font-black">{calculatedRekap.totalStudents}</td>
                    <td className="px-3 py-2.5 text-center font-black text-emerald-800 bg-emerald-100">
                      {calculatedRekap.totalHadir}
                    </td>
                    <td className="px-3 py-2.5 text-center font-black text-amber-800 bg-amber-100">
                      {calculatedRekap.totalSakit}
                    </td>
                    <td className="px-3 py-2.5 text-center font-black text-blue-800 bg-blue-100">
                      {calculatedRekap.totalIzin}
                    </td>
                    <td className="px-3 py-2.5 text-center font-black text-rose-800 bg-rose-100">
                      {calculatedRekap.totalAlpa}
                    </td>
                    <td className="px-3 py-2.5 text-center font-black text-purple-800 bg-purple-100">
                      {calculatedRekap.totalDispen}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-slate-600">
                      Persentase Kehadiran: <span className="font-bold text-emerald-700">{calculatedRekap.studentPercentage}%</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 4. KEJADIAN PENTING & SISWA MENDAHULUI PULANG */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Siswa Mendahului Pulang */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-amber-600" />
                  Siswa Mendahului Pulang
                </h2>
                <button
                  type="button"
                  onClick={handleAddEarlyLeave}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs border border-amber-200 flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Siswa Pulang
                </button>
              </div>

              {formData.earlyLeaves.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  Tidak ada catatan siswa yang mendahului pulang hari ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.earlyLeaves.map((el, idx) => (
                    <div
                      key={el.id || idx}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700">Siswa #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEarlyLeave(idx)}
                          className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Siswa</label>
                          <input
                            type="text"
                            value={el.studentName}
                            onChange={(e) => handleUpdateEarlyLeave(idx, 'studentName', e.target.value)}
                            placeholder="Nama Lengkap"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Kelas</label>
                          <select
                            value={el.className}
                            onChange={(e) => handleUpdateEarlyLeave(idx, 'className', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                          >
                            {availableClassNames.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Jam Pulang</label>
                          <input
                            type="text"
                            value={el.timeOut}
                            onChange={(e) => handleUpdateEarlyLeave(idx, 'timeOut', e.target.value)}
                            placeholder="10:30 WITA"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Alasan Pulang</label>
                          <input
                            type="text"
                            value={el.reason}
                            onChange={(e) => handleUpdateEarlyLeave(idx, 'reason', e.target.value)}
                            placeholder="Sakit pusing / keperluan keluarga"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Dijemput Oleh / Wali</label>
                          <input
                            type="text"
                            value={el.pickedUpBy || ''}
                            onChange={(e) => handleUpdateEarlyLeave(idx, 'pickedUpBy', e.target.value)}
                            placeholder="Ibu / Ayah / Mandiri"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kejadian Penting / Catatan Piket */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Kejadian Penting / Catatan Petugas Piket
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Uraian Kejadian Khusus / Situasi Sekolah
                </label>
                <textarea
                  rows={6}
                  value={formData.importantEvents}
                  onChange={(e) => setFormData((prev) => ({ ...prev, importantEvents: e.target.value }))}
                  placeholder="Tuliskan catatan kejadian penting selama jam sekolah berlangsung (misal: jalannya upacara, ada tamu dinas, pemadaman listrik, dsb)..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 text-xs text-slate-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan tambahan (opsional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 5. PENGESAHAN (BAWAH KIRI: KEPALA SEKOLAH, BAWAH KANAN: GURU PIKET) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              5. Pengesahan Pejabat (Bawah Kiri: Mengetahui Kepala Sekolah & Bawah Kanan: Petugas Guru Piket)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              {/* Kiri: Kepala Sekolah */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Bawah Kiri: Mengetahui Kepala Sekolah
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {settings.principalName || formData.principalName || 'Dr. H. Ahmad Wijaya, M.Pd.'}
                </div>
                <div className="text-xs text-slate-500">
                  NIP: {settings.principalNip || formData.principalNip || '19750812 199903 1 002'}
                </div>
              </div>

              {/* Kanan: Guru Piket (3 Orang) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Bawah Kanan: Petugas Guru Piket</span>
                  <span className="text-[10px] text-rose-600 font-bold">3 Orang Petugas</span>
                </div>
                <div className="space-y-2 pt-1">
                  {[0, 1, 2].map((idx) => {
                    const name = formData.piketTeacherNames?.[idx];
                    const nip = formData.piketTeacherNips?.[idx];
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                        <div className="font-semibold text-slate-900">
                          {idx + 1}. {name || <span className="text-slate-400 italic">Belum dipilih</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIP: {nip || '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan Buku Piket ({formData.dayName}, {formData.date})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RIWAYAT BUKU PIKET */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  Daftar Catatan Buku Piket
                </h2>
                <p className="text-xs text-slate-500">
                  Semua arsip dan dokumentasi buku piket harian yang telah tersimpan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari hari, tanggal, nama guru piket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 w-64"
                  />
                </div>

                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
                />

                <button
                  type="button"
                  onClick={handleNewRecord}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Buat Baru
                </button>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-500" />
                <p className="font-bold text-slate-600 text-sm">Tidak ada riwayat Buku Piket yang ditemukan.</p>
                <p className="text-xs text-slate-400 mt-1">Silakan buat catatan buku piket baru untuk tanggal hari ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-800 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">Hari / Tanggal</th>
                      <th className="px-4 py-3.5">Pelajaran Dimulai</th>
                      <th className="px-4 py-3.5">Guru Piket</th>
                      <th className="px-4 py-3.5 text-center">Kehadiran Guru</th>
                      <th className="px-4 py-3.5 text-center">Kehadiran Siswa</th>
                      <th className="px-4 py-3.5 text-center">Siswa Pulang</th>
                      <th className="px-4 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredHistory.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>{rec.dayName}, {rec.date}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {rec.lessonStartTime || '07:15 WITA'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-rose-900">
                          {rec.piketTeacherNames?.join(', ') || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                            {rec.teacherAttendances?.filter((t) => t.status === 'Hadir').length || 0} / {rec.teacherAttendances?.length || 0} Hadir
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                            {rec.rekapSummary ? `${rec.rekapSummary.totalHadir} / ${rec.rekapSummary.totalStudents}` : 'Terdata'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px]">
                            {rec.earlyLeaves?.length || 0} Siswa
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectRecord(rec, 'editor')}
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              title="Edit Catatan Piket"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectRecord(rec, 'print')}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Lihat Format Cetak"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus catatan Buku Piket tanggal ${rec.date}?`)) {
                                  deletePiketRecord(rec.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* SUB-VIEW 3: FORMAT CETAK RESMI (PRINT VIEW) */}
      {activeSubTab === 'print' && (
        <div className="space-y-6">
          {/* Top Control Bar for Printing */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                Dokumen Resmi Buku Piket: <span className="text-rose-600">{formData.dayName}, {formData.date}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('editor')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Kembali ke Editor
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                Cetak Dokumen (Print)
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-300 shadow-xl max-w-5xl mx-auto text-slate-900 font-serif leading-relaxed print:p-0 print:border-none print:shadow-none">
            {/* Kop Surat Sekolah */}
            <div className="text-center border-b-4 border-double border-slate-900 pb-4 mb-6">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider font-sans text-slate-900">
                {settings.schoolName || 'SMP NEGERI 1 INDONESIA'}
              </h2>
              <p className="text-xs font-sans text-slate-700 mt-1">
                {settings.schoolAddress || 'Alamat Sekolah Terpadu, Jl. Pendidikan No. 01'} - {settings.city || 'Kota'}
              </p>
              <h1 className="text-base md:text-lg font-black uppercase tracking-widest mt-3 underline font-sans text-rose-900">
                BUKU PIKET HARIAN
              </h1>
            </div>

            {/* Header Informasi Hari, Tanggal, Jam Dimulai & Guru Piket */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-6 pb-4 border-b border-slate-300">
              <div className="space-y-1">
                <div>
                  <span className="font-bold inline-block w-36">Hari / Tanggal</span>: {formData.dayName}, {formData.date}
                </div>
                <div>
                  <span className="font-bold inline-block w-36">Pelajaran Dimulai</span>: {formData.lessonStartTime || '07:15 WITA'}
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="font-bold inline-block w-32 align-top">Petugas Guru Piket</span>:
                  <span className="inline-block">
                    {formData.piketTeacherNames.length > 0
                      ? formData.piketTeacherNames.filter(Boolean).map((n, i) => `${i + 1}. ${n}`).join(', ')
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="font-bold inline-block w-32 align-top">NIP Guru Piket</span>:
                  <span className="inline-block">
                    {formData.piketTeacherNips && formData.piketTeacherNips.length > 0
                      ? formData.piketTeacherNips.filter(Boolean).join(' / ')
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* A. ABSEN GURU */}
            <div className="mb-6">
              <h3 className="text-sm font-black font-sans uppercase tracking-wide mb-2 text-slate-900">
                A. ABSEN GURU
              </h3>
              <table className="w-full border-collapse border border-slate-800 text-[11px] font-sans">
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="border border-slate-800 px-2 py-1.5 w-8 text-center">No</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-left">Nama Guru</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-left w-32">NIP</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-left w-28">Mata Pelajaran</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-center w-24">Status</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-center w-20">Jam Ke-</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-left w-36">Guru Pengganti / Tugas</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.teacherAttendances.map((tch, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-800 px-2 py-1 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-800 px-2 py-1 font-semibold">{tch.teacherName}</td>
                      <td className="border border-slate-800 px-2 py-1">{tch.nip || '-'}</td>
                      <td className="border border-slate-800 px-2 py-1">{tch.subject || '-'}</td>
                      <td className="border border-slate-800 px-2 py-1 text-center font-bold">{tch.status}</td>
                      <td className="border border-slate-800 px-2 py-1 text-center">{tch.timeSlot || '-'}</td>
                      <td className="border border-slate-800 px-2 py-1">{tch.substituteTeacher || '-'}</td>
                      <td className="border border-slate-800 px-2 py-1">{tch.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* B. ABSEN SISWA (KELAS VII A s/d IX E) */}
            <div className="mb-6">
              <h3 className="text-sm font-black font-sans uppercase tracking-wide mb-2 text-slate-900">
                B. ABSEN SISWA (KELAS VII A s/d IX E)
              </h3>
              <table className="w-full border-collapse border border-slate-800 text-[11px] font-sans">
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="border border-slate-800 px-2 py-1.5 w-8 text-center">No</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-left w-24">Kelas</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-center w-16">Jml</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-center w-14">Hadir</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-center w-14">Sakit</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-center w-14">Izin</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-center w-14">Alpa</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-center w-14">Dispen</th>
                    <th className="border border-slate-800 px-2 py-1.5 text-left">Nama Siswa Yang Tidak Hadir & Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.classAttendances.map((cls, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-800 px-2 py-1 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-800 px-2 py-1 font-bold">{cls.className}</td>
                      <td className="border border-slate-800 px-2 py-1 text-center font-semibold">{cls.totalStudents}</td>
                      <td className="border border-slate-800 px-2 py-1 text-center font-bold">{cls.hadir}</td>
                      <td className="border border-slate-800 px-2 py-1 text-center">{cls.sakit}</td>
                      <td className="border border-slate-800 px-2 py-1 text-center">{cls.izin}</td>
                      <td className="border border-slate-800 px-2 py-1 text-center">{cls.alpa}</td>
                      <td className="border border-slate-800 px-2 py-1 text-center">{cls.dispen || 0}</td>
                      <td className="border border-slate-800 px-2 py-1">{cls.absentStudentNames || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold">
                  <tr>
                    <td colSpan={2} className="border border-slate-800 px-2 py-1.5 text-center">
                      JUMLAH REKAP
                    </td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">{calculatedRekap.totalStudents}</td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">{calculatedRekap.totalHadir}</td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">{calculatedRekap.totalSakit}</td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">{calculatedRekap.totalIzin}</td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">{calculatedRekap.totalAlpa}</td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">{calculatedRekap.totalDispen}</td>
                    <td className="border border-slate-800 px-2 py-1.5 text-left text-[10px]">
                      Tingkat Kehadiran: {calculatedRekap.studentPercentage}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* KEJADIAN PENTING & SISWA MENDAHULUI PULANG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs font-sans">
              <div className="border border-slate-800 p-3 rounded-lg">
                <div className="font-bold uppercase tracking-wider mb-2 border-b border-slate-300 pb-1">
                  Siswa Yang Mendahului Pulang
                </div>
                {formData.earlyLeaves.length === 0 ? (
                  <p className="italic text-slate-500 text-[11px]">- Nihil -</p>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    {formData.earlyLeaves.map((el, i) => (
                      <li key={i}>
                        <span className="font-bold">{el.studentName}</span> ({el.className}) - Pkl {el.timeOut} : {el.reason} [Penjemput: {el.pickedUpBy || 'Wali'}]
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="border border-slate-800 p-3 rounded-lg">
                <div className="font-bold uppercase tracking-wider mb-2 border-b border-slate-300 pb-1">
                  Kejadian Penting / Catatan Piket
                </div>
                <p className="text-[11px] whitespace-pre-line leading-relaxed">
                  {formData.importantEvents || 'KBM terlaksana dengan aman, tertib, dan lancar.'}
                </p>
              </div>
            </div>

            {/* TANDA TANGAN & PENGESAHAN:
                BAWAH KIRI: MENGETAHUI KEPALA SEKOLAH
                BAWAH KANAN: PETUGAS GURU PIKET (3 ORANG)
            */}
            <div className="grid grid-cols-2 gap-8 text-xs font-sans pt-4 mt-6">
              {/* Bawah Kiri: Mengetahui Kepala Sekolah */}
              <div className="text-center flex flex-col justify-between h-full pt-6">
                <div>
                  <p className="font-semibold">&nbsp;</p>
                  <p className="font-bold uppercase mt-1">Mengetahui,</p>
                  <p className="font-bold uppercase">Kepala Sekolah</p>
                </div>
                <div className="pt-20">
                  <p className="font-bold underline text-sm">
                    {settings.principalName || formData.principalName || 'Dr. H. Ahmad Wijaya, M.Pd.'}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    NIP: {settings.principalNip || formData.principalNip || '19750812 199903 1 002'}
                  </p>
                </div>
              </div>

              {/* Bawah Kanan: Petugas Guru Piket (3 Orang) */}
              <div className="text-left space-y-2">
                <div>
                  <p className="font-semibold">{settings.city || 'Kota'}, {formData.date}</p>
                  <p className="font-bold uppercase mt-0.5">Petugas Guru Piket:</p>
                </div>

                <div className="space-y-3 pt-1">
                  {[0, 1, 2].map((idx) => {
                    const name = formData.piketTeacherNames?.[idx];
                    const nip = formData.piketTeacherNips?.[idx];
                    return (
                      <div key={idx} className="flex items-end justify-between border-b border-dotted border-slate-400 pb-1 text-[11px]">
                        <div>
                          <p className="font-bold">
                            {idx + 1}. {name || '...................................................'}
                          </p>
                          <p className="text-[10px] text-slate-600">
                            NIP: {nip || '...................................................'}
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono pr-2 pb-1">
                          ({idx + 1}. .....................)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
