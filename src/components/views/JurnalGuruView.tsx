import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import {
  BookOpenCheck,
  Plus,
  Save,
  Calendar,
  Clock,
  School,
  User,
  Trash2,
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
  UserX,
  Download,
  FileSpreadsheet,
  FileDown,
  Zap,
} from 'lucide-react';
import { TeacherJournal } from '../../types';
import {
  KBM_PERIODS,
  KBM_COMBINED_PERIODS,
  getAutoDeviceKbmTimeSlot,
} from '../../utils/kbmSchedule';

export const JurnalGuruView: React.FC = () => {
  const {
    teacherJournals,
    addTeacherJournal,
    updateTeacherJournal,
    deleteTeacherJournal,
    teachers,
    classes,
    students,
    currentUser,
    setActiveTab,
    showNotice
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState<TeacherJournal | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherName, setTeacherName] = useState(
    currentUser?.name || teachers[0]?.fullNameWithTitle || 'Budi Santoso, M.Pd'
  );
  const [subject, setSubject] = useState('Pendidikan Agama');
  const [classTarget, setClassTarget] = useState('');
  const [customClassInput, setCustomClassInput] = useState('');
  const [isManualClassMode, setIsManualClassMode] = useState(false);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [absentStudents, setAbsentStudents] = useState('');
  const [timeSlot, setTimeSlot] = useState(() => getAutoDeviceKbmTimeSlot().standardSlot);

  // Live device time state (refreshed every minute)
  const [currentDeviceTime, setCurrentDeviceTime] = useState(() => getAutoDeviceKbmTimeSlot());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDeviceTime(getAutoDeviceKbmTimeSlot());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Edit Form State
  const [editDate, setEditDate] = useState('');
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editClassTarget, setEditClassTarget] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAbsentStudents, setEditAbsentStudents] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('Semua Kelas');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Sync default classTarget whenever classes or modal opens
  useEffect(() => {
    if (classes.length > 0 && !classTarget) {
      setClassTarget(classes[0].className);
    }
  }, [classes, classTarget]);

  const handleOpenModal = () => {
    setDate(new Date().toISOString().split('T')[0]);
    // Set teacher based on current logged in user or first teacher
    const defaultTeacher = currentUser?.name || teachers[0]?.fullNameWithTitle || 'Budi Santoso, M.Pd';
    setTeacherName(defaultTeacher);
    setAbsentStudents('');

    // Automatically detect device time & assign corresponding Jam Ke 1 s/d 9
    const autoKbm = getAutoDeviceKbmTimeSlot();
    setTimeSlot(autoKbm.standardSlot);

    // If teacher has a subject assigned, use it
    const teacherObj = teachers.find(
      (t) => t.fullNameWithTitle === defaultTeacher || t.fullNameWithTitle === currentUser?.name
    );
    if (teacherObj?.subject) {
      setSubject(teacherObj.subject);
    } else {
      setSubject('Pendidikan Agama');
    }

    // Set default class target
    if (selectedClassFilter !== 'Semua Kelas' && classes.some((c) => c.className === selectedClassFilter)) {
      setClassTarget(selectedClassFilter);
    } else if (classes.length > 0) {
      setClassTarget(classes[0].className);
    } else {
      setClassTarget('');
      setIsManualClassMode(true);
    }

    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const finalClass = isManualClassMode ? customClassInput.trim() : classTarget.trim();

    if (!finalClass) {
      alert('Pilih atau masukkan kelas target terlebih dahulu!');
      return;
    }

    addTeacherJournal({
      date,
      teacherName,
      subject: subject.trim(),
      classTarget: finalClass,
      topic: topic.trim(),
      notes: notes.trim(),
      timeSlot,
      absentStudents: absentStudents.trim() || 'Nihil (Hadir Semua)',
    });

    showNotice?.(`✅ Jurnal pengajaran untuk kelas ${finalClass} berhasil disimpan.`);
    setTopic('');
    setNotes('');
    setAbsentStudents('');
    setCustomClassInput('');
    setShowModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJournal || !editTopic.trim()) return;
    updateTeacherJournal(editingJournal.id, {
      date: editDate,
      teacherName: editTeacherName,
      subject: editSubject.trim(),
      classTarget: editClassTarget.trim(),
      topic: editTopic.trim(),
      notes: editNotes.trim(),
      timeSlot: editTimeSlot,
      absentStudents: editAbsentStudents.trim() || 'Nihil (Hadir Semua)',
    });
    setEditingJournal(null);
    showNotice?.(`✅ Jurnal pengajaran berhasil diperbarui.`);
  };

  // Filter journals
  const filteredJournals = teacherJournals.filter((j) => {
    const matchesSearch =
      j.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.classTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.notes && j.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (j.absentStudents && j.absentStudents.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = selectedClassFilter === 'Semua Kelas' || j.classTarget === selectedClassFilter;
    const matchesDate = !selectedDateFilter || j.date === selectedDateFilter;

    return matchesSearch && matchesClass && matchesDate;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayJournalsCount = teacherJournals.filter((j) => j.date === todayStr).length;

  const quickTimeSlots = [
    'Jam 1 - 2 (07.00 - 08.30)',
    'Jam 3 - 4 (08.30 - 10.00)',
    'Jam 5 - 6 (10.15 - 11.45)',
    'Jam 7 - 8 (12.30 - 14.00)',
  ];

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

  const handleExportExcel = () => {
    if (filteredJournals.length === 0) {
      alert('Tidak ada data jurnal yang sesuai untuk diunduh.');
      return;
    }

    const exportData = filteredJournals.map((j, idx) => ({
      'No': idx + 1,
      'Tanggal': j.date,
      'Waktu/Jam': j.timeSlot || '-',
      'Nama Guru': j.teacherName,
      'Mata Pelajaran': j.subject,
      'Kelas': j.classTarget,
      'Materi / Topik Pembelajaran': j.topic,
      'Siswa Tidak Hadir': j.absentStudents || 'Nihil (Hadir Semua)',
      'Catatan / Evaluasi': j.notes || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const colWidths = [
      { wch: 6 },
      { wch: 14 },
      { wch: 22 },
      { wch: 28 },
      { wch: 22 },
      { wch: 12 },
      { wch: 38 },
      { wch: 30 },
      { wch: 36 },
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jurnal_Guru');
    XLSX.writeFile(workbook, `Jurnal_Pengajaran_Guru_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotice?.(`✓ Berhasil mengunduh ${filteredJournals.length} data Jurnal Guru ke Excel!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
            <BookOpenCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Jurnal Pengajaran Guru</h2>
            <p className="text-xs text-slate-500 font-medium">
              Catatan harian kegiatan belajar mengajar (KBM), agenda materi, dan evaluasi per kelas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('download-jurnal-guru')}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Buka Halaman Download & Cetak Jurnal Guru Lengkap"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Pusat Download Jurnal</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Download Hasil Filter ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-200 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Isi Jurnal Mengajar</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Jurnal</div>
            <div className="text-lg font-black text-slate-800">{teacherJournals.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jurnal Hari Ini</div>
            <div className="text-lg font-black text-slate-800">{todayJournalsCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kelas Terdaftar</div>
            <div className="text-lg font-black text-slate-800">{classes.length} Kelas</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guru Pendidik</div>
            <div className="text-lg font-black text-slate-800">{teachers.length} Guru</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari materi, mapel, nama guru, atau catatan KBM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kelas */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <School className="w-3.5 h-3.5 text-purple-600" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Semua Kelas">Semua Kelas ({classes.length})</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.className}>
                    Kelas {c.className}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tanggal */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              />
              {selectedDateFilter && (
                <button
                  onClick={() => setSelectedDateFilter('')}
                  className="text-[10px] font-bold text-rose-500 hover:underline"
                  title="Hapus filter tanggal"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Class Selector Chips for Fast Filtering */}
        {classes.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Pilih Kelas:</span>
            </span>
            <button
              onClick={() => setSelectedClassFilter('Semua Kelas')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedClassFilter === 'Semua Kelas'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassFilter(c.className)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1 ${
                  selectedClassFilter === c.className
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{c.className}</span>
                {c.homeroomTeacher && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                      selectedClassFilter === c.className ? 'bg-purple-700 text-purple-100' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {c.homeroomTeacher.split(' ')[0]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
            <BookOpenCheck className="w-4 h-4 text-purple-600" />
            <span>Riwayat Jurnal Pengajaran ({filteredJournals.length} Entri)</span>
          </h3>
          {selectedClassFilter !== 'Semua Kelas' && (
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              Filter: Kelas {selectedClassFilter}
            </span>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Tanggal & Jam</th>
                <th className="p-3">Nama Guru Pendidik</th>
                <th className="p-3">Mata Pelajaran & Kelas</th>
                <th className="p-3">Topik Pembahasan Materi</th>
                <th className="p-3">Siswa Absen (Tidak Hadir)</th>
                <th className="p-3">Catatan / Evaluasi KBM</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <BookOpenCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-xs">Belum ada jurnal pengajaran yang sesuai filter.</p>
                    <button
                      onClick={handleOpenModal}
                      className="mt-3 text-purple-600 font-bold text-xs hover:underline inline-flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Jurnal Baru</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredJournals.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{j.date}</div>
                      <span className="text-[10px] text-purple-700 font-semibold">{j.timeSlot}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 flex items-center space-x-1.5 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{j.teacherName}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-extrabold text-[11px] inline-block mb-1">
                        {j.subject}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                          Kelas {j.classTarget}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 max-w-xs">{j.topic}</td>
                    <td className="p-3 max-w-xs">
                      {j.absentStudents && j.absentStudents !== 'Nihil (Hadir Semua)' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{j.absentStudents}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Nihil (Hadir Semua)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 max-w-sm">{j.notes || '-'}</td>
                    <td className="p-3 text-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingJournal(j);
                          setEditDate(j.date);
                          setEditTeacherName(j.teacherName);
                          setEditSubject(j.subject);
                          setEditClassTarget(j.classTarget);
                          setEditTopic(j.topic);
                          setEditNotes(j.notes || '');
                          setEditAbsentStudents(j.absentStudents || 'Nihil (Hadir Semua)');
                          setEditTimeSlot(j.timeSlot);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Jurnal Ini"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus jurnal mengajar "${j.topic}" di Kelas ${j.classTarget}?`)) {
                            deleteTeacherJournal(j.id);
                            showNotice?.('🗑️ Jurnal mengajar berhasil dihapus.');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Jurnal Mengajar Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Jurnal Guru */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                <BookOpenCheck className="w-4 h-4 text-purple-600" />
                <span>Input Jurnal Mengajar Baru</span>
              </h3>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                KBM Guru
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tanggal & Guru Pengajar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal KBM
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Guru Pendidik
                  </label>
                  {teachers.length > 0 ? (
                    <select
                      value={teacherName}
                      onChange={(e) => {
                        setTeacherName(e.target.value);
                        const tch = teachers.find((t) => t.fullNameWithTitle === e.target.value);
                        if (tch?.subject) setSubject(tch.subject);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.fullNameWithTitle}>
                          {t.fullNameWithTitle} {t.position ? `(${t.position})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="Nama Guru Pengajar"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Kelas Target - KELAS YANG DI BUAT */}
              <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <School className="w-3.5 h-3.5 text-purple-600" />
                    <span>Pilih Kelas Target (Sesuai Data Kelas)</span>
                  </label>
                  {classes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsManualClassMode(!isManualClassMode)}
                      className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                    >
                      {isManualClassMode ? '← Pilih dari Daftar Kelas' : '+ Ketik Manual'}
                    </button>
                  )}
                </div>

                {classes.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Belum ada data kelas yang dibuat di sistem.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        required
                        placeholder="Ketik nama kelas (cth: VII A)"
                        value={customClassInput}
                        onChange={(e) => setCustomClassInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-semibold bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setActiveTab('kelas');
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                      >
                        Buka Data Kelas ↗
                      </button>
                    </div>
                  </div>
                ) : isManualClassMode ? (
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama kelas manual (cth: X IPA 1)"
                      value={customClassInput}
                      onChange={(e) => setCustomClassInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Dropdown Select Kelas */}
                    <select
                      value={classTarget}
                      onChange={(e) => setClassTarget(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer shadow-xs"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.className}>
                          Kelas {c.className} {c.homeroomTeacher ? `— Wali: ${c.homeroomTeacher}` : ''} {c.academicYear ? `(${c.academicYear})` : ''}
                        </option>
                      ))}
                    </select>

                    {/* Quick Selection Chips for Classes */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center mr-1">
                        Pilih Cepat:
                      </span>
                      {classes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setClassTarget(c.className)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                            classTarget === c.className
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-100/50'
                          }`}
                        >
                          {classTarget === c.className && <CheckCircle2 className="w-3 h-3" />}
                          <span>{c.className}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer shadow-xs"
                >
                  {commonSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {/* Subject Presets Pills */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {commonSubjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        subject === s
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-purple-100/60 hover:text-purple-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Waktu KBM: Jam Ke 1 s/d 9 + Otomatis Jam Perangkat */}
              <div className="space-y-2 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Waktu KBM (Jam Ke: 1 s/d Jam Ke: 9)</span>
                  </label>
                  {/* Tombol Isi Otomatis Jam Perangkat */}
                  <button
                    type="button"
                    onClick={() => {
                      const auto = getAutoDeviceKbmTimeSlot();
                      setTimeSlot(auto.standardSlot);
                      showNotice?.(`⚡ Waktu KBM diisi otomatis: ${auto.standardSlot} (Jam ${auto.currentTimeStr})`);
                    }}
                    className="inline-flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Isi otomatis jam mengajar sesuai jam pada perangkat saat ini"
                  >
                    <Zap className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>Isi Otomatis Jam Sekarang ({currentDeviceTime.currentTimeStr})</span>
                  </button>
                </div>

                {/* Input Text Waktu KBM */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="Contoh: Jam Ke-1 (07.00 - 07.45) atau Jam 1 - 2"
                    className="w-full pl-3 pr-24 py-2 rounded-xl border border-indigo-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-xs"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 pointer-events-none flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span>{currentDeviceTime.currentTimeStr}</span>
                  </div>
                </div>

                {/* Jam Ke-1 s/d Jam Ke-9 Quick Buttons Grid */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">Pilih Jam Tatap Muka (1 s/d 9):</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">Tersedia Jam 1 s/d 9</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1">
                    {KBM_PERIODS.map((p) => {
                      const isSelected = timeSlot.includes(`Jam Ke-${p.period}`) || timeSlot.includes(`Jam ${p.period}`);
                      const isCurrentNow = currentDeviceTime.periodNumber === p.period;

                      return (
                        <button
                          key={p.period}
                          type="button"
                          onClick={() => setTimeSlot(p.label)}
                          className={`px-1.5 py-1.5 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300 font-bold'
                              : isCurrentNow
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 font-bold'
                              : 'bg-white border border-indigo-100 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300'
                          }`}
                          title={`${p.label}`}
                        >
                          {isCurrentNow && !isSelected && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                          )}
                          <span className="text-[11px] font-extrabold leading-tight">Jam {p.period}</span>
                          <span className="text-[9px] opacity-80 leading-tight truncate w-full">{p.timeRange.split(' - ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Blok Jam / Multi Jam Presets */}
                <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-indigo-100">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Blok Jam:</span>
                  {KBM_COMBINED_PERIODS.map((comb) => {
                    const isSelected = timeSlot === comb;
                    return (
                      <button
                        key={comb}
                        type="button"
                        onClick={() => setTimeSlot(comb)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {comb.split(' (')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topik Materi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Topik Materi Pembahasan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Teorema Pythagoras & Pembahasan Soal Latihan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              {/* Siswa yang Absen (Tidak Hadir) */}
              <div className="space-y-1.5 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-900 uppercase tracking-wider flex items-center space-x-1">
                    <UserX className="w-3.5 h-3.5 text-amber-600" />
                    <span>Siswa yang Absen / Tidak Hadir</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAbsentStudents('Nihil (Hadir Semua)')}
                    className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-all shadow-xs"
                  >
                    ✓ Hadir Semua (Nihil)
                  </button>
                </div>
                <input
                  type="text"
                  value={absentStudents}
                  onChange={(e) => setAbsentStudents(e.target.value)}
                  placeholder="Contoh: Aditya Pratama (Sakit), Anisa (Izin) atau ketik 'Nihil (Hadir Semua)'"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />

                {/* Quick Student Chips from Selected Class */}
                {(() => {
                  const targetCls = isManualClassMode ? customClassInput.trim() : classTarget.trim();
                  const classStudents = students.filter((s) => s.currentClass === targetCls);
                  if (classStudents.length === 0) return null;

                  return (
                    <div className="pt-1.5 space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 block">
                        Klik nama siswa Kelas {targetCls} untuk menambahkan ke daftar absen:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-xl border border-amber-200">
                        {classStudents.map((std) => {
                          const isAdded = absentStudents.includes(std.fullName);
                          return (
                            <button
                              key={std.id}
                              type="button"
                              onClick={() => {
                                if (absentStudents === 'Nihil (Hadir Semua)' || !absentStudents.trim()) {
                                  setAbsentStudents(`${std.fullName} (Sakit)`);
                                } else if (!isAdded) {
                                  setAbsentStudents(`${absentStudents}, ${std.fullName} (Sakit)`);
                                } else {
                                  const parts = absentStudents
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter((s) => !s.startsWith(std.fullName));
                                  setAbsentStudents(parts.join(', ') || 'Nihil (Hadir Semua)');
                                }
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                                isAdded
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              }`}
                            >
                              {isAdded ? `✓ ${std.fullName}` : `+ ${std.fullName}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Catatan / Evaluasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Evaluasi / Keaktifan Siswa
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Seluruh siswa hadir tertib, 3 siswa aktif bertanya dan menyelesaikan tugas tepat waktu..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 cursor-pointer flex items-center space-x-1.5 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Jurnal KBM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Jurnal Guru */}
      {editingJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">Edit Jurnal Mengajar KBM</h3>
                  <p className="text-xs text-slate-500 font-medium">Ubah rincian materi atau catatan KBM</p>
                </div>
              </div>
              <button
                onClick={() => setEditingJournal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal KBM
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Guru Pengajar
                  </label>
                  <input
                    type="text"
                    required
                    value={editTeacherName}
                    onChange={(e) => setEditTeacherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              {/* Mata Pelajaran & Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer shadow-xs"
                  >
                    {commonSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kelas Target <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editClassTarget}
                    onChange={(e) => setEditClassTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              {/* Waktu KBM Edit: Jam Ke 1 s/d 9 + Otomatis Jam Perangkat */}
              <div className="space-y-2 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Waktu KBM (Jam Ke: 1 s/d Jam Ke: 9)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const auto = getAutoDeviceKbmTimeSlot();
                      setEditTimeSlot(auto.standardSlot);
                      showNotice?.(`⚡ Waktu KBM diisi otomatis: ${auto.standardSlot}`);
                    }}
                    className="inline-flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Zap className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>Isi Otomatis Jam Sekarang ({currentDeviceTime.currentTimeStr})</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editTimeSlot}
                    onChange={(e) => setEditTimeSlot(e.target.value)}
                    placeholder="Contoh: Jam Ke-1 (07.00 - 07.45) atau Jam 1 - 2"
                    className="w-full pl-3 pr-24 py-2 rounded-xl border border-indigo-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-xs"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 pointer-events-none">
                    {currentDeviceTime.currentTimeStr}
                  </div>
                </div>

                {/* Jam 1 s/d 9 Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1 pt-1">
                  {KBM_PERIODS.map((p) => {
                    const isSelected = editTimeSlot.includes(`Jam Ke-${p.period}`) || editTimeSlot.includes(`Jam ${p.period}`);
                    return (
                      <button
                        key={p.period}
                        type="button"
                        onClick={() => setEditTimeSlot(p.label)}
                        className={`px-1.5 py-1.5 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300 font-bold'
                            : 'bg-white border border-indigo-100 text-slate-700 hover:bg-indigo-50'
                        }`}
                      >
                        <span className="text-[11px] font-extrabold leading-tight">Jam {p.period}</span>
                        <span className="text-[9px] opacity-80 leading-tight truncate w-full">{p.timeRange.split(' - ')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Blok Jam Presets */}
                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-indigo-100">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Blok:</span>
                  {KBM_COMBINED_PERIODS.map((comb) => (
                    <button
                      key={comb}
                      type="button"
                      onClick={() => setEditTimeSlot(comb)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        editTimeSlot === comb
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      {comb.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Materi / Topik Bahasan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                />
              </div>

              {/* Siswa yang Absen (Edit) */}
              <div className="space-y-1.5 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-900 uppercase tracking-wider flex items-center space-x-1">
                    <UserX className="w-3.5 h-3.5 text-amber-600" />
                    <span>Siswa yang Absen / Tidak Hadir</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditAbsentStudents('Nihil (Hadir Semua)')}
                    className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-all shadow-xs"
                  >
                    ✓ Hadir Semua (Nihil)
                  </button>
                </div>
                <input
                  type="text"
                  value={editAbsentStudents}
                  onChange={(e) => setEditAbsentStudents(e.target.value)}
                  placeholder="Contoh: Aditya Pratama (Sakit), Anisa (Izin) atau 'Nihil (Hadir Semua)'"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />

                {/* Quick Student Chips for Edit Modal */}
                {(() => {
                  const classStudents = students.filter((s) => s.currentClass === editClassTarget.trim());
                  if (classStudents.length === 0) return null;

                  return (
                    <div className="pt-1.5 space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 block">
                        Klik siswa Kelas {editClassTarget} untuk menambah ke daftar absen:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-xl border border-amber-200">
                        {classStudents.map((std) => {
                          const isAdded = editAbsentStudents.includes(std.fullName);
                          return (
                            <button
                              key={std.id}
                              type="button"
                              onClick={() => {
                                if (editAbsentStudents === 'Nihil (Hadir Semua)' || !editAbsentStudents.trim()) {
                                  setEditAbsentStudents(`${std.fullName} (Sakit)`);
                                } else if (!isAdded) {
                                  setEditAbsentStudents(`${editAbsentStudents}, ${std.fullName} (Sakit)`);
                                } else {
                                  const parts = editAbsentStudents
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter((s) => !s.startsWith(std.fullName));
                                  setEditAbsentStudents(parts.join(', ') || 'Nihil (Hadir Semua)');
                                }
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                                isAdded
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              }`}
                            >
                              {isAdded ? `✓ ${std.fullName}` : `+ ${std.fullName}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Evaluasi / Keaktifan Siswa
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingJournal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

