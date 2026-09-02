import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/excelExport';
import { Library, ScanBarcode, BookMarked, Download, Plus, QrCode, CheckCircle2, Search, Trash2, Pencil, BookOpen, Save, X } from 'lucide-react';
import { LibraryBook } from '../../types';

export const PerpustakaanView: React.FC = () => {
  const {
    activeTab,
    libraryTAPs,
    libraryBooks,
    addLibraryTAP,
    deleteLibraryTAP,
    clearAllLibraryTAPs,
    addLibraryBook,
    updateLibraryBook,
    deleteLibraryBook,
    students,
  } = useApp();

  const getSubTabFromActiveTab = (tab: string): 'harian' | 'katalog' | 'tap' | 'rekap' => {
    if (tab === 'tap-perpus') return 'tap';
    if (tab === 'rekap-perpus') return 'rekap';
    if (tab === 'katalog-perpus') return 'katalog';
    return 'harian';
  };

  const [activeSubTab, setActiveSubTab] = useState<'harian' | 'katalog' | 'tap' | 'rekap'>(() => getSubTabFromActiveTab(activeTab));

  useEffect(() => {
    if (activeTab === 'perpus-harian' || activeTab === 'tap-perpus' || activeTab === 'rekap-perpus' || activeTab === 'perpustakaan' || activeTab === 'katalog-perpus') {
      setActiveSubTab(getSubTabFromActiveTab(activeTab));
    }
  }, [activeTab]);

  // Book Catalog Modal States
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);

  // Add Book Form
  const [bookBarcode, setBookBarcode] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCategory, setBookCategory] = useState('Fiksi');
  const [bookStock, setBookStock] = useState(5);

  // Edit Book Form
  const [editBookBarcode, setEditBookBarcode] = useState('');
  const [editBookTitle, setEditBookTitle] = useState('');
  const [editBookAuthor, setEditBookAuthor] = useState('');
  const [editBookCategory, setEditBookCategory] = useState('Fiksi');
  const [editBookStock, setEditBookStock] = useState(5);

  // TAP Perpus State
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [tapType, setTapType] = useState<'Masuk Perpus' | 'Pinjam Buku' | 'Pengembalian Buku'>('Masuk Perpus');
  const [selectedBookBarcode, setSelectedBookBarcode] = useState(libraryBooks[0]?.barcode || 'BK-9901');
  const [tapNotice, setTapNotice] = useState('');

  // Barcode Generator State
  const [newBarcodeText, setNewBarcodeText] = useState('BK-9904');
  const [generatedBarcode, setGeneratedBarcode] = useState('');

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookBarcode.trim() || !bookTitle.trim()) return;
    addLibraryBook({
      barcode: bookBarcode.trim(),
      title: bookTitle.trim(),
      author: bookAuthor.trim(),
      category: bookCategory,
      stock: Number(bookStock) || 1,
    });
    setBookBarcode('');
    setBookTitle('');
    setBookAuthor('');
    setShowAddBookModal(false);
  };

  const handleEditBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !editBookBarcode.trim() || !editBookTitle.trim()) return;
    updateLibraryBook(editingBook.id, {
      barcode: editBookBarcode.trim(),
      title: editBookTitle.trim(),
      author: editBookAuthor.trim(),
      category: editBookCategory,
      stock: Number(editBookStock) || 0,
    });
    setEditingBook(null);
  };

  const handleTapPerpusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find((s) => s.id === selectedStudent);
    const bk = libraryBooks.find((b) => b.barcode === selectedBookBarcode);
    if (!std) return;

    addLibraryTAP(std.id, tapType, bk?.barcode, bk?.title);
    setTapNotice(`TAP Perpus Berhasil: ${std.fullName} - ${tapType}`);
    setTimeout(() => setTapNotice(''), 3000);
  };

  const handleGenerateBarcode = () => {
    setGeneratedBarcode(newBarcodeText.trim());
  };

  const handleDownloadRekapPerpus = (period: 'Mingguan' | 'Bulanan' | 'Semester') => {
    const data = libraryTAPs.map((t) => ({
      ID: t.id,
      Siswa: t.studentName,
      Kelas: t.class,
      Waktu: t.timestamp,
      'Jenis Aktivitas': t.type,
      'Kode Barcode Buku': t.barcodeBook || '-',
      'Judul Buku': t.bookTitle || '-',
      'Periode Rekap': period,
    }));
    exportToExcel(data, `Rekap_Perpustakaan_${period}_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Presensi & TAP Perpustakaan</h2>
            <p className="text-xs text-slate-500 font-medium">Scan barcode perpustakaan harian, cetak barcode buku/kartu, dan ekspor rekapitulasi</p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('harian')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'harian' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Perpustakaan Harian
          </button>
          <button
            onClick={() => setActiveSubTab('katalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'katalog' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Katalog Buku
          </button>
          <button
            onClick={() => setActiveSubTab('tap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'tap' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TAP Perpus & Barcode
          </button>
          <button
            onClick={() => setActiveSubTab('rekap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'rekap' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekap Perpustakaan
          </button>
        </div>
      </div>

      {tapNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{tapNotice}</span>
        </div>
      )}

      {/* Sub Tab 1: Perpustakaan Harian */}
      {activeSubTab === 'harian' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
              <Library className="w-4 h-4 text-pink-600" />
              <span>Kunjungan Perpustakaan Hari Ini ({libraryTAPs.length} Log)</span>
            </h3>
            {libraryTAPs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`⚠️ Apakah Anda yakin ingin mengosongkan SELURUH (${libraryTAPs.length}) riwayat log TAP perpustakaan?`)) {
                    clearAllLibraryTAPs();
                  }
                }}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                title="Hapus / Kosongkan Log Perpustakaan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Log</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Siswa & Kelas</th>
                  <th className="p-3">Waktu Kunjungan</th>
                  <th className="p-3">Jenis Aktivitas</th>
                  <th className="p-3">Detail Buku</th>
                  <th className="p-3 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {libraryTAPs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{t.studentName}</div>
                      <span className="text-[10px] text-slate-500 font-normal">Kelas {t.class}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{t.timestamp}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-800 font-extrabold text-[11px] border border-pink-100">
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {t.bookTitle ? (
                        <div>
                          <span className="font-bold text-slate-900">{t.bookTitle}</span> ({t.barcodeBook})
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm('Hapus log TAP perpus ini?')) {
                            deleteLibraryTAP(t.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Log TAP"
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
      )}

      {/* Sub Tab Katalog Buku */}
      {activeSubTab === 'katalog' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Katalog Buku Perpustakaan ({libraryBooks.length} Judul)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Daftar koleksi buku, barcode, kategori, stok, dan opsi edit data</p>
            </div>
            <button
              onClick={() => {
                setBookBarcode(`BK-${Math.floor(1000 + Math.random() * 9000)}`);
                setShowAddBookModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Buku</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Kode Barcode</th>
                  <th className="p-3">Judul Buku</th>
                  <th className="p-3">Pengarang / Penulis</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-center">Stok</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {libraryBooks.length > 0 ? (
                  libraryBooks.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-700">{b.barcode}</td>
                      <td className="p-3 font-bold text-slate-900">{b.title}</td>
                      <td className="p-3 text-slate-600">{b.author || '-'}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {b.category}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">{b.stock}</td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingBook(b);
                            setEditBookBarcode(b.barcode);
                            setEditBookTitle(b.title);
                            setEditBookAuthor(b.author);
                            setEditBookCategory(b.category);
                            setEditBookStock(b.stock);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Buku Ini"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus buku "${b.title}" (${b.barcode})?`)) {
                              deleteLibraryBook(b.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Buku"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      Belum ada data koleksi buku.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab 2: TAP Perpus & Buat Barcode */}
      {activeSubTab === 'tap' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Menu Scan & TAP Barcode Perpus */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
              <ScanBarcode className="w-4 h-4 text-purple-600" />
              <span>Menu Scan Barcode & TAP Perpus</span>
            </h3>

            <form onSubmit={handleTapPerpusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Siswa (Scan Kartu)
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.currentClass})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tipe Aktivitas Perpus</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Masuk Perpus', 'Pinjam Buku', 'Pengembalian Buku'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTapType(t)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        tapType === t
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {tapType !== 'Masuk Perpus' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Buku (Barcode)</label>
                  <select
                    value={selectedBookBarcode}
                    onChange={(e) => setSelectedBookBarcode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {libraryBooks.map((b) => (
                      <option key={b.id} value={b.barcode}>
                        [{b.barcode}] {b.title} - {b.author}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-200 transition-all cursor-pointer"
              >
                Proses TAP / Scan Barcode Perpustakaan
              </button>
            </form>
          </div>

          {/* Buat Barcode Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-purple-600" />
              <span>Buat Barcode Siswa / Buku Perpustakaan</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Input Kode Barcode Baru</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newBarcodeText}
                    onChange={(e) => setNewBarcodeText(e.target.value)}
                    placeholder="Contoh: BK-9904"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                  <button
                    onClick={handleGenerateBarcode}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Generate Barcode
                  </button>
                </div>
              </div>

              {/* Barcode Visual Box */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Preview Barcode ISO</span>
                <div className="py-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-1">
                  <div className="flex items-center space-x-1 tracking-widest text-slate-900 font-mono text-xl font-bold">
                    ||| | |||| | || ||| |||| |
                  </div>
                  <span className="font-mono font-extrabold text-sm text-slate-800 tracking-widest">
                    *{generatedBarcode || newBarcodeText}*
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Siap dicetak pada stiker barcode buku atau Kartu Anggota Perpustakaan.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 3: Rekap Perpustakaan & Download Excel */}
      {activeSubTab === 'rekap' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2">
                <BookMarked className="w-5 h-5 text-sky-600" />
                <span>Rekapitulasi Data Perpustakaan</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Data rekapan perminggu, perbulan dan persemester dalam bentuk tabel & Excel</p>
            </div>

            {/* Direct Excel Download Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownloadRekapPerpus('Mingguan')}
                className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekap Mingguan</span>
              </button>
              <button
                onClick={() => handleDownloadRekapPerpus('Bulanan')}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekap Bulanan</span>
              </button>
              <button
                onClick={() => handleDownloadRekapPerpus('Semester')}
                className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekap Semester</span>
              </button>
            </div>
          </div>

          {/* Tabel Rekap */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Siswa & Kelas</th>
                  <th className="p-3">Timestamp Waktu</th>
                  <th className="p-3">Jenis TAP</th>
                  <th className="p-3">Barcode Buku</th>
                  <th className="p-3">Judul Buku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {libraryTAPs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{t.studentName} ({t.class})</td>
                    <td className="p-3 font-mono">{t.timestamp}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{t.barcodeBook || '-'}</td>
                    <td className="p-3">{t.bookTitle || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Buku Baru */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Tambah Buku Koleksi Baru</h3>
              </div>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kode Barcode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookBarcode}
                  onChange={(e) => setBookBarcode(e.target.value)}
                  placeholder="Contoh: BK-9904"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Buku <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Contoh: Laskar Pelangi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pengarang / Penulis
                </label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="Contoh: Andrea Hirata"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kategori</label>
                  <select
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Fiksi">Fiksi</option>
                    <option value="Non-Fiksi">Non-Fiksi</option>
                    <option value="Sains">Sains & Matematika</option>
                    <option value="Sejarah">Sejarah</option>
                    <option value="Pelajaran">Buku Paket Pelajaran</option>
                    <option value="Ensiklopedia">Ensiklopedia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    min="1"
                    value={bookStock}
                    onChange={(e) => setBookStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Buku</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Buku */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Edit Data Buku Koleksi</h3>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kode Barcode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editBookBarcode}
                  onChange={(e) => setEditBookBarcode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Buku <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editBookTitle}
                  onChange={(e) => setEditBookTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pengarang / Penulis
                </label>
                <input
                  type="text"
                  value={editBookAuthor}
                  onChange={(e) => setEditBookAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kategori</label>
                  <select
                    value={editBookCategory}
                    onChange={(e) => setEditBookCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="Fiksi">Fiksi</option>
                    <option value="Non-Fiksi">Non-Fiksi</option>
                    <option value="Sains">Sains & Matematika</option>
                    <option value="Sejarah">Sejarah</option>
                    <option value="Pelajaran">Buku Paket Pelajaran</option>
                    <option value="Ensiklopedia">Ensiklopedia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={editBookStock}
                    onChange={(e) => setEditBookStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 cursor-pointer flex items-center space-x-1.5"
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
