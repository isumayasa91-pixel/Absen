import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { exportToExcel } from '../../utils/excelExport';
import * as XLSX from 'xlsx';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  KeyRound,
  Plus,
  Save,
  Search,
  CheckCircle2,
  QrCode,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  FileText,
  Printer,
  X,
  School,
  User,
} from 'lucide-react';

export const DataSiswaView: React.FC = () => {
  const {
    students,
    addStudent,
    importStudents,
    generateMassStudentAccounts,
    deleteStudent,
    updateStudentPhoto,
    classes,
    settings,
    clearAllStudents,
  } = useApp();

  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('Semua Kelas');
  const [notification, setNotification] = useState('');

  const handleUploadCardPhoto = (studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (base64) {
        updateStudentPhoto(studentId, base64);
        if (selectedStudentForQr && selectedStudentForQr.id === studentId) {
          setSelectedStudentForQr({ ...selectedStudentForQr, photo: base64 });
        }
        setNotification('✅ Pas foto kartu peserta berhasil diperbarui!');
        setTimeout(() => setNotification(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCardPhoto = (studentId: string, studentName?: string) => {
    if (window.confirm(`Hapus pas foto kartu peserta untuk "${studentName || 'siswa ini'}"?`)) {
      updateStudentPhoto(studentId, '');
      if (selectedStudentForQr && selectedStudentForQr.id === studentId) {
        setSelectedStudentForQr({ ...selectedStudentForQr, photo: '' });
      }
      setNotification('🗑️ Pas foto kartu peserta berhasil dihapus!');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Form states
  const [fullName, setFullName] = useState('');
  const [currentClass, setCurrentClass] = useState(classes[0]?.className || 'X IPA 1');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');

  // Excel Import States
  const [importFileName, setImportFileName] = useState<string>('');
  const [parsedImportData, setParsedImportData] = useState<
    Array<{ fullName: string; currentClass: string; nisn: string; gender: 'L' | 'P' }>
  >([]);
  const [importError, setImportError] = useState<string>('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nisn.trim()) return;
    addStudent(fullName.trim(), currentClass, nisn.trim(), gender);
    setFullName('');
    setNisn('');
    setShowManualModal(false);
    showNotice(`Siswa ${fullName} berhasil ditambahkan!`);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Nama Lengkap': 'Ahmad Fauzi',
        Kelas: classes[0]?.className || 'X IPA 1',
        NISN: '0081234501',
        'Gender (L/P)': 'L',
      },
      {
        'Nama Lengkap': 'Bunga Lestari',
        Kelas: classes[0]?.className || 'X IPA 1',
        NISN: '0081234502',
        'Gender (L/P)': 'P',
      },
      {
        'Nama Lengkap': 'Candra Wijaya',
        Kelas: classes[1]?.className || 'X IPA 2',
        NISN: '0081234503',
        'Gender (L/P)': 'L',
      },
    ];
    exportToExcel(templateData, 'Template_Import_Data_Siswa', 'Template Data Siswa');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

        if (rawRows.length === 0) {
          setImportError('File Excel kosong atau format tidak sesuai.');
          setParsedImportData([]);
          return;
        }

        // Map columns intelligently
        const parsedRows = rawRows
          .map((row) => {
            const keys = Object.keys(row);

            const findVal = (possibleKeys: string[]) => {
              const matchedKey = keys.find((k) =>
                possibleKeys.some((p) => k.toLowerCase().includes(p.toLowerCase()))
              );
              return matchedKey ? String(row[matchedKey]).trim() : '';
            };

            const nameVal =
              findVal(['nama lengkap', 'nama siswa', 'nama', 'fullname', 'name']) || '';
            const classVal =
              findVal(['kelas', 'class', 'current class', 'ruang']) || classes[0]?.className || 'X IPA 1';
            const nisnVal =
              findVal(['nisn', 'nis', 'no induk', 'id']) ||
              `00${Math.floor(10000000 + Math.random() * 90000000)}`;
            const genderRaw = findVal(['gender', 'jenis kelamin', 'jk', 'l/p', 'sex']);
            const genderVal: 'L' | 'P' =
              genderRaw.toUpperCase().startsWith('P') || genderRaw.toLowerCase() === 'perempuan'
                ? 'P'
                : 'L';

            return {
              fullName: nameVal,
              currentClass: classVal,
              nisn: nisnVal,
              gender: genderVal,
            };
          })
          .filter((row) => row.fullName.length > 0);

        if (parsedRows.length === 0) {
          setImportError('Tidak ada baris data valid yang terdeteksi dalam file ini.');
          setParsedImportData([]);
        } else {
          setParsedImportData(parsedRows);
        }
      } catch (err) {
        console.error('Error reading Excel file:', err);
        setImportError('Gagal membaca file Excel. Pastikan format file .xlsx atau .csv');
        setParsedImportData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessImport = () => {
    if (parsedImportData.length === 0) {
      // Demo mock fallback if no file uploaded
      const mock = [
        { fullName: 'Hendra Setiawan', currentClass: classes[0]?.className || 'X IPA 1', nisn: '0089123001', gender: 'L' as const },
        { fullName: 'Intan Nuraini', currentClass: classes[1]?.className || 'X IPA 2', nisn: '0089123002', gender: 'P' as const },
        { fullName: 'Joko Susilo', currentClass: classes[0]?.className || 'X IPA 1', nisn: '0089123003', gender: 'L' as const },
      ];
      importStudents(mock);
      setShowImportModal(false);
      resetImportState();
      showNotice('3 data siswa demo berhasil diimpor!');
      return;
    }

    importStudents(parsedImportData);
    setShowImportModal(false);
    showNotice(`${parsedImportData.length} data siswa berhasil diimpor dari Excel!`);
    resetImportState();
  };

  const resetImportState = () => {
    setImportFileName('');
    setParsedImportData([]);
    setImportError('');
  };

  const handleMassAccount = () => {
    generateMassStudentAccounts();
    showNotice('Akun login massal untuk seluruh siswa berhasil dibuat/diperbarui!');
  };

  const handleDeleteAll = () => {
    if (students.length === 0) {
      showNotice('⚠️ Tidak ada data siswa untuk dihapus.');
      return;
    }
    const firstConfirm = window.confirm(
      `⚠️ PERINGATAN: Apakah Anda benar-benar yakin ingin menghapus SELURUH (${students.length}) data siswa secara permanen?\n\nTindakan ini akan menghapus semua foto profil, akun login, dan RFID tag siswa.`
    );
    if (firstConfirm) {
      const secondConfirm = window.confirm(
        'Tindakan ini TIDAK dapat dibatalkan. Ketuk "OK" untuk menghapus seluruh data siswa sekarang juga.'
      );
      if (secondConfirm) {
        clearAllStudents();
        showNotice('🗑️ Berhasil menghapus seluruh data siswa dari database!');
      }
    }
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.currentClass.toLowerCase().includes(searchQuery.toLowerCase());
    const matchClass = classFilter === 'Semua Kelas' || s.currentClass === classFilter;
    return matchQuery && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Data Peserta Didik / Siswa</h2>
            <p className="text-xs text-slate-500 font-medium">Manajemen master data siswa, NISN, RFID Tag, dan pembuatan akun login</p>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Generate Akun Massal */}
          <button
            onClick={handleMassAccount}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Generate Akun Massal</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel</span>
          </button>

          {/* Tambah Manual */}
          <button
            onClick={() => setShowManualModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>

          {/* Hapus Semua Siswa */}
          <button
            onClick={handleDeleteAll}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 active:scale-95 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Hapus Semua</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Controls & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NISN..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Semua Kelas">Semua Kelas ({students.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        {/* Table Siswa */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">NISN</th>
                <th className="p-3">Kelas Aktif</th>
                <th className="p-3 text-center">Gender</th>
                <th className="p-3">Kartu RFID / QR</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi / Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-[10px]">
                      {s.fullName.charAt(0)}
                    </div>
                    <span>{s.fullName}</span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-600">{s.nisn}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {s.currentClass}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        s.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {s.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForQr(s)}
                      className="inline-flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer font-bold shadow-2xs"
                      title="Lihat & Cetak Kartu QR Siswa Ini"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-900" />
                      <span>{s.rfidTag || `RFID-${s.nisn.slice(-4)}`}</span>
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-center flex items-center justify-center space-x-1">
                    <button
                      onClick={() => setSelectedStudentForQr(s)}
                      className="p-1.5 text-blue-900 hover:text-blue-950 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Tampilkan QR Code Kartu"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus data siswa "${s.fullName}"?`)) {
                          deleteStudent(s.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Siswa Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Tambah Data Siswa Manual</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ahmad Rizky Saputra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* NISN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NISN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="10 Digit NISN (contoh: 0078912349)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Kelas Aktif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kelas Aktif <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentClass}
                  onChange={(e) => setCurrentClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.className}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jenis Kelamin / Gender <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('L')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      gender === 'L'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Laki-Laki (L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('P')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      gender === 'P'
                        ? 'bg-pink-600 text-white border-pink-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Perempuan (P)
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Import Data Peserta Didik via Excel</span>
              </h3>
              <button
                onClick={downloadTemplate}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                title="Download Template Format Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            {/* Instruction banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800">Format Kolom File Excel (.xlsx / .csv):</p>
              <p className="text-slate-600 font-mono text-[11px]">
                Header: <span className="font-bold text-indigo-600">Nama Lengkap</span> |{' '}
                <span className="font-bold text-indigo-600">Kelas</span> |{' '}
                <span className="font-bold text-indigo-600">NISN</span> |{' '}
                <span className="font-bold text-indigo-600">Gender (L/P)</span>
              </p>
            </div>

            {/* Upload Box */}
            <div className="relative p-5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-2xl text-center space-y-2 transition-colors">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {importFileName ? (
                    <span className="text-emerald-700 font-extrabold flex items-center justify-center space-x-1">
                      <FileText className="w-4 h-4 inline" />
                      <span>File Terpilih: {importFileName}</span>
                    </span>
                  ) : (
                    'Klik atau tarik file Excel / CSV ke sini'
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mendukung format .xlsx, .xls, atau .csv (Maksimal 2000 data per unggahan)
                </p>
              </div>
            </div>

            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedImportData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Pratinjau Data Terbaca ({parsedImportData.length} Siswa):</span>
                  <span className="text-[11px] text-emerald-600">Siap Diimpor</span>
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 font-bold text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2">Nama</th>
                        <th className="p-2">Kelas</th>
                        <th className="p-2">NISN</th>
                        <th className="p-2 text-center">L/P</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {parsedImportData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">{row.fullName}</td>
                          <td className="p-2">{row.currentClass}</td>
                          <td className="p-2 font-mono">{row.nisn}</td>
                          <td className="p-2 text-center font-bold">{row.gender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedImportData.length > 10 && (
                  <p className="text-[10px] text-slate-400 text-right">
                    + {parsedImportData.length - 10} baris data lainnya...
                  </p>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  resetImportState();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>

              <div className="flex items-center space-x-2">
                {parsedImportData.length === 0 && (
                  <button
                    type="button"
                    onClick={handleProcessImport}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                  >
                    Gunakan Data Demo
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={parsedImportData.length === 0 && !!importFileName}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-1.5 transition-all cursor-pointer ${
                    parsedImportData.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 opacity-90'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    {parsedImportData.length > 0
                      ? `Proses Import (${parsedImportData.length} Siswa)`
                      : 'Proses Import Siswa'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quick View QR Code & Kartu Pelajar Siswa */}
      {selectedStudentForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-transparent">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 my-6 print:p-0 print:border-none print:shadow-none print:my-0">
            {/* Header (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold shadow-md shadow-blue-900/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Kartu Siswa RFID & QR Code</h3>
                  <p className="text-xs text-slate-500 font-medium">Digital Pass Presensi & Identitas Resmi Siswa</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForQr(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Card 2-Side Representation */}
            <div className="space-y-4 bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 print-card-wrapper print:p-0 print:bg-transparent print:border-none">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider px-1 gap-2 no-print">
                <div className="flex items-center space-x-2">
                  <span>📇 Desain Fisik Kartu RFID</span>
                  <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-mono font-black text-[10px] border border-blue-300">
                    9,0 x 5,3 cm
                  </span>
                </div>
                <span className="text-blue-700 font-black">Depan & Belakang (Ultra Tajam)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center print-card-grid">
                {/* TAMPILAN DEPAN (9,0 x 5,3 cm) */}
                <div
                  style={{ width: '90mm', height: '53mm' }}
                  className="w-[340px] h-[200px] bg-white text-slate-900 rounded-[12px] p-0 shadow-lg border-[1.5px] border-blue-900 relative overflow-hidden flex flex-col justify-between shrink-0 font-sans crisp-card print-exact-card"
                >
                  {/* Header Bar dengan Alamat Sekolah */}
                  <div className="bg-blue-900 text-white px-2.5 py-1.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-md bg-white border border-blue-200 flex items-center justify-center shrink-0 overflow-hidden p-0.5 shadow-2xs">
                        {settings.schoolLogo ? (
                          <img src={settings.schoolLogo} alt="Logo" className="w-full h-full object-contain crisp-card" />
                        ) : (
                          <School className="w-4 h-4 text-blue-900" />
                        )}
                      </div>
                      <div className="leading-tight text-left min-w-0 flex-1">
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-white truncate block" title={settings.schoolName}>
                          {settings.schoolName || 'SMP NEGERI 1'}
                        </span>
                        <span className="text-[6.5px] text-blue-100 font-medium truncate block leading-tight" title={settings.schoolAddress}>
                          {settings.schoolAddress || 'Jl. Pemuda Pendidikan No. 45'}{settings.city ? ` • ${settings.city}` : ''}
                        </span>
                        <span className="text-[6.5px] text-amber-300 font-black uppercase tracking-wider block">
                          KARTU PRESENSI DIGITAL RFID
                        </span>
                      </div>
                    </div>
                    <span className="text-[7px] font-mono font-black bg-red-600 text-white px-1.5 py-0.5 rounded ml-1 shrink-0 shadow-2xs border border-red-700">
                      9.0 x 5.3 cm
                    </span>
                  </div>

                  <div className="h-[2px] w-full bg-red-600" />

                  {/* Body */}
                  <div className="px-3 py-2 flex items-center justify-between space-x-3 bg-white flex-1 relative z-10">
                    <div className="w-[66px] h-[82px] rounded-lg bg-slate-50 border-[1.5px] border-blue-900 overflow-hidden shrink-0 flex flex-col items-center justify-center relative shadow-2xs group">
                      {selectedStudentForQr.photo ? (
                        <img src={selectedStudentForQr.photo} alt={selectedStudentForQr.fullName} className="w-full h-full object-cover crisp-card" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          <User className="w-7 h-7 text-blue-900/40" />
                          <span className="text-[6.5px] font-black text-red-600 mt-0.5">PAS FOTO</span>
                        </div>
                      )}
                      
                      {/* Hover Actions: Upload / Hapus (Hidden on Print) */}
                      <div className="absolute inset-0 bg-blue-950/85 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-1 space-y-1 z-20 no-print">
                        <label className="bg-blue-600 hover:bg-blue-700 text-white rounded px-1.5 py-0.5 text-[7px] font-bold flex items-center space-x-0.5 cursor-pointer w-full justify-center shadow-xs">
                          <Upload className="w-2.5 h-2.5 text-amber-300" />
                          <span>{selectedStudentForQr.photo ? 'Ganti' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadCardPhoto(selectedStudentForQr.id, e)}
                          />
                        </label>
                        {selectedStudentForQr.photo && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteCardPhoto(selectedStudentForQr.id, selectedStudentForQr.fullName);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white rounded px-1.5 py-0.5 text-[7px] font-bold flex items-center space-x-0.5 cursor-pointer w-full justify-center shadow-xs"
                            title="Hapus pas foto kartu"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      <div className="absolute -top-1 -right-1 w-4 h-3 bg-gradient-to-br from-amber-400 to-yellow-300 rounded border border-amber-600 pointer-events-none shadow-2xs" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1 text-left">
                      <div>
                        <div className="text-[7px] uppercase tracking-wider text-red-600 font-black">NAMA LENGKAP SISWA</div>
                        <div className="text-[12.5px] font-black truncate text-slate-950 leading-tight">{selectedStudentForQr.fullName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                        <div>
                          <span className="text-slate-600 font-bold">NISN:</span>{' '}
                          <span className="font-mono font-black text-blue-900">{selectedStudentForQr.nisn}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 font-bold">Kelas:</span>{' '}
                          <span className="font-black text-red-700 bg-red-50 px-1 py-0.2 rounded border border-red-200">{selectedStudentForQr.currentClass}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[7px] text-slate-600 font-mono font-black uppercase">TAG SENSOR RFID</div>
                        <div className="text-[8.5px] font-mono font-black text-white bg-blue-900 px-1.5 py-0.5 rounded border-l-2 border-red-600 inline-block shadow-2xs">
                          {selectedStudentForQr.rfidTag || `RFID-${selectedStudentForQr.nisn}`}
                        </div>
                      </div>
                    </div>

                    {/* High Res QR Code SVG */}
                    <div className="bg-white p-1 rounded-lg border-[1.5px] border-blue-900 shadow-2xs flex flex-col items-center justify-center shrink-0">
                      <QRCodeSVG
                        value={selectedStudentForQr.rfidTag || selectedStudentForQr.nisn}
                        size={46}
                        level="H"
                        fgColor="#0f172a"
                        bgColor="#ffffff"
                      />
                      <span className="text-[6.5px] font-mono font-black text-blue-900 mt-0.5">SCAN QR</span>
                    </div>
                  </div>

                  {/* Footer Barcode */}
                  <div className="bg-slate-50 border-t border-slate-200 px-3 py-1 flex items-center justify-between text-[8px] text-slate-900 font-mono">
                    <div className="flex items-center space-x-1 font-bold text-red-700">
                      <QrCode className="w-3.5 h-3.5 text-blue-900" />
                      <span>QR-RFID-{selectedStudentForQr.nisn.slice(-6)}</span>
                    </div>
                    <span className="font-sans font-black text-[8px] text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-300">TA {settings.academicYear || '2026/2027'}</span>
                  </div>
                </div>

                {/* TAMPILAN BELAKANG (9,0 x 5,3 cm) */}
                <div
                  style={{ width: '90mm', height: '53mm' }}
                  className="w-[340px] h-[200px] bg-white text-slate-900 rounded-[12px] p-0 shadow-lg border-[1.5px] border-blue-900 relative overflow-hidden flex flex-col justify-between shrink-0 text-left font-sans crisp-card print-exact-card"
                >
                  {/* Header Bar dengan Alamat Sekolah */}
                  <div className="bg-blue-900 text-white px-2.5 py-1 flex items-center justify-between">
                    <div className="leading-tight min-w-0 flex-1">
                      <div className="text-[8px] font-black uppercase tracking-wider text-amber-300">
                        KETENTUAN PENGGUNAAN KARTU
                      </div>
                      <div className="text-[6px] text-blue-100 font-medium truncate" title={settings.schoolAddress}>
                        {settings.schoolAddress || 'Jl. Pemuda Pendidikan No. 45'}{settings.city ? ` • ${settings.city}` : ''}
                      </div>
                    </div>
                    <div className="text-[7px] text-white font-mono font-black bg-blue-950 px-1.5 py-0.5 rounded shrink-0 border border-blue-800">RFID 9x5.3cm</div>
                  </div>

                  <div className="h-[2px] w-full bg-red-600" />

                  {/* Body Content */}
                  <div className="p-2.5 text-[8px] space-y-1.5 flex-1 flex flex-col justify-between bg-white overflow-hidden">
                    <div className="flex items-start justify-between space-x-2">
                      <ol className="text-[7.5px] text-slate-800 space-y-0.5 list-decimal pl-3.5 leading-tight font-medium flex-1">
                        <li>Kartu wajib dibawa setiap hari untuk presensi digital.</li>
                        <li>Dilarang melipat, merusak chip RFID atau kode QR.</li>
                        <li>Kartu tidak dapat dipindahtangankan ke orang lain.</li>
                        <li>Jika hilang, segera lapor ke piket sekolah.</li>
                      </ol>

                      <div className="shrink-0 bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs flex flex-col items-center justify-center">
                        <QRCodeSVG
                          value={`PRESENSI:${selectedStudentForQr.nisn}:${selectedStudentForQr.rfidTag || selectedStudentForQr.nisn}`}
                          size={38}
                          level="H"
                          fgColor="#0f172a"
                          bgColor="#ffffff"
                        />
                        <span className="text-[5.5px] font-mono font-bold text-slate-600">VERIFIED</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-200 pt-1 text-[8px] text-slate-700">
                      <div className="max-w-[140px]">
                        <div className="font-black text-blue-900 text-[8.5px] leading-tight truncate" title={settings.schoolName}>
                          {settings.schoolName || 'SMP Negeri 1'}
                        </div>
                        <div className="text-[6px] text-slate-600 font-medium leading-tight truncate" title={settings.schoolAddress}>
                          {settings.schoolAddress || 'Jl. Pemuda Pendidikan No. 45'}
                        </div>
                        <div className="text-[6.5px] text-red-600 font-bold mt-0.5">Sistem Presensi RFID & QR Digital</div>
                      </div>
                      <div className="text-center min-w-[125px] max-w-[140px] relative">
                        <div className="text-[6px] text-slate-500 font-bold leading-none">Mengetahui,</div>
                        <div className="text-[6.5px] text-slate-800 font-black leading-tight">Kepala Sekolah</div>

                        {/* Visual Container Signature + Stamp (Enlarged & Proportional) */}
                        <div className="h-9 my-0.5 relative flex items-center justify-center overflow-visible">
                          {settings.schoolStamp && (
                            <img
                              src={settings.schoolStamp}
                              alt="Cap Sekolah"
                              className="absolute left-1/2 top-1/2 -translate-x-[58%] -translate-y-1/2 h-9 w-9 object-contain opacity-90 pointer-events-none crisp-card"
                            />
                          )}
                          {settings.principalSignature && (
                            <img
                              src={settings.principalSignature}
                              alt="TTD Kepsek"
                              className="relative z-10 h-7.5 max-h-7.5 max-w-[100px] w-auto object-contain pointer-events-none crisp-card"
                            />
                          )}
                        </div>

                        <div className="font-black text-blue-950 text-[7px] border-b border-slate-400 pb-0.5 leading-tight truncate max-w-[130px] mx-auto" title={settings.principalName}>
                          {settings.principalName || 'Dr. H. Ahmad Wijaya, M.Pd.'}
                        </div>
                        <div className="text-[6.5px] font-mono text-blue-950 font-black mt-0.5 truncate max-w-[130px] mx-auto bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                          NIP. {settings.principalNip || '19750812 199903 1 002'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pas Foto Kartu Siswa Management Bar */}
            <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs no-print">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-900 shrink-0" />
                <div>
                  <span className="font-bold text-blue-950">Pas Foto Kartu: </span>
                  {selectedStudentForQr.photo ? (
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">✅ Foto Tersedia</span>
                  ) : (
                    <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded border border-red-300">⚠️ Belum Ada Foto</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {selectedStudentForQr.photo && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCardPhoto(selectedStudentForQr.id, selectedStudentForQr.fullName)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer transition-colors"
                    title="Hapus pas foto kartu siswa ini"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Pas Foto</span>
                  </button>
                )}

                <label className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5 text-red-400" />
                  <span>{selectedStudentForQr.photo ? 'Ganti Pas Foto' : 'Upload Pas Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadCardPhoto(selectedStudentForQr.id, e)}
                  />
                </label>
              </div>
            </div>
            {/* QR Code Payload Value & Pengesahan Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Payload Data Kartu:</span>
                <p className="font-mono text-xs font-black text-blue-700 select-all bg-white p-2 rounded-xl border border-slate-200 truncate">
                  {selectedStudentForQr.rfidTag || selectedStudentForQr.nisn}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Alamat: {settings.schoolAddress || '-'}</p>
              </div>

              {/* Data Pengesahan Kepsek */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Kepala Sekolah</div>
                  <div className="text-xs font-black text-slate-900 truncate" title={settings.principalName}>
                    {settings.principalName || 'Dr. H. Ahmad Wijaya, M.Pd.'}
                  </div>
                  <div className="text-[10px] font-mono font-extrabold text-blue-700 truncate mt-0.5">
                    NIP. {settings.principalNip || '19750812 199903 1 002'}
                  </div>
                </div>
                <div className="h-10 w-24 relative shrink-0 flex items-center justify-center">
                  {settings.schoolStamp && (
                    <img src={settings.schoolStamp} alt="Cap" className="absolute -left-1 h-10 w-10 opacity-85 object-contain" />
                  )}
                  {settings.principalSignature && (
                    <img src={settings.principalSignature} alt="TTD" className="relative z-10 h-8.5 max-w-full object-contain" />
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions (Hidden on Print) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => setSelectedStudentForQr(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak / Print Kartu (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
