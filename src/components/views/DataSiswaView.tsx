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
    classes,
    settings,
  } = useApp();

  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('Semua Kelas');
  const [notification, setNotification] = useState('');

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

      {/* Modal Quick View QR Code Kartu Siswa */}
      {selectedStudentForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold shadow-md shadow-blue-900/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Kartu QR Code & RFID Digital</h3>
                  <p className="text-xs text-slate-500 font-medium">Digital Pass Presensi Siswa</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForQr(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Card Representation */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-[320px] h-[200px] bg-white text-slate-900 rounded-2xl p-0 shadow-xl border-2 border-blue-900 relative overflow-hidden flex flex-col justify-between shrink-0 font-sans">
                {/* Header Bar */}
                <div className="bg-blue-900 text-white px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <div className="w-5 h-5 rounded bg-white border border-blue-300 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                      {settings.schoolLogo ? (
                        <img src={settings.schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <School className="w-3.5 h-3.5 text-blue-900" />
                      )}
                    </div>
                    <div className="leading-tight truncate">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 truncate block">
                        {settings.schoolName || 'KARTU PRESENSI SISWA'}
                      </span>
                      <span className="text-[7px] text-blue-200 font-bold block">
                        SISTEM PRESENSI DIGITAL RFID & QR
                      </span>
                    </div>
                  </div>
                  <span className="text-[7.5px] font-mono font-bold bg-red-600 text-white px-1.5 py-0.5 rounded shrink-0">
                    RFID & QR
                  </span>
                </div>

                <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                {/* Body */}
                <div className="p-3 flex items-center justify-between space-x-3 bg-white flex-1">
                  <div className="w-16 h-20 rounded-lg bg-slate-100 border border-slate-300 overflow-hidden shrink-0 flex flex-col items-center justify-center">
                    {selectedStudentForQr.photo ? (
                      <img src={selectedStudentForQr.photo} alt={selectedStudentForQr.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-blue-900/40" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1 text-left">
                    <div className="text-[7px] uppercase tracking-wider text-red-600 font-black">NAMA SISWA</div>
                    <div className="text-xs font-black truncate text-blue-950 leading-tight">{selectedStudentForQr.fullName}</div>
                    <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                      <div>
                        <span className="text-slate-500 font-bold">NISN:</span>{' '}
                        <span className="font-mono font-black text-blue-900">{selectedStudentForQr.nisn}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">Kelas:</span>{' '}
                        <span className="font-extrabold text-red-600 bg-red-50 px-1 py-0.2 rounded border border-red-200">{selectedStudentForQr.currentClass}</span>
                      </div>
                    </div>
                  </div>

                  {/* High Res QR Code SVG */}
                  <div className="bg-white p-1 rounded-lg border-2 border-blue-900 shadow-2xs flex flex-col items-center justify-center shrink-0">
                    <QRCodeSVG
                      value={selectedStudentForQr.rfidTag || selectedStudentForQr.nisn}
                      size={52}
                      level="H"
                      fgColor="#1e3a8a"
                      bgColor="#ffffff"
                    />
                    <span className="text-[6.5px] font-mono font-black text-blue-900 mt-0.5">SCAN ME</span>
                  </div>
                </div>

                {/* Footer Barcode */}
                <div className="bg-slate-50 border-t border-slate-200 px-3 py-1 flex items-center justify-between text-[8px] text-blue-950 font-mono">
                  <div className="flex items-center space-x-1 font-bold text-red-700">
                    <QrCode className="w-3.5 h-3.5 text-blue-900" />
                    <span>QR-RFID-{selectedStudentForQr.nisn}</span>
                  </div>
                  <span className="font-sans font-black text-[7.5px] text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">VALIDATED</span>
                </div>
              </div>

              {/* QR Code Payload Value */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center w-full space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Payload Data Terenskripsi QR:</span>
                <p className="font-mono text-xs font-black text-blue-900 select-all bg-white p-2 rounded-xl border border-slate-200">
                  {selectedStudentForQr.rfidTag || selectedStudentForQr.nisn}
                </p>
              </div>

              {/* Data Pengesahan Kepsek */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 w-full flex items-center justify-between text-left">
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Lembaga / Sekolah</div>
                  <div className="text-xs font-black text-blue-900">{settings.schoolName || 'SMP Negeri 1'}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Kota: {settings.city || '-'}</div>
                </div>
                <div className="text-right border-l border-slate-200 pl-3 relative">
                  <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Mengetahui Kepala Sekolah</div>
                  
                  {/* Visual Signature & Stamp Display */}
                  <div className="h-8 my-0.5 relative flex items-center justify-end">
                    {settings.schoolStamp && (
                      <img
                        src={settings.schoolStamp}
                        alt="Cap Sekolah"
                        className="absolute right-6 top-1/2 -translate-y-1/2 h-9 w-9 object-contain opacity-85 pointer-events-none"
                      />
                    )}
                    {settings.principalSignature && (
                      <img
                        src={settings.principalSignature}
                        alt="TTD Kepsek"
                        className="relative z-10 h-7 max-w-[90px] object-contain pointer-events-none"
                      />
                    )}
                  </div>

                  <div className="text-xs font-black text-slate-900">{settings.principalName || 'Dr. H. Ahmad Wijaya, M.Pd.'}</div>
                  <div className="text-[10px] font-mono font-extrabold text-blue-900">NIP. {settings.principalNip || '19750812 199903 1 002'}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
                <span>Cetak / Print QR Kartu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
