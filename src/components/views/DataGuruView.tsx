import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherPosition } from '../../types';
import { exportToExcel } from '../../utils/excelExport';
import * as XLSX from 'xlsx';
import {
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  KeyRound,
  Save,
  Search,
  CheckCircle2,
  Phone,
  Briefcase,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const DataGuruView: React.FC = () => {
  const {
    teachers,
    addTeacher,
    importTeachers,
    generateMassTeacherAccounts,
    deleteTeacher,
  } = useApp();

  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  // Form state
  const [fullNameWithTitle, setFullNameWithTitle] = useState('');
  const [nip, setNip] = useState('');
  const [position, setPosition] = useState<TeacherPosition>('Guru Mapel');
  const [phone, setPhone] = useState('');

  // Excel Import States
  const [importFileName, setImportFileName] = useState<string>('');
  const [parsedImportData, setParsedImportData] = useState<
    Array<{ fullNameWithTitle: string; nip: string; position: TeacherPosition; phone?: string }>
  >([]);
  const [importError, setImportError] = useState<string>('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameWithTitle.trim() || !nip.trim()) return;
    addTeacher(fullNameWithTitle.trim(), nip.trim(), position, phone);
    setFullNameWithTitle('');
    setNip('');
    setPhone('');
    setShowManualModal(false);
    showNotice(`Guru ${fullNameWithTitle} berhasil ditambahkan!`);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Nama Lengkap Beserta Gelar': 'Drs. H. Ahmad Dahlan, M.Pd',
        NIP: '19750812 200003 1 002',
        'Jabatan (Guru Mapel / Wali Kelas / Guru BK / Kepala Sekolah)': 'Guru Mapel',
        'No Telepon / WhatsApp': '081234567890',
      },
      {
        'Nama Lengkap Beserta Gelar': 'Siti Rahmawati, S.Pd',
        NIP: '19820514 200801 2 005',
        'Jabatan (Guru Mapel / Wali Kelas / Guru BK / Kepala Sekolah)': 'Wali Kelas',
        'No Telepon / WhatsApp': '081987654321',
      },
    ];
    exportToExcel(templateData, 'Template_Import_Data_Guru', 'Template Data Guru');
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
              findVal(['nama lengkap', 'nama guru', 'nama', 'fullname', 'gelar']) || '';
            const nipVal =
              findVal(['nip', 'nuptk', 'no induk', 'id']) ||
              `198${Math.floor(100000 + Math.random() * 900000)} 201${Math.floor(100000 + Math.random() * 900000)}`;

            const posRaw = findVal(['jabatan', 'position', 'tugas', 'role']);
            let posVal: TeacherPosition = 'Guru Mapel';
            if (posRaw.toLowerCase().includes('wali')) posVal = 'Wali Kelas';
            else if (posRaw.toLowerCase().includes('bk') || posRaw.toLowerCase().includes('konseling')) posVal = 'Guru BK';
            else if (posRaw.toLowerCase().includes('kepala') || posRaw.toLowerCase().includes('kepsek')) posVal = 'Kepala Sekolah';

            const phoneVal = findVal(['telepon', 'phone', 'wa', 'hp', 'kontak']) || '081234567890';

            return {
              fullNameWithTitle: nameVal,
              nip: nipVal,
              position: posVal,
              phone: phoneVal,
            };
          })
          .filter((row) => row.fullNameWithTitle.length > 0);

        if (parsedRows.length === 0) {
          setImportError('Tidak ada baris data guru yang valid dalam berkas ini.');
          setParsedImportData([]);
        } else {
          setParsedImportData(parsedRows);
        }
      } catch (err) {
        console.error('Error reading Excel file:', err);
        setImportError('Gagal membaca berkas Excel. Pastikan format file .xlsx atau .csv');
        setParsedImportData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessImport = () => {
    if (parsedImportData.length === 0) {
      const mock = [
        { fullNameWithTitle: 'Dra. Hj. Nurhayati, M.Pd', nip: '19780112 200212 2 004', position: 'Guru Mapel' as TeacherPosition, phone: '081234567890' },
        { fullNameWithTitle: 'Agus Subagyo, S.Kom', nip: '19890405 201402 1 003', position: 'Guru Mapel' as TeacherPosition, phone: '081987654321' },
      ];
      importTeachers(mock);
      setShowImportModal(false);
      resetImportState();
      showNotice('2 data guru demo berhasil diimpor!');
      return;
    }

    importTeachers(parsedImportData);
    setShowImportModal(false);
    showNotice(`${parsedImportData.length} data tenaga pendidik / guru berhasil diimpor!`);
    resetImportState();
  };

  const resetImportState = () => {
    setImportFileName('');
    setParsedImportData([]);
    setImportError('');
  };

  const handleMassAccount = () => {
    generateMassTeacherAccounts();
    showNotice('Akun login massal untuk seluruh guru berhasil dibuat!');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullNameWithTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.includes(searchQuery) ||
      t.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Data Tenaga Pendidik / Guru</h2>
            <p className="text-xs text-slate-500 font-medium">Manajemen master pendidik, NIP, jabatan tugas tambahan, dan akses login</p>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Generate Akun Masal */}
          <button
            onClick={handleMassAccount}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Generate Akun Masal</span>
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

      {/* Table & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama guru beserta gelar, NIP, atau jabatan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Table Guru */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Lengkap Beserta Gelar</th>
                <th className="p-3">NIP</th>
                <th className="p-3">Jabatan (Dropdown)</th>
                <th className="p-3">Kontak WA / HP</th>
                <th className="p-3 text-center">Aksi / Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-black flex items-center justify-center text-xs shrink-0">
                      {t.fullNameWithTitle.charAt(0)}
                    </div>
                    <span>{t.fullNameWithTitle}</span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-600">{t.nip}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center space-x-1 ${
                        t.position === 'Kepala Sekolah'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : t.position === 'Guru BK'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : t.position === 'Wali Kelas'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Briefcase className="w-3 h-3" />
                      <span>{t.position}</span>
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    <span className="inline-flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{t.phone || '08123456789'}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus data guru "${t.fullNameWithTitle}"?`)) {
                          deleteTeacher(t.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Guru Ini"
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
              <span>Tambah Data Guru Manual</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Nama Lengkap Beserta Gelar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Beserta Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullNameWithTitle}
                  onChange={(e) => setFullNameWithTitle(e.target.value)}
                  placeholder="Contoh: Drs. H. Suryono, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* NIP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIP / NUPTK <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Format: 19820315 200801 1 005"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Jabatan Dropdown (Guru Mapel, Wali Kelas, Guru BK, Kepala Sekolah) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jabatan (Dropdown) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as TeacherPosition)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Guru Mapel">Guru Mapel</option>
                  <option value="Wali Kelas">Wali Kelas</option>
                  <option value="Guru BK">Guru BK</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                </select>
              </div>

              {/* Kontak */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  <span>Simpan Data Guru</span>
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
                <span>Import Data Tenaga Pendidik / Guru via Excel</span>
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
                Header: <span className="font-bold text-indigo-600">Nama Lengkap Beserta Gelar</span> |{' '}
                <span className="font-bold text-indigo-600">NIP</span> |{' '}
                <span className="font-bold text-indigo-600">Jabatan</span> |{' '}
                <span className="font-bold text-indigo-600">No. Telepon</span>
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
                    'Klik atau tarik file Excel / CSV data guru ke sini'
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mendukung format .xlsx, .xls, atau .csv
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
                  <span>Pratinjau Data Terbaca ({parsedImportData.length} Guru):</span>
                  <span className="text-[11px] text-emerald-600">Siap Diimpor</span>
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 font-bold text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2">Nama & Gelar</th>
                        <th className="p-2">NIP</th>
                        <th className="p-2">Jabatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {parsedImportData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">{row.fullNameWithTitle}</td>
                          <td className="p-2 font-mono">{row.nip}</td>
                          <td className="p-2">{row.position}</td>
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
                      ? `Proses Import (${parsedImportData.length} Guru)`
                      : 'Proses Import Guru'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
