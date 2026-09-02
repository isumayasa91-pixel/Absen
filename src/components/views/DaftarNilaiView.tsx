import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentGradeRecord } from '../../types';
import * as XLSX from 'xlsx';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  HelpCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Upload,
  UserCheck,
  Users,
  AlertCircle,
  TrendingUp,
  Settings2,
  Sliders,
  Sparkles,
  FileDown,
  X,
  FileCheck,
} from 'lucide-react';

export const commonSubjects = [
  'Pendidikan Agama',
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika',
  'IPA',
  'IPS',
  'PJOK',
  'Seni Budaya',
  'Bahasa Bali',
  'Informatika',
];

interface GradeWeights {
  tugas: number; // percentage, e.g., 20
  ph: number;    // percentage, e.g., 30
  pts: number;   // percentage, e.g., 25
  pas: number;   // percentage, e.g., 25
}

export const DaftarNilaiView: React.FC = () => {
  const {
    students,
    teachers,
    classes,
    academicYears,
    grades,
    saveGradeRecord,
    saveGradesBatch,
    showNotice,
    currentUser,
  } = useApp();

  const isStudent = currentUser?.role === 'siswa';

  // State selection
  const activeAY = academicYears.find((y) => y.isActive)?.yearName || '2026/2027';
  const classList = useMemo(() => {
    if (classes.length > 0) return classes.map((c) => c.className);
    const uniqueFromStudents = Array.from(new Set(students.map((s) => s.currentClass)));
    return uniqueFromStudents.length > 0 ? uniqueFromStudents : ['X IPA 1', 'X IPA 2', 'XI IPS 1'];
  }, [classes, students]);

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (isStudent) {
      const matchStd = students.find(
        (s) => s.nisn === currentUser.username || s.fullName.toLowerCase() === currentUser.name.toLowerCase()
      );
      if (matchStd) return matchStd.currentClass;
    }
    return classList[0] || 'X IPA 1';
  });

  const [selectedSubject, setSelectedSubject] = useState<string>(commonSubjects[4] || 'Matematika'); // Default Matematika
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Grade weights state (percentage, total = 100)
  const [weights, setWeights] = useState<GradeWeights>({
    tugas: 20,
    ph: 30,
    pts: 25,
    pas: 25,
  });

  // Local draft state for grade input table matrix
  // key format: studentId -> StudentGradeRecord
  const [draftGrades, setDraftGrades] = useState<{ [studentId: string]: Partial<StudentGradeRecord> }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync default teacher when subject changes
  useEffect(() => {
    if (teachers.length > 0) {
      const matchTeacher = teachers.find(
        (t) => t.subjectSpecialty && t.subjectSpecialty.toLowerCase().includes(selectedSubject.toLowerCase())
      );
      if (matchTeacher) {
        setSelectedTeacher(matchTeacher.fullNameWithTitle);
      } else if (!selectedTeacher) {
        setSelectedTeacher(teachers[0].fullNameWithTitle);
      }
    }
  }, [selectedSubject, teachers]);

  // Filter students for the selected class
  const classStudents = useMemo(() => {
    let list = students.filter((s) => s.currentClass.toLowerCase().trim() === selectedClass.toLowerCase().trim());
    if (isStudent) {
      list = list.filter(
        (s) => s.nisn === currentUser.username || s.fullName.toLowerCase() === currentUser.name.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.fullName.toLowerCase().includes(q) || s.nisn.includes(q));
    }
    return list;
  }, [students, selectedClass, isStudent, currentUser, searchQuery]);

  // Load database grades into local draft whenever selectedClass, selectedSubject, or grades update
  useEffect(() => {
    const newDraft: { [studentId: string]: Partial<StudentGradeRecord> } = {};
    classStudents.forEach((std) => {
      const existing = grades.find(
        (g) =>
          g.studentId === std.id &&
          g.subject.toLowerCase().trim() === selectedSubject.toLowerCase().trim()
      );

      if (existing) {
        newDraft[std.id] = { ...existing };
      } else {
        newDraft[std.id] = {
          id: `grd-${std.id}-${selectedSubject.toLowerCase().replace(/\s+/g, '-')}`,
          studentId: std.id,
          studentName: std.fullName,
          nisn: std.nisn,
          currentClass: std.currentClass,
          subject: selectedSubject,
          teacherName: selectedTeacher || 'Guru Pengampu',
          tugas1: null,
          tugas2: null,
          tugas3: null,
          tugas4: null,
          tugas5: null,
          ph1: null,
          ph2: null,
          ph3: null,
          ph4: null,
          ph5: null,
          pts: null,
          pas: null,
        };
      }
    });
    setDraftGrades(newDraft);
  }, [selectedClass, selectedSubject, grades, classStudents]);

  // Helper calculation function
  const calculateAccumulated = (rec: Partial<StudentGradeRecord>) => {
    const tList = [rec.tugas1, rec.tugas2, rec.tugas3, rec.tugas4, rec.tugas5].filter(
      (v): v is number => v !== null && v !== undefined && typeof v === 'number' && !isNaN(v)
    );
    const avgT = tList.length > 0 ? tList.reduce((a, b) => Number(a) + Number(b), 0) / tList.length : 0;

    const phList = [rec.ph1, rec.ph2, rec.ph3, rec.ph4, rec.ph5].filter(
      (v): v is number => v !== null && v !== undefined && typeof v === 'number' && !isNaN(v)
    );
    const avgPH = phList.length > 0 ? phList.reduce((a, b) => Number(a) + Number(b), 0) / phList.length : 0;

    const ptsVal = rec.pts !== null && rec.pts !== undefined && !isNaN(rec.pts) ? Number(rec.pts) : 0;
    const pasVal = rec.pas !== null && rec.pas !== undefined && !isNaN(rec.pas) ? Number(rec.pas) : 0;

    const hasAnyInput = tList.length > 0 || phList.length > 0 || rec.pts !== null || rec.pas !== null;

    const wTugas = weights.tugas / 100;
    const wPH = weights.ph / 100;
    const wPTS = weights.pts / 100;
    const wPAS = weights.pas / 100;

    const finalRaw = avgT * wTugas + avgPH * wPH + ptsVal * wPTS + pasVal * wPAS;
    const finalScore = Math.round(finalRaw * 10) / 10;

    let predicate = 'D';
    if (finalScore >= 90) predicate = 'A';
    else if (finalScore >= 80) predicate = 'B';
    else if (finalScore >= 70) predicate = 'C';
    else predicate = 'D';

    const statusPassing: 'Lulus' | 'Remidial' = finalScore >= 70 ? 'Lulus' : 'Remidial';

    return {
      avgTugas: Math.round(avgT * 10) / 10,
      avgPH: Math.round(avgPH * 10) / 10,
      ptsVal,
      pasVal,
      finalScore,
      predicate,
      statusPassing,
      hasAnyInput,
    };
  };

  // Change individual input cell
  const handleInputChange = (
    studentId: string,
    field: keyof StudentGradeRecord,
    val: string
  ) => {
    const numVal = val === '' ? null : Math.min(100, Math.max(0, Number(val)));

    setDraftGrades((prev) => {
      const currentRec = prev[studentId] || {};
      const updatedRec = {
        ...currentRec,
        teacherName: selectedTeacher || currentRec.teacherName || 'Guru Mapel',
        [field]: numVal,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // Recalculate
      const calc = calculateAccumulated(updatedRec);
      updatedRec.avgTugas = calc.avgTugas;
      updatedRec.avgPH = calc.avgPH;
      updatedRec.finalScore = calc.finalScore;
      updatedRec.predicate = calc.predicate;
      updatedRec.statusPassing = calc.statusPassing;

      return {
        ...prev,
        [studentId]: updatedRec,
      };
    });
  };

  // Save all current class grades to AppContext / Firestore
  const handleSaveAll = () => {
    const recordsToSave: StudentGradeRecord[] = [];

    (Object.entries(draftGrades) as [string, Partial<StudentGradeRecord>][]).forEach(([stdId, draft]) => {
      const calc = calculateAccumulated(draft);
      const record: StudentGradeRecord = {
        id: draft.id || `grd-${stdId}-${selectedSubject.toLowerCase().replace(/\s+/g, '-')}`,
        studentId: stdId,
        studentName: draft.studentName || '',
        nisn: draft.nisn || '',
        currentClass: selectedClass,
        subject: selectedSubject,
        teacherName: selectedTeacher || 'Guru Mapel',
        tugas1: draft.tugas1 ?? null,
        tugas2: draft.tugas2 ?? null,
        tugas3: draft.tugas3 ?? null,
        tugas4: draft.tugas4 ?? null,
        tugas5: draft.tugas5 ?? null,
        ph1: draft.ph1 ?? null,
        ph2: draft.ph2 ?? null,
        ph3: draft.ph3 ?? null,
        ph4: draft.ph4 ?? null,
        ph5: draft.ph5 ?? null,
        pts: draft.pts ?? null,
        pas: draft.pas ?? null,
        avgTugas: calc.avgTugas,
        avgPH: calc.avgPH,
        finalScore: calc.finalScore,
        predicate: calc.predicate,
        statusPassing: calc.statusPassing,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      recordsToSave.push(record);
    });

    if (recordsToSave.length > 0) {
      saveGradesBatch(recordsToSave);
      showNotice(`✓ Berhasil menyimpan data nilai ${selectedSubject} Kelas ${selectedClass}!`);
    }
  };

  // Class statistics summary
  const classStats = useMemo(() => {
    let totalScoreSum = 0;
    let studentWithGradesCount = 0;
    let countLulus = 0;
    let countRemidial = 0;

    classStudents.forEach((std) => {
      const draft = draftGrades[std.id];
      if (draft) {
        const calc = calculateAccumulated(draft);
        if (calc.hasAnyInput) {
          totalScoreSum += calc.finalScore;
          studentWithGradesCount++;
          if (calc.statusPassing === 'Lulus') countLulus++;
          else countRemidial++;
        }
      }
    });

    const classAvg = studentWithGradesCount > 0 ? Math.round((totalScoreSum / studentWithGradesCount) * 10) / 10 : 0;

    return {
      totalStudents: classStudents.length,
      studentWithGradesCount,
      classAvg,
      countLulus,
      countRemidial,
    };
  }, [classStudents, draftGrades, weights]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = classStudents.map((std, idx) => {
      const draft = draftGrades[std.id] || {};
      const calc = calculateAccumulated(draft);

      return {
        'No': idx + 1,
        'NISN': std.nisn,
        'Nama Siswa': std.fullName,
        'Kelas': std.currentClass,
        'Mata Pelajaran': selectedSubject,
        'Guru Pengampu': selectedTeacher || '-',
        'Tugas 1': draft.tugas1 ?? '',
        'Tugas 2': draft.tugas2 ?? '',
        'Tugas 3': draft.tugas3 ?? '',
        'Tugas 4': draft.tugas4 ?? '',
        'Tugas 5': draft.tugas5 ?? '',
        'Rata-rata Tugas': calc.avgTugas,
        'PH 1': draft.ph1 ?? '',
        'PH 2': draft.ph2 ?? '',
        'PH 3': draft.ph3 ?? '',
        'PH 4': draft.ph4 ?? '',
        'PH 5': draft.ph5 ?? '',
        'Rata-rata PH': calc.avgPH,
        'Nilai PTS': draft.pts ?? '',
        'Nilai PAS': draft.pas ?? '',
        'Nilai Akhir (Akumulasi)': calc.finalScore,
        'Predikat': calc.predicate,
        'Keterangan': calc.statusPassing,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto width sizing
    const colWidths = [
      { wch: 5 },  // No
      { wch: 14 }, // NISN
      { wch: 26 }, // Nama Siswa
      { wch: 12 }, // Kelas
      { wch: 22 }, // Mapel
      { wch: 25 }, // Guru
      { wch: 9 }, { wch: 9 }, { wch: 9 }, { wch: 9 }, { wch: 9 }, // T1-T5
      { wch: 15 }, // Rata Tugas
      { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, // PH1-PH5
      { wch: 14 }, // Rata PH
      { wch: 10 }, // PTS
      { wch: 10 }, // PAS
      { wch: 22 }, // Nilai Akhir
      { wch: 10 }, // Predikat
      { wch: 14 }, // Keterangan
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Nilai_${selectedClass}`);
    XLSX.writeFile(workbook, `Daftar_Nilai_${selectedClass}_${selectedSubject.replace(/\s+/g, '_')}.xlsx`);

    showNotice(`✓ Berhasil mengunduh Excel Daftar Nilai ${selectedSubject} Kelas ${selectedClass}!`);
  };

  // Download Blank Template
  const handleDownloadTemplate = () => {
    const templateData = classStudents.map((std, idx) => ({
      'No': idx + 1,
      'NISN': std.nisn,
      'Nama Siswa': std.fullName,
      'Kelas': std.currentClass,
      'Tugas 1': '',
      'Tugas 2': '',
      'Tugas 3': '',
      'Tugas 4': '',
      'Tugas 5': '',
      'PH 1': '',
      'PH 2': '',
      'PH 3': '',
      'PH 4': '',
      'PH 5': '',
      'Nilai PTS': '',
      'Nilai PAS': '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Nilai');
    XLSX.writeFile(workbook, `Template_Nilai_${selectedClass}_${selectedSubject.replace(/\s+/g, '_')}.xlsx`);

    showNotice(`✓ Format Template Excel ${selectedClass} berhasil diunduh!`);
  };

  // Handle Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.');
          return;
        }

        let updatedCount = 0;
        const newDrafts = { ...draftGrades };

        json.forEach((row) => {
          // Identify student by NISN or Nama Siswa
          const rowNisn = row['NISN'] ? String(row['NISN']).trim() : '';
          const rowName = row['Nama Siswa'] ? String(row['Nama Siswa']).trim().toLowerCase() : '';

          const std = classStudents.find(
            (s) => (rowNisn && s.nisn === rowNisn) || (rowName && s.fullName.toLowerCase() === rowName)
          );

          if (std) {
            const parseVal = (key: string) => {
              const val = row[key];
              if (val === undefined || val === null || val === '') return null;
              const n = Number(val);
              return isNaN(n) ? null : Math.min(100, Math.max(0, n));
            };

            const t1 = parseVal('Tugas 1');
            const t2 = parseVal('Tugas 2');
            const t3 = parseVal('Tugas 3');
            const t4 = parseVal('Tugas 4');
            const t5 = parseVal('Tugas 5');

            const ph1 = parseVal('PH 1');
            const ph2 = parseVal('PH 2');
            const ph3 = parseVal('PH 3');
            const ph4 = parseVal('PH 4');
            const ph5 = parseVal('PH 5');

            const pts = parseVal('Nilai PTS');
            const pas = parseVal('Nilai PAS');

            const existing = newDrafts[std.id] || {};
            const updatedRec: Partial<StudentGradeRecord> = {
              ...existing,
              id: existing.id || `grd-${std.id}-${selectedSubject.toLowerCase().replace(/\s+/g, '-')}`,
              studentId: std.id,
              studentName: std.fullName,
              nisn: std.nisn,
              currentClass: std.currentClass,
              subject: selectedSubject,
              teacherName: selectedTeacher || 'Guru Mapel',
              tugas1: t1 !== null ? t1 : existing.tugas1,
              tugas2: t2 !== null ? t2 : existing.tugas2,
              tugas3: t3 !== null ? t3 : existing.tugas3,
              tugas4: t4 !== null ? t4 : existing.tugas4,
              tugas5: t5 !== null ? t5 : existing.tugas5,
              ph1: ph1 !== null ? ph1 : existing.ph1,
              ph2: ph2 !== null ? ph2 : existing.ph2,
              ph3: ph3 !== null ? ph3 : existing.ph3,
              ph4: ph4 !== null ? ph4 : existing.ph4,
              ph5: ph5 !== null ? ph5 : existing.ph5,
              pts: pts !== null ? pts : existing.pts,
              pas: pas !== null ? pas : existing.pas,
              updatedAt: new Date().toISOString().split('T')[0],
            };

            const calc = calculateAccumulated(updatedRec);
            updatedRec.avgTugas = calc.avgTugas;
            updatedRec.avgPH = calc.avgPH;
            updatedRec.finalScore = calc.finalScore;
            updatedRec.predicate = calc.predicate;
            updatedRec.statusPassing = calc.statusPassing;

            newDrafts[std.id] = updatedRec;
            updatedCount++;
          }
        });

        setDraftGrades(newDrafts);
        setShowUploadModal(false);
        showNotice(`✓ Berhasil mengimpor nilai untuk ${updatedCount} siswa dari Excel! Silakan klik "Simpan Semua Nilai".`);
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file Excel. Pastikan format kolom sesuai template.');
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black tracking-wide uppercase">
              <Award className="w-3.5 h-3.5 text-amber-200" />
              <span>Modul Akademik & Penilaian</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {isStudent ? 'Transkrip Nilai Siswa' : 'Daftar & Rekapitulasi Nilai'}
            </h1>
            <p className="text-amber-100 text-xs md:text-sm font-medium max-w-2xl">
              Sinkronisasi nama siswa otomatis, penilaan Tugas (1-5), PH (1-5), PTS, dan PAS dengan kalkulasi akumulasi nilai akhir instant.
            </p>
          </div>

          {!isStudent && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowWeightModal(true)}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur-md text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <Sliders className="w-4 h-4 text-amber-200" />
                <span>Bobot ({weights.tugas}% T, {weights.ph}% PH, {weights.pts}% PTS, {weights.pas}% PAS)</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-amber-200"
              >
                <Save className="w-4 h-4 text-amber-600" />
                <span>Simpan Semua Nilai</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Total Siswa</span>
            <span className="text-xl font-black text-slate-800">{classStats.totalStudents} Siswa</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Rata-rata Kelas</span>
            <span className="text-xl font-black text-indigo-700">{classStats.classAvg || '-'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Tuntas (Lulus)</span>
            <span className="text-xl font-black text-emerald-700">{classStats.countLulus} Siswa</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Perlu Bimbingan</span>
            <span className="text-xl font-black text-rose-600">{classStats.countRemidial} Siswa</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Filters, Mapel, Guru & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pilih Kelas */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Pilih Kelas</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isStudent}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {classList.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Mata Pelajaran (11 Mapel) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Mata Pelajaran (11 Mapel)</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-amber-200 text-xs font-black text-amber-900 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {commonSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Guru Mapel */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Nama Guru Mapel</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                placeholder="Guru Mapel Pengampu"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {teachers.length > 0 && (
                <select
                  className="absolute right-1 top-1 bottom-1 w-6 opacity-0 cursor-pointer"
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  title="Pilih dari daftar guru"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.fullNameWithTitle}>
                      {t.fullNameWithTitle}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Cari Siswa */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Cari Nama / NISN</span>
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Action Buttons: Excel Upload & Download */}
        {!isStudent && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Nilai Excel</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Nilai Excel</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-slate-500" />
                <span>Download Template Excel</span>
              </button>
            </div>

            <div className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tahun Ajaran: <strong className="text-slate-800">{activeAY}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grade Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>Matriks Nilai {selectedSubject} — Kelas {selectedClass}</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-600">
              Guru Pengampu: <strong className="text-slate-700">{selectedTeacher || 'Belum Ditentukan'}</strong>
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full w-fit">
            Bobot: Tugas ({weights.tugas}%), PH ({weights.ph}%), PTS ({weights.pts}%), PAS ({weights.pas}%)
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse min-w-[1250px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="p-3 text-center w-12 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">No</th>
                <th className="p-3 w-48 sticky left-12 bg-slate-100 z-10 border-r border-slate-200">Nama Siswa & NISN</th>
                
                {/* Nilai Tugas 1-5 */}
                <th colSpan={5} className="p-2 text-center bg-amber-100/60 text-amber-900 border-r border-amber-200">
                  Nilai Tugas (1 s/d 5)
                </th>
                <th className="p-3 text-center bg-amber-200/70 text-amber-950 border-r border-amber-300 w-16">
                  Rata Tugas
                </th>

                {/* Nilai PH 1-5 */}
                <th colSpan={5} className="p-2 text-center bg-blue-100/60 text-blue-900 border-r border-blue-200">
                  Nilai PH (1 s/d 5)
                </th>
                <th className="p-3 text-center bg-blue-200/70 text-blue-950 border-r border-blue-300 w-16">
                  Rata PH
                </th>

                {/* PTS & PAS */}
                <th className="p-3 text-center bg-purple-100/70 text-purple-900 border-r border-purple-200 w-16">
                  PTS
                </th>
                <th className="p-3 text-center bg-indigo-100/70 text-indigo-900 border-r border-indigo-200 w-16">
                  PAS
                </th>

                {/* Final Score Akumulasi */}
                <th className="p-3 text-center bg-emerald-100/80 text-emerald-950 font-black border-r border-emerald-300 w-24">
                  Nilai Akhir
                </th>
                <th className="p-3 text-center w-16 border-r border-slate-200">Predikat</th>
                <th className="p-3 text-center w-24">Status</th>
              </tr>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-600 border-b border-slate-200 text-center">
                <th className="p-1 sticky left-0 bg-slate-50 border-r border-slate-200"></th>
                <th className="p-1 sticky left-12 bg-slate-50 border-r border-slate-200 text-left px-3">Sub-Komponen</th>
                
                {/* T1-T5 subheaders */}
                <th className="p-1 bg-amber-50 text-amber-900 w-12">T1</th>
                <th className="p-1 bg-amber-50 text-amber-900 w-12">T2</th>
                <th className="p-1 bg-amber-50 text-amber-900 w-12">T3</th>
                <th className="p-1 bg-amber-50 text-amber-900 w-12">T4</th>
                <th className="p-1 bg-amber-50 text-amber-900 w-12 border-r border-amber-200">T5</th>
                <th className="p-1 bg-amber-100/50 text-amber-900 border-r border-amber-300">({weights.tugas}%)</th>

                {/* PH1-PH5 subheaders */}
                <th className="p-1 bg-blue-50 text-blue-900 w-12">PH1</th>
                <th className="p-1 bg-blue-50 text-blue-900 w-12">PH2</th>
                <th className="p-1 bg-blue-50 text-blue-900 w-12">PH3</th>
                <th className="p-1 bg-blue-50 text-blue-900 w-12">PH4</th>
                <th className="p-1 bg-blue-50 text-blue-900 w-12 border-r border-blue-200">PH5</th>
                <th className="p-1 bg-blue-100/50 text-blue-900 border-r border-blue-300">({weights.ph}%)</th>

                {/* PTS & PAS subheaders */}
                <th className="p-1 bg-purple-50 text-purple-900 border-r border-purple-200">({weights.pts}%)</th>
                <th className="p-1 bg-indigo-50 text-indigo-900 border-r border-indigo-200">({weights.pas}%)</th>
                <th className="p-1 bg-emerald-100/60 text-emerald-900 border-r border-emerald-300">Akumulasi</th>
                <th className="p-1 border-r border-slate-200">Skala</th>
                <th className="p-1">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={19} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm">Tidak ada siswa ditemukan di Kelas {selectedClass}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Silakan pilih kelas lain atau tambahkan data siswa di menu Data Siswa.
                    </p>
                  </td>
                </tr>
              ) : (
                classStudents.map((std, idx) => {
                  const draft = draftGrades[std.id] || {};
                  const calc = calculateAccumulated(draft);

                  return (
                    <tr key={std.id} className="hover:bg-amber-50/40 transition-colors">
                      {/* No */}
                      <td className="p-2.5 text-center font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-amber-50/40 border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* Nama Siswa & NISN */}
                      <td className="p-2.5 sticky left-12 bg-white group-hover:bg-amber-50/40 border-r border-slate-200">
                        <div className="font-extrabold text-slate-900 truncate max-w-[170px]" title={std.fullName}>
                          {std.fullName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                          <span className="font-mono">{std.nisn}</span>
                          <span className={`px-1 rounded text-[9px] font-bold ${std.gender === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                            {std.gender}
                          </span>
                        </div>
                      </td>

                      {/* Tugas 1 s/d 5 Inputs */}
                      {(['tugas1', 'tugas2', 'tugas3', 'tugas4', 'tugas5'] as const).map((key, i) => (
                        <td key={key} className={`p-1 text-center ${i === 4 ? 'border-r border-amber-200' : ''}`}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={isStudent}
                            value={draft[key] !== null && draft[key] !== undefined ? draft[key] : ''}
                            onChange={(e) => handleInputChange(std.id, key, e.target.value)}
                            placeholder="-"
                            className="w-10 h-8 text-center text-xs font-bold rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white disabled:bg-slate-50 text-amber-950"
                          />
                        </td>
                      ))}

                      {/* Rata Tugas */}
                      <td className="p-2.5 text-center font-extrabold text-amber-900 bg-amber-50/60 border-r border-amber-300">
                        {calc.avgTugas || '-'}
                      </td>

                      {/* PH 1 s/d 5 Inputs */}
                      {(['ph1', 'ph2', 'ph3', 'ph4', 'ph5'] as const).map((key, i) => (
                        <td key={key} className={`p-1 text-center ${i === 4 ? 'border-r border-blue-200' : ''}`}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={isStudent}
                            value={draft[key] !== null && draft[key] !== undefined ? draft[key] : ''}
                            onChange={(e) => handleInputChange(std.id, key, e.target.value)}
                            placeholder="-"
                            className="w-10 h-8 text-center text-xs font-bold rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50 text-blue-950"
                          />
                        </td>
                      ))}

                      {/* Rata PH */}
                      <td className="p-2.5 text-center font-extrabold text-blue-900 bg-blue-50/60 border-r border-blue-300">
                        {calc.avgPH || '-'}
                      </td>

                      {/* PTS */}
                      <td className="p-1 text-center border-r border-purple-200">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isStudent}
                          value={draft.pts !== null && draft.pts !== undefined ? draft.pts : ''}
                          onChange={(e) => handleInputChange(std.id, 'pts', e.target.value)}
                          placeholder="-"
                          className="w-12 h-8 text-center text-xs font-bold rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white disabled:bg-slate-50 text-purple-950"
                        />
                      </td>

                      {/* PAS */}
                      <td className="p-1 text-center border-r border-indigo-200">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isStudent}
                          value={draft.pas !== null && draft.pas !== undefined ? draft.pas : ''}
                          onChange={(e) => handleInputChange(std.id, 'pas', e.target.value)}
                          placeholder="-"
                          className="w-12 h-8 text-center text-xs font-bold rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:bg-slate-50 text-indigo-950"
                        />
                      </td>

                      {/* Nilai Akhir (Akumulasi Live) */}
                      <td className="p-2.5 text-center font-black text-sm bg-emerald-50 text-emerald-950 border-r border-emerald-300">
                        {calc.hasAnyInput ? calc.finalScore : '-'}
                      </td>

                      {/* Predikat */}
                      <td className="p-2.5 text-center font-black border-r border-slate-200">
                        {calc.hasAnyInput ? (
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-black ${
                              calc.predicate === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : calc.predicate === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : calc.predicate === 'C'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {calc.predicate}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Status Lulus / Remidial */}
                      <td className="p-2.5 text-center">
                        {calc.hasAnyInput ? (
                          calc.statusPassing === 'Lulus' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Lulus</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-bold">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Remidial</span>
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Save Button */}
        {!isStudent && classStudents.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Rumus Akumulasi: <strong>({weights.tugas}% Rata Tugas) + ({weights.ph}% Rata PH) + ({weights.pts}% PTS) + ({weights.pas}% PAS)</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Semua Nilai ({classStudents.length} Siswa)</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Weight Settings */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900">Pengaturan Bobot Penilaian</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-medium text-slate-600">
              Tentukan persentase bobot masing-masing komponen. Total persentase harus berjumlah <strong>100%</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bobot Rata-rata Tugas (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.tugas}
                  onChange={(e) => setWeights({ ...weights, tugas: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bobot Rata-rata Penilaian Harian (PH) (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.ph}
                  onChange={(e) => setWeights({ ...weights, ph: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bobot PTS (Penilaian Tengah Semester) (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.pts}
                  onChange={(e) => setWeights({ ...weights, pts: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bobot PAS (Penilaian Akhir Semester) (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.pas}
                  onChange={(e) => setWeights({ ...weights, pas: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold flex justify-between items-center text-amber-900">
              <span>Total Persentase:</span>
              <span className={weights.tugas + weights.ph + weights.pts + weights.pas === 100 ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
                {weights.tugas + weights.ph + weights.pts + weights.pas}% {weights.tugas + weights.ph + weights.pts + weights.pas === 100 ? '✓ Pas' : '(Harus 100%)'}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  if (weights.tugas + weights.ph + weights.pts + weights.pas !== 100) {
                    alert('Total bobot harus tepat 100%. Silakan sesuaikan kembali.');
                    return;
                  }
                  setShowWeightModal(false);
                  showNotice('✓ Bobot penilaian berhasil diperbarui!');
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md"
              >
                Simpan Bobot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Nilai Excel */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Upload Data Nilai dari Excel</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Unggah berkas Excel (<code>.xlsx</code> / <code>.csv</code>) yang berisi data nilai siswa untuk <strong>{selectedSubject}</strong> Kelas <strong>{selectedClass}</strong>.
              </p>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium space-y-1.5">
                <span className="font-extrabold block text-emerald-950 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Petunjuk Pengisian File Excel:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Sistem mencocokkan siswa berdasarkan kolom <strong>NISN</strong> atau <strong>Nama Siswa</strong>.</li>
                  <li>Kolom nilai yang didukung: <code>Tugas 1</code> s/d <code>Tugas 5</code>, <code>PH 1</code> s/d <code>PH 5</code>, <code>Nilai PTS</code>, <code>Nilai PAS</code>.</li>
                  <li>Anda dapat mendownload format template resmi di bawah ini terlebih dahulu.</li>
                </ul>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">
                  Pilih Berkas Excel (.xlsx / .csv)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer border border-slate-200 rounded-2xl p-1 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4 text-slate-500" />
                <span>Unduh Template Format</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
