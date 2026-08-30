import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/excelExport';
import * as XLSX from 'xlsx';
import {
  School,
  FileSpreadsheet,
  Plus,
  Save,
  Users,
  CheckCircle2,
  Upload,
  Trash2,
  AlertCircle,
  Download,
  FileText,
} from 'lucide-react';

export const DataKelasView: React.FC = () => {
  const { classes, addClass, importClasses, deleteClass, clearAllClasses, teachers, academicYears } = useApp();
  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const activeAY = academicYears.find((y) => y.isActive) || academicYears[0];

  // Manual Form
  const [className, setClassName] = useState('');
  const [homeroomTeacher, setHomeroomTeacher] = useState(teachers[0]?.fullNameWithTitle || 'Budi Santoso, M.Pd');
  const [academicYear, setAcademicYear] = useState(activeAY?.yearName || '2026/2027');

  // Excel Import States
  const [importFileName, setImportFileName] = useState<string>('');
  const [parsedImportData, setParsedImportData] = useState<
    Array<{ className: string; homeroomTeacher: string; academicYear: string }>
  >([]);
  const [importError, setImportError] = useState<string>('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    addClass(className.trim(), homeroomTeacher, academicYear);
    setClassName('');
    setShowManualModal(false);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Nama Kelas': 'X MIPA 1',
        'Wali Kelas': teachers[0]?.fullNameWithTitle || 'Drs. H. Budi Santoso, M.Pd',
        'Tahun Ajaran': activeAY?.yearName || '2026/2027',
      },
      {
        'Nama Kelas': 'XI IPS 2',
        'Wali Kelas': teachers[1]?.fullNameWithTitle || 'Siti Rahmawati, S.Pd',
        'Tahun Ajaran': activeAY?.yearName || '2026/2027',
      },
    ];
    exportToExcel(templateData, 'Template_Import_Data_Kelas', 'Template Data Kelas');
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

            const classVal =
              findVal(['nama kelas', 'kelas', 'class', 'rombel']) || '';
            const teacherVal =
              findVal(['wali kelas', 'wali', 'guru', 'homeroom']) ||
              teachers[0]?.fullNameWithTitle ||
              'Belum Ditentukan';
            const ayVal =
              findVal(['tahun ajaran', 'tahun', 'ta', 'academic year']) ||
              activeAY?.yearName ||
              '2026/2027';

            return {
              className: classVal,
              homeroomTeacher: teacherVal,
              academicYear: ayVal,
            };
          })
          .filter((row) => row.className.length > 0);

        if (parsedRows.length === 0) {
          setImportError('Tidak ada baris data kelas yang valid dalam berkas ini.');
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
      const mockImport = [
        { className: 'XI MIPA 2', homeroomTeacher: 'Siti Aminah, S.Pd', academicYear: activeAY.yearName },
        { className: 'XII IPS 2', homeroomTeacher: 'Drs. Bambang Hidayat', academicYear: activeAY.yearName },
      ];
      importClasses(mockImport);
      setShowImportModal(false);
      resetImportState();
      return;
    }

    importClasses(parsedImportData);
    setShowImportModal(false);
    resetImportState();
  };

  const resetImportState = () => {
    setImportFileName('');
    setParsedImportData([]);
    setImportError('');
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kelas "${name}"?`)) {
      deleteClass(id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin MENGOSONGKAN SELURUH data kelas? Action ini tidak dapat dibatalkan.')) {
      clearAllClasses();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Data Rombongan Belajar / Kelas</h2>
            <p className="text-xs text-slate-500 font-medium">Kelola daftar kelas, wali kelas penanggungjawab, dan kapasitas murid</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {classes.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-95 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Kosongkan Semua Data Kelas"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Kosongkan Semua Kelas</span>
            </button>
          )}

          {/* Menu Import Excel */}
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
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Grid Kelas Cards */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">Data Kelas Masih Kosong</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Seluruh data kelas telah dikosongkan. Silakan tambahkan kelas baru atau import dari file Excel.
            </p>
          </div>
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-100">
                  TA {c.academicYear}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-slate-500 text-xs font-bold">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{c.studentCount || 0} Siswa</span>
                  </div>

                  <button
                    onClick={() => handleDeleteClass(c.id, c.className)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Kelas Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{c.className}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Wali Kelas: <span className="font-bold text-slate-700">{c.homeroomTeacher}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Tambah Data Kelas Manual</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Nama Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Contoh: X IPA 3 / XI IPS 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Wali Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Wali Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={homeroomTeacher}
                  onChange={(e) => setHomeroomTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.fullNameWithTitle}>
                      {t.fullNameWithTitle} ({t.nip})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tahun Ajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.yearName}>
                      {ay.yearName} ({ay.semester})
                    </option>
                  ))}
                </select>
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
                  <span>Simpan Data Kelas</span>
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
                <span>Import Data Rombongan Belajar / Kelas via Excel</span>
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
                Header: <span className="font-bold text-indigo-600">Nama Kelas</span> |{' '}
                <span className="font-bold text-indigo-600">Wali Kelas</span> |{' '}
                <span className="font-bold text-indigo-600">Tahun Ajaran</span>
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
                    'Klik atau tarik file Excel / CSV data kelas ke sini'
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
                  <span>Pratinjau Data Terbaca ({parsedImportData.length} Kelas):</span>
                  <span className="text-[11px] text-emerald-600">Siap Diimpor</span>
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 font-bold text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2">Nama Kelas</th>
                        <th className="p-2">Wali Kelas</th>
                        <th className="p-2">Tahun Ajaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {parsedImportData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">{row.className}</td>
                          <td className="p-2">{row.homeroomTeacher}</td>
                          <td className="p-2 font-mono text-cyan-700">{row.academicYear}</td>
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
                      ? `Proses Import (${parsedImportData.length} Kelas)`
                      : 'Proses Import Kelas'}
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
