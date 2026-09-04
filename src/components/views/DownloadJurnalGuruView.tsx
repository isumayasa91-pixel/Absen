import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherJournal } from '../../types';
import * as XLSX from 'xlsx';
import {
  BookOpenCheck,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Search,
  School,
  User,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileDown,
  Layers,
  ArrowRight,
  Eye,
  X,
  Share2,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

export const DownloadJurnalGuruView: React.FC = () => {
  const {
    teacherJournals,
    teachers,
    classes,
    settings,
    academicYears,
    currentUser,
    showNotice,
    setActiveTab,
  } = useApp();

  // Active Academic Year
  const activeAY = academicYears.find((y) => y.isActive)?.yearName || '2026/2027';

  // Filter States
  const [selectedTeacher, setSelectedTeacher] = useState<string>(() => {
    if (currentUser?.role === 'guru') {
      const match = teachers.find(
        (t) => t.fullNameWithTitle.toLowerCase() === currentUser.name.toLowerCase() || t.id === currentUser.id
      );
      return match ? match.fullNameWithTitle : 'Semua Guru';
    }
    return 'Semua Guru';
  });

  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua Mata Pelajaran');
  const [datePreset, setDatePreset] = useState<'semua' | 'hari-ini' | '7-hari' | 'bulan-ini' | 'kustom'>('semua');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Print Modal State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedJournalForPrint, setSelectedJournalForPrint] = useState<TeacherJournal | null>(null);
  const [printMode, setPrintMode] = useState<'all-filtered' | 'single'>('all-filtered');
  const printRef = useRef<HTMLDivElement>(null);

  // Common subjects list
  const commonSubjects = [
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

  // Helper date filtering
  const todayStr = new Date().toISOString().split('T')[0];

  const getDateBoundary = (preset: typeof datePreset) => {
    const today = new Date();
    if (preset === 'hari-ini') {
      return { start: todayStr, end: todayStr };
    }
    if (preset === '7-hari') {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      return { start: past7.toISOString().split('T')[0], end: todayStr };
    }
    if (preset === 'bulan-ini') {
      const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: startMonth.toISOString().split('T')[0], end: todayStr };
    }
    return { start: '', end: '' };
  };

  const handlePresetChange = (preset: typeof datePreset) => {
    setDatePreset(preset);
    if (preset !== 'kustom') {
      const bounds = getDateBoundary(preset);
      setStartDate(bounds.start);
      setEndDate(bounds.end);
    }
  };

  // Filtered Journals calculation
  const filteredJournals = useMemo(() => {
    return teacherJournals.filter((j) => {
      // Teacher filter
      if (selectedTeacher !== 'Semua Guru' && j.teacherName !== selectedTeacher) {
        return false;
      }
      // Class filter
      if (selectedClass !== 'Semua Kelas' && j.classTarget !== selectedClass) {
        return false;
      }
      // Subject filter
      if (selectedSubject !== 'Semua Mata Pelajaran' && j.subject !== selectedSubject) {
        return false;
      }
      // Date filter
      if (startDate && j.date < startDate) return false;
      if (endDate && j.date > endDate) return false;

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText =
          (j.topic || '').toLowerCase().includes(q) ||
          (j.teacherName || '').toLowerCase().includes(q) ||
          (j.subject || '').toLowerCase().includes(q) ||
          (j.classTarget || '').toLowerCase().includes(q) ||
          (j.notes || '').toLowerCase().includes(q) ||
          (j.absentStudents || '').toLowerCase().includes(q);
        if (!matchText) return false;
      }

      return true;
    });
  }, [teacherJournals, selectedTeacher, selectedClass, selectedSubject, startDate, endDate, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalEntries = filteredJournals.length;
    const uniqueTeachers = new Set(filteredJournals.map((j) => j.teacherName)).size;
    const uniqueClasses = new Set(filteredJournals.map((j) => j.classTarget)).size;
    const uniqueSubjects = new Set(filteredJournals.map((j) => j.subject)).size;

    return {
      totalEntries,
      uniqueTeachers,
      uniqueClasses,
      uniqueSubjects,
    };
  }, [filteredJournals]);

  // Download Excel Handler (Complete Journal Table)
  const handleDownloadExcel = () => {
    if (filteredJournals.length === 0) {
      alert('Tidak ada data jurnal yang sesuai dengan filter yang dipilih.');
      return;
    }

    const exportData = filteredJournals.map((j, idx) => {
      // Find teacher NIP if available
      const teacherObj = teachers.find(
        (t) => t.fullNameWithTitle.toLowerCase() === j.teacherName.toLowerCase()
      );

      return {
        'No': idx + 1,
        'Tanggal KBM': j.date,
        'Waktu / Jam Ke': j.timeSlot || '-',
        'Nama Guru Pengampu': j.teacherName,
        'NIP / NUPTK': teacherObj?.nip || teacherObj?.nuptk || '-',
        'Mata Pelajaran': j.subject,
        'Kelas': j.classTarget,
        'Materi / Pokok Bahasan': j.topic,
        'Siswa Tidak Hadir (Absensi)': j.absentStudents || 'Nihil (Hadir Semua)',
        'Catatan / Evaluasi Pembelajaran': j.notes || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-fit column widths
    const colWidths = [
      { wch: 6 },  // No
      { wch: 14 }, // Tanggal
      { wch: 22 }, // Waktu
      { wch: 28 }, // Nama Guru
      { wch: 20 }, // NIP
      { wch: 22 }, // Mapel
      { wch: 12 }, // Kelas
      { wch: 38 }, // Topik Materi
      { wch: 32 }, // Siswa Tidak Hadir
      { wch: 38 }, // Catatan
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    const cleanSheetName = selectedClass !== 'Semua Kelas' ? `Jurnal_${selectedClass}` : 'Jurnal_Guru';
    XLSX.utils.book_append_sheet(workbook, worksheet, cleanSheetName.slice(0, 31));

    const fileSuffix = selectedTeacher !== 'Semua Guru' ? `_${selectedTeacher.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const classSuffix = selectedClass !== 'Semua Kelas' ? `_Kelas_${selectedClass}` : '';
    const fileName = `Jurnal_Pengajaran_Guru${classSuffix}${fileSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    showNotice(`✓ Berhasil mengunduh ${filteredJournals.length} rekaman Jurnal Pengajaran Guru ke Excel!`);
  };

  // Download Summary Grouped by Teacher (Rekap Guru)
  const handleDownloadTeacherSummaryExcel = () => {
    if (filteredJournals.length === 0) {
      alert('Tidak ada data jurnal untuk direkap.');
      return;
    }

    const teacherMap: { [teacherName: string]: { totalKBM: number; classes: Set<string>; subjects: Set<string>; dates: string[] } } = {};

    filteredJournals.forEach((j) => {
      if (!teacherMap[j.teacherName]) {
        teacherMap[j.teacherName] = {
          totalKBM: 0,
          classes: new Set(),
          subjects: new Set(),
          dates: [],
        };
      }
      teacherMap[j.teacherName].totalKBM += 1;
      teacherMap[j.teacherName].classes.add(j.classTarget);
      teacherMap[j.teacherName].subjects.add(j.subject);
      teacherMap[j.teacherName].dates.push(j.date);
    });

    const summaryData = Object.entries(teacherMap).map(([tName, data], idx) => {
      const teacherObj = teachers.find((t) => t.fullNameWithTitle.toLowerCase() === tName.toLowerCase());
      return {
        'No': idx + 1,
        'Nama Guru': tName,
        'NIP / NUPTK': teacherObj?.nip || teacherObj?.nuptk || '-',
        'Total Tatap Muka / KBM': data.totalKBM,
        'Mata Pelajaran Diampu': Array.from(data.subjects).join(', '),
        'Kelas Yang Diajar': Array.from(data.classes).join(', '),
        'Tanggal Mengajar Terakhir': data.dates.sort().reverse()[0] || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 22 },
      { wch: 24 },
      { wch: 30 },
      { wch: 25 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_Per_Guru');
    XLSX.writeFile(workbook, `Rekapitulasi_KBM_Guru_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotice(`✓ Berhasil mengunduh Rekapitulasi KBM Guru ke Excel!`);
  };

  // Open Print / PDF Dialog
  const handleOpenPrintModal = (journal?: TeacherJournal) => {
    if (journal) {
      setSelectedJournalForPrint(journal);
      setPrintMode('single');
    } else {
      setSelectedJournalForPrint(null);
      setPrintMode('all-filtered');
    }
    setShowPrintModal(true);
  };

  // Trigger Browser Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black tracking-wide uppercase">
              <Download className="w-3.5 h-3.5 text-purple-200" />
              <span>Pusat Unduh Administrasi KBM</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Download Jurnal Pengajaran Guru
            </h1>
            <p className="text-purple-100 text-xs md:text-sm font-medium max-w-2xl">
              Unduh rekapitulasi jurnal mengajar, catatan materi, absensi siswa di kelas, dan cetak format dokumen resmi KBM ber-KOP sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenPrintModal()}
              disabled={filteredJournals.length === 0}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur-md text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer border border-white/20 disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-purple-200" />
              <span>Cetak / PDF Resmi</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={filteredJournals.length === 0}
              className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-purple-200 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
            <BookOpenCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Jurnal Terpilih</span>
            <span className="text-xl font-black text-slate-800">{stats.totalEntries} Entri</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Guru Pengajar</span>
            <span className="text-xl font-black text-indigo-700">{stats.uniqueTeachers} Guru</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Kelas Terlayani</span>
            <span className="text-xl font-black text-teal-700">{stats.uniqueClasses} Kelas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mata Pelajaran</span>
            <span className="text-xl font-black text-amber-700">{stats.uniqueSubjects} Mapel</span>
          </div>
        </div>
      </div>

      {/* Filter & Customization Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black text-slate-800">Filter & Kustomisasi Unduhan</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedTeacher('Semua Guru');
              setSelectedClass('Semua Kelas');
              setSelectedSubject('Semua Mata Pelajaran');
              setDatePreset('semua');
              setStartDate('');
              setEndDate('');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>

        {/* Preset Range Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mr-1">
            Periode:
          </span>
          {[
            { id: 'semua', label: 'Semua Periode' },
            { id: 'hari-ini', label: 'Hari Ini' },
            { id: '7-hari', label: '7 Hari Terakhir' },
            { id: 'bulan-ini', label: 'Bulan Ini' },
            { id: 'kustom', label: 'Rentang Kustom' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handlePresetChange(chip.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                datePreset === chip.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Guru Pengajar */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-purple-600" />
              <span>Guru Pengampu</span>
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="Semua Guru">Semua Guru ({teachers.length})</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.fullNameWithTitle}>
                  {t.fullNameWithTitle} {t.subject ? `(${t.subject})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-purple-600" />
              <span>Kelas Target</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="Semua Kelas">Semua Kelas ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.className}>
                  Kelas {c.className}
                </option>
              ))}
            </select>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Mata Pelajaran</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="Semua Mata Pelajaran">Semua Mata Pelajaran</option>
              {commonSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Pencarian Kata Kunci */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Cari Materi / Catatan</span>
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik topik materi / kata kunci..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Custom Date Inputs if selected */}
        {datePreset === 'kustom' && (
          <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-purple-900 uppercase mb-1">
                Dari Tanggal (Mulai)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-900 uppercase mb-1">
                Sampai Tanggal (Selesai)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs font-semibold bg-white"
              />
            </div>
          </div>
        )}

        {/* Action Export Buttons Strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={filteredJournals.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel Jurnal Lengkap ({filteredJournals.length})</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTeacherSummaryExcel}
              disabled={filteredJournals.length === 0}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Rekap KBM Per Guru (Excel)</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenPrintModal()}
              disabled={filteredJournals.length === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-purple-300" />
              <span>Cetak / PDF Dokumen Resmi</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('jurnal-guru')}
            className="text-xs font-bold text-slate-600 hover:text-purple-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Buka Input Jurnal KBM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-purple-600" />
              <span>Pratinjau Data Jurnal Pengajaran ({filteredJournals.length} Baris Data)</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              Tahun Ajaran: <strong className="text-slate-700">{activeAY}</strong> &bull; Seluruh data berikut siap diekspor ke format Excel & PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {filteredJournals.length} Data Siap Unduh
            </span>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 text-center w-12">No</th>
                <th className="p-3 w-36">Tanggal & Jam</th>
                <th className="p-3 w-48">Guru Pengampu</th>
                <th className="p-3 w-40">Mapel & Kelas</th>
                <th className="p-3">Materi / Topik Pembelajaran</th>
                <th className="p-3 w-48">Siswa Tidak Hadir</th>
                <th className="p-3 w-48">Catatan Evaluasi</th>
                <th className="p-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <BookOpenCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm">Tidak ada data jurnal yang sesuai dengan filter.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Silakan ubah filter atau tambahkan jurnal pengajaran di menu Jurnal Guru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredJournals.map((j, idx) => (
                  <tr key={j.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{j.date}</div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                        {j.timeSlot || 'Jam KBM'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{j.teacherName}</div>
                      <span className="text-[10px] text-slate-500 font-normal">Guru Pengampu</span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-purple-900">{j.subject}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold rounded-md">
                        Kelas {j.classTarget}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 max-w-xs">{j.topic}</td>
                    <td className="p-3">
                      {j.absentStudents && j.absentStudents !== 'Nihil (Hadir Semua)' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{j.absentStudents}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Nihil (Hadir Semua)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs text-[11px]">{j.notes || '-'}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenPrintModal(j)}
                        className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors cursor-pointer"
                        title="Cetak Jurnal Ini"
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

      {/* Modal Cetak / PDF Formal Preview */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 my-8 print:border-none print:shadow-none print:m-0 print:p-4 print:rounded-none">
            {/* Modal Actions Bar (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Dokumen Cetak Jurnal Pengajaran Guru
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div ref={printRef} className="space-y-6 text-slate-900 font-sans">
              {/* Kop Surat Resmi dengan Dual Logo (Kabupaten & Sekolah) */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
                {/* Logo Kabupaten / Pemda (Kiri) */}
                {settings?.regencyLogo ? (
                  <img src={settings.regencyLogo} alt="Logo Pemda/Kabupaten" className="w-16 h-16 object-contain shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-bold text-[9px] text-center p-1 shrink-0">
                    LOGO PEMDA
                  </div>
                )}

                <div className="text-center flex-1 space-y-0.5">
                  <p className="text-[12px] font-black uppercase tracking-widest text-slate-800">
                    {settings?.city && settings.city.toUpperCase().includes('PEMERINTAH')
                      ? settings.city.toUpperCase()
                      : `PEMERINTAH ${settings?.city?.toUpperCase().startsWith('KABUPATEN') || settings?.city?.toUpperCase().startsWith('KOTA') ? '' : 'KABUPATEN '}${settings?.city ? settings.city.toUpperCase() : 'KABUPATEN TABANAN'}`}
                  </p>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </p>
                  <h2 className="text-lg font-black uppercase tracking-wider text-slate-950">
                    {settings?.schoolName || 'SMP NEGERI 1 CONTOH'}
                  </h2>
                  <p className="text-xs font-medium text-slate-700">
                    {settings?.schoolAddress || 'Jl. Pendidikan No. 1'} &bull; {settings?.city || 'Kota'}
                  </p>
                  <p className="text-xs font-extrabold text-slate-900 pt-0.5">
                    TAHUN AJARAN {activeAY}
                  </p>
                </div>

                {/* Logo Sekolah (Kanan) */}
                {settings?.schoolLogo ? (
                  <img src={settings.schoolLogo} alt="Logo Sekolah" className="w-16 h-16 object-contain shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-bold text-[9px] text-center p-1 shrink-0">
                    LOGO SEKOLAH
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-black uppercase underline tracking-wide">
                  JURNAL PELAKSANAAN KEGIATAN BELAJAR MENGAJAR (KBM)
                </h3>
                <p className="text-xs font-semibold text-slate-600">
                  {printMode === 'single' && selectedJournalForPrint
                    ? `Pertemuan: ${selectedJournalForPrint.date} (${selectedJournalForPrint.timeSlot})`
                    : `Periode: ${startDate || 'Awal Semester'} s/d ${endDate || 'Sekarang'}`}
                </p>
              </div>

              {/* Metadata Box */}
              <div className="grid grid-cols-2 text-xs font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500">Guru Pengampu:</span>{' '}
                    <strong className="text-slate-900">
                      {printMode === 'single' ? selectedJournalForPrint?.teacherName : selectedTeacher}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Mata Pelajaran:</span>{' '}
                    <strong className="text-slate-900">
                      {printMode === 'single' ? selectedJournalForPrint?.subject : selectedSubject}
                    </strong>
                  </div>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500">Kelas Target:</span>{' '}
                    <strong className="text-slate-900">
                      {printMode === 'single' ? `Kelas ${selectedJournalForPrint?.classTarget}` : selectedClass}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Rekap Pertemuan:</span>{' '}
                    <strong className="text-slate-900">
                      {printMode === 'single' ? '1 Pertemuan' : `${filteredJournals.length} Pertemuan`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <table className="w-full text-left text-xs border border-slate-800 border-collapse">
                <thead>
                  <tr className="bg-slate-200 font-extrabold text-slate-900 uppercase text-[10px] border-b border-slate-800">
                    <th className="p-2 text-center border-r border-slate-800 w-8">No</th>
                    <th className="p-2 border-r border-slate-800 w-28">Hari, Tanggal</th>
                    <th className="p-2 border-r border-slate-800 w-24">Jam Ke</th>
                    <th className="p-2 border-r border-slate-800 w-16">Kelas</th>
                    <th className="p-2 border-r border-slate-800">Materi / Kegiatan Pembelajaran</th>
                    <th className="p-2 border-r border-slate-800 w-36">Siswa Absen</th>
                    <th className="p-2 w-36">Catatan / Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {printMode === 'single' && selectedJournalForPrint ? (
                    <tr>
                      <td className="p-2 text-center border-r border-slate-800 font-bold">1</td>
                      <td className="p-2 border-r border-slate-800 font-bold">{selectedJournalForPrint.date}</td>
                      <td className="p-2 border-r border-slate-800">{selectedJournalForPrint.timeSlot}</td>
                      <td className="p-2 border-r border-slate-800 font-bold">{selectedJournalForPrint.classTarget}</td>
                      <td className="p-2 border-r border-slate-800 font-bold">{selectedJournalForPrint.topic}</td>
                      <td className="p-2 border-r border-slate-800">{selectedJournalForPrint.absentStudents || 'Nihil'}</td>
                      <td className="p-2">{selectedJournalForPrint.notes || '-'}</td>
                    </tr>
                  ) : (
                    filteredJournals.map((j, idx) => (
                      <tr key={j.id} className="border-b border-slate-800">
                        <td className="p-2 text-center border-r border-slate-800 font-bold">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-800 font-bold">{j.date}</td>
                        <td className="p-2 border-r border-slate-800">{j.timeSlot}</td>
                        <td className="p-2 border-r border-slate-800 font-bold">{j.classTarget}</td>
                        <td className="p-2 border-r border-slate-800 font-bold">{j.topic}</td>
                        <td className="p-2 border-r border-slate-800 text-[11px]">{j.absentStudents || 'Nihil'}</td>
                        <td className="p-2 text-[11px]">{j.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Tanda Tangan Resmi Pengesahan */}
              {(() => {
                const principalName = settings?.principalName || 'Dr. H. Ahmad Wijaya, M.Pd.';
                const principalNip = settings?.principalNip || '19750812 199903 1 002';
                const cityName = settings?.city || 'Denpasar';

                const printTeacherName = printMode === 'single'
                  ? selectedJournalForPrint?.teacherName || 'Guru Pengampu'
                  : selectedTeacher !== 'Semua Guru'
                  ? selectedTeacher
                  : currentUser?.name || teachers[0]?.fullNameWithTitle || 'Guru Pengampu';

                const printTeacherObj = teachers.find(
                  (t) => t.fullNameWithTitle.toLowerCase() === printTeacherName.toLowerCase()
                );

                const printTeacherNip = printTeacherObj?.nip || printTeacherObj?.nuptk || '-';

                return (
                  <div className="grid grid-cols-2 pt-8 text-xs font-semibold text-center break-inside-avoid">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Kepala Sekolah</p>
                      <div className="h-20 flex items-center justify-center">
                        {settings?.principalSignature && (
                          <img src={settings.principalSignature} alt="TTD Kepala Sekolah" className="h-16 object-contain" />
                        )}
                      </div>
                      <p className="font-extrabold underline">{principalName}</p>
                      <p className="text-[11px] text-slate-600">NIP. {principalNip}</p>
                    </div>

                    <div>
                      <p>{cityName}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold">Guru Mata Pelajaran</p>
                      <div className="h-20" />
                      <p className="font-extrabold underline">
                        {printTeacherName}
                      </p>
                      <p className="text-[11px] text-slate-600">NIP. {printTeacherNip}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
