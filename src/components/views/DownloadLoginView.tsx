import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/excelExport';
import {
  Download,
  User,
  Lock,
  Users,
  School,
  UserCheck,
  Clock,
  Sparkles,
  Plus,
  Search,
  Printer,
  UserCog,
  LogIn,
  LogOut,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  BookOpenCheck,
  Laptop,
  Library,
  GraduationCap,
  CheckCircle,
} from 'lucide-react';

export const DownloadLoginView: React.FC = () => {
  const {
    currentUser,
    login,
    logout,
    users,
    addUser,
    students,
    teachers,
    classes,
    attendanceRecords,
    teacherJournals,
    computerAttendances,
    libraryTAPs,
    violationRecords,
    settings,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'download' | 'login'>('download');
  
  // Custom login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Create User state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'guru' | 'siswa'>('guru');
  const [newAccess, setNewAccess] = useState('Staf Pengajar');
  const [newEmail, setNewEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Download center state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');

  // ID Card printing state
  const [idCardSearch, setIdCardSearch] = useState('');
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<any>(null);

  // Notifications
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Login handler
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setLoginError('Username tidak boleh kosong!');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Search in user accounts list
    const found = users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (found) {
      login(found);
      setLoginError('');
      setUsername('');
      setPassword('');
      showNotice(`Selamat datang kembali, ${found.name}!`);
      return;
    }

    // 2. Search dynamically in students list by NISN or name format (lowercase, no spaces)
    const studentFound = students.find((s) => {
      const cleanName = s.fullName.toLowerCase().replace(/\s+/g, '');
      return (s.nisn && s.nisn === username.trim()) || (cleanName === cleanUsername);
    });

    if (studentFound) {
      const studentUser = {
        id: `u-std-${studentFound.id}`,
        username: studentFound.nisn || studentFound.fullName.toLowerCase().replace(/\s+/g, ''),
        name: studentFound.fullName,
        role: 'siswa' as const,
        accessLevel: 'Siswa / Murid',
        status: 'Aktif' as const,
        email: `${studentFound.nisn || 'siswa'}@siswa.sch.id`,
      };
      login(studentUser);
      setLoginError('');
      setUsername('');
      setPassword('');
      showNotice(`Selamat datang, siswa ${studentFound.fullName}!`);
      return;
    }

    // 3. Fallback admin login
    if (cleanUsername === 'admin') {
      login(users[0]);
      setLoginError('');
      setUsername('');
      setPassword('');
      showNotice(`Selamat datang kembali, ${users[0].name}!`);
      return;
    }

    setLoginError('Username / NISN tidak terdaftar! Silakan coba lagi.');
  };

  // Add user handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      showNotice('Username dan nama lengkap harus diisi!');
      return;
    }

    // Check if user already exists
    const exists = users.some((u) => u.username.toLowerCase() === newUsername.trim().toLowerCase());
    if (exists) {
      showNotice('Username sudah digunakan! Gunakan username lain.');
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      name: newName.trim(),
      role: newRole,
      accessLevel: newAccess,
      status: 'Aktif' as const,
      email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@sekolah.id`,
    };

    addUser(newUser);
    setSuccessMsg(`User "${newName}" berhasil dibuat! Akun siap digunakan untuk login.`);
    setNewUsername('');
    setNewName('');
    setNewEmail('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Download methods
  const downloadMasterSiswa = () => {
    if (students.length === 0) {
      showNotice('Data siswa kosong!');
      return;
    }
    const data = students.map((s) => ({
      NISN: s.nisn,
      Nama: s.fullName,
      Kelas: s.currentClass,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
      'Kartu RFID': s.rfidTag || '-',
      'QR Code': s.qrCode || '-',
      'Wajah Terdaftar': s.isFaceRegistered ? 'Ya' : 'Belum',
      Status: s.status,
    }));
    exportToExcel(data, 'Master_Data_Siswa_Sekolah', 'Siswa');
    showNotice('Berhasil mengunduh Master Data Siswa!');
  };

  const downloadMasterGuru = () => {
    if (teachers.length === 0) {
      showNotice('Data guru kosong!');
      return;
    }
    const data = teachers.map((t) => ({
      NIP: t.nip,
      Nama: t.fullNameWithTitle,
      Jabatan: t.position,
      'Mata Pelajaran': t.subject || '-',
      Email: t.email || '-',
      Telepon: t.phone || '-',
    }));
    exportToExcel(data, 'Master_Data_Guru_Sekolah', 'Guru');
    showNotice('Berhasil mengunduh Master Data Guru!');
  };

  const downloadMasterKelas = () => {
    if (classes.length === 0) {
      showNotice('Data kelas kosong!');
      return;
    }
    const data = classes.map((c) => ({
      'Nama Kelas': c.className,
      'Wali Kelas': c.homeroomTeacher || '-',
      'Tahun Ajaran': c.academicYear,
    }));
    exportToExcel(data, 'Master_Data_Kelas', 'Kelas');
    showNotice('Berhasil mengunduh Master Data Kelas!');
  };

  const downloadPresensiHarian = () => {
    const filtered = attendanceRecords.filter((r) => {
      const matchDate = !selectedDate || r.date === selectedDate;
      const matchClass = selectedClass === 'Semua Kelas' || r.class === selectedClass;
      return matchDate && matchClass;
    });

    if (filtered.length === 0) {
      showNotice(`Tidak ada data presensi pada tanggal ${selectedDate} kelas ${selectedClass}`);
      return;
    }

    const data = filtered.map((r) => ({
      Tanggal: r.date,
      Nama: r.studentName,
      Kelas: r.class,
      'Status Akhir': r.statusFinal,
      'Status Masuk': r.statusIn,
      'Jam Masuk': r.timeIn,
      'Jam Pulang': r.timeOut,
      'Metode Scan': r.tapMethod,
      Catatan: r.notes || '-',
    }));

    exportToExcel(data, `Rekap_Presensi_${selectedClass}_${selectedDate}`, 'Presensi Harian');
    showNotice(`Berhasil mengunduh Rekap Presensi Harian (${filtered.length} data)!`);
  };

  const downloadJurnalGuru = () => {
    if (teacherJournals.length === 0) {
      showNotice('Data jurnal guru kosong!');
      return;
    }
    const data = teacherJournals.map((j) => ({
      Tanggal: j.date,
      'Nama Guru': j.teacherName,
      'Mata Pelajaran': j.subject,
      'Kelas Sasaran': j.classTarget,
      Topik: j.topic,
      'Jam Pembelajaran': j.timeSlot,
      'Catatan / Jurnal': j.notes,
    }));
    exportToExcel(data, 'Jurnal_Mengajar_Guru_Lengkap', 'Jurnal Guru');
    showNotice('Berhasil mengunduh Jurnal Mengajar Guru!');
  };

  const downloadLesKomputer = () => {
    if (computerAttendances.length === 0) {
      showNotice('Data kehadiran les komputer kosong!');
      return;
    }
    const data = computerAttendances.map((c) => ({
      Tanggal: c.date,
      Topik: c.sessionTopic,
      NISN: c.nisn || '-',
      Siswa: c.studentName,
      Kelas: c.class,
      Status: c.status,
      'Jam Masuk': c.timeIn,
      'Terminal PC': c.pcNumber,
      'Nilai Tugas': c.taskScore ?? '-',
      'Catatan Tugas': c.taskNotes || '-',
      'Metode Presensi': c.tapMethod,
    }));
    exportToExcel(data, 'Rekap_Kehadiran_Les_Komputer', 'Les Komputer');
    showNotice('Berhasil mengunduh Laporan Les Komputer!');
  };

  const downloadLibraryVisits = () => {
    if (libraryTAPs.length === 0) {
      showNotice('Data perpustakaan masih kosong!');
      return;
    }
    const data = libraryTAPs.map((v) => ({
      Waktu: v.timestamp,
      Siswa: v.studentName,
      Kelas: v.class,
      Tipe: v.type,
      'Barcode Buku': v.barcodeBook || '-',
      'Judul Buku': v.bookTitle || '-',
    }));
    exportToExcel(data, 'Rekap_Perpustakaan_Lengkap', 'Perpustakaan');
    showNotice('Berhasil mengunduh Rekap Kunjungan & Layanan Perpustakaan!');
  };

  const downloadViolations = () => {
    if (violationRecords.length === 0) {
      showNotice('Data rekap pelanggaran kosong!');
      return;
    }
    const data = violationRecords.map((v) => ({
      Tanggal: v.date,
      Siswa: v.studentName,
      Kelas: v.class,
      Pelanggaran: v.ruleName,
      'Poin Pelanggaran': v.points,
      Sanksi: v.sanction,
      Pelapor: v.reporter,
    }));
    exportToExcel(data, 'Laporan_Pelanggaran_Siswa', 'Pelanggaran');
    showNotice('Berhasil mengunduh Rekap Pelanggaran!');
  };

  // ID Card printing helper
  const handleSearchCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardSearch.trim()) return;
    const q = idCardSearch.trim().toLowerCase();
    const found = students.find(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        s.rfidTag?.toLowerCase() === q
    );
    if (found) {
      setSelectedStudentForCard(found);
      setNotice(null);
    } else {
      showNotice('Siswa tidak ditemukan! Silakan cek kembali nama atau NISN.');
    }
  };

  const printIdCard = () => {
    const printContent = document.getElementById('printable-id-card');
    if (!printContent) return;
    const WinPrint = window.open('', '', 'width=900,height=650');
    if (WinPrint) {
      WinPrint.document.write(`
        <html>
          <head>
            <title>Cetak Kartu Presensi - ${selectedStudentForCard?.fullName}</title>
            <style>
              body { font-family: sans-serif; background-color: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
              .card { width: 350px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; display: flex; flex-col; justify-content: space-between; position: relative; overflow: hidden; page-break-inside: avoid; }
              .header { background: linear-gradient(135deg, #1e3a8a, #4f46e5); color: white; padding: 20px; text-align: center; }
              .header h2 { margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
              .header p { margin: 4px 0 0; font-size: 10px; opacity: 0.9; }
              .avatar-container { display: flex; justify-content: center; margin: 25px 0 15px; }
              .avatar { width: 100px; height: 100px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; color: #4f46e5; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); object-cover: true; }
              .info { text-align: center; padding: 0 20px; }
              .name { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }
              .details { font-size: 12px; color: #64748b; font-weight: 600; margin: 6px 0 0; }
              .meta-badge { display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-top: 10px; }
              .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; }
              .qr-mock { width: 55px; height: 55px; background: #0f172a; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 7px; color: white; font-weight: bold; text-align: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
              .rfid-meta { font-size: 10px; font-weight: bold; color: #64748b; }
              .rfid-meta span { display: block; color: #3b82f6; font-family: monospace; font-size: 11px; margin-top: 2px; }
              @media print {
                body { background: white; margin: 0; box-shadow: none; }
                .no-print { display: none; }
                .card { box-shadow: none; border: 1px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h2>${settings.appNameBranding || 'PRESENSI DIGITAL PRO'}</h2>
                <p>${settings.schoolName || 'SMP NEGERI INDONESIA'}</p>
              </div>
              <div>
                <div class="avatar-container">
                  ${
                    selectedStudentForCard?.photo
                      ? `<img src="${selectedStudentForCard.photo}" class="avatar" style="object-fit: cover;" />`
                      : `<div class="avatar">${selectedStudentForCard?.fullName.charAt(0)}</div>`
                  }
                </div>
                <div class="info">
                  <h3 class="name">${selectedStudentForCard?.fullName}</h3>
                  <p class="details">NISN: ${selectedStudentForCard?.nisn} &bull; Kelas ${selectedStudentForCard?.currentClass}</p>
                  <span class="meta-badge">KARTU PRESENSI RESMI</span>
                </div>
              </div>
              <div class="footer">
                <div class="rfid-meta">
                  RFID TAG NUMBER:
                  <span>${selectedStudentForCard?.rfidTag || 'KARTU-RFID-BELUM-TAP'}</span>
                </div>
                <div class="qr-mock" style="background-image: radial-gradient(#334155 20%, transparent 20%), radial-gradient(#334155 20%, transparent 20%); background-size: 6px 6px; background-position: 0 0, 3px 3px;">
                  QR ID<br />[${selectedStudentForCard?.nisn}]
                </div>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      WinPrint.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Toast Notice */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-950 text-white border border-indigo-700/50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-150">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold leading-relaxed">{notice}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-indigo-100/80 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-indigo-50/60 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Pusat Sesi, Akun & Unduh Laporan</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Manajemen sesi aktif pengguna, pendaftaran akun demo instan, ekspor laporan data akademik, serta cetak kartu presensi
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 max-w-sm relative z-10 shrink-0">
          <button
            onClick={() => setActiveSubTab('download')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === 'download'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-indigo-950 hover:bg-white/50'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Pusat Unduh Excel</span>
          </button>
          <button
            onClick={() => setActiveSubTab('login')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === 'login'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-indigo-950 hover:bg-white/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Akses & Akun Sesi</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'download' ? (
        /* ==================== PANEL UNDUH LAPORAN ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Laporan Presensi Harian Presisi */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Unduh Rekap Laporan Presensi Harian</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Pilih Tanggal Laporan:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Filter Kelas:
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Semua Kelas">Semua Kelas</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.className}>
                        Kelas {c.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-bold text-emerald-950">Data Siap Diekspor:</div>
                  <div className="text-slate-500">
                    Siswa terdaftar pada Kelas {selectedClass} per Tanggal {selectedDate}
                  </div>
                </div>
                <button
                  onClick={downloadPresensiHarian}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel Presensi</span>
                </button>
              </div>
            </div>

            {/* Grid Kartu Master Data & Kegiatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card: Unduh Data Master Utama */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <School className="w-4 h-4 text-blue-600" />
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Unduh Master Data</h4>
                </div>
                <p className="text-xs text-slate-400 font-medium">Export seluruh tabel data induk sekolah yang tersimpan di cloud database</p>
                <div className="space-y-2">
                  <button
                    onClick={downloadMasterSiswa}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/80 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span>Master Data Siswa</span>
                    </div>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black">
                      {students.length} Siswa
                    </span>
                  </button>

                  <button
                    onClick={downloadMasterGuru}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/80 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-teal-500" />
                      <span>Master Data Guru</span>
                    </div>
                    <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-black">
                      {teachers.length} Guru
                    </span>
                  </button>

                  <button
                    onClick={downloadMasterKelas}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/80 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <School className="w-4 h-4 text-cyan-500" />
                      <span>Master Data Kelas</span>
                    </div>
                    <span className="text-[10px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-black">
                      {classes.length} Kelas
                    </span>
                  </button>
                </div>
              </div>

              {/* Card: Unduh Kegiatan Khusus & Ekstrakurikuler */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <Laptop className="w-4 h-4 text-purple-600" />
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Laporan Kegiatan</h4>
                </div>
                <p className="text-xs text-slate-400 font-medium">Unduh laporan aktivitas harian, pembelajaran guru, laboratorium, & perpustakaan</p>
                <div className="space-y-2">
                  <button
                    onClick={downloadJurnalGuru}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/80 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpenCheck className="w-4 h-4 text-purple-500" />
                      <span>Jurnal Mengajar Guru</span>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-black">
                      {teacherJournals.length} Jurnal
                    </span>
                  </button>

                  <button
                    onClick={downloadLesKomputer}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/80 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <Laptop className="w-4 h-4 text-violet-500" />
                      <span>Absensi Les Komputer</span>
                    </div>
                    <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-black">
                      {computerAttendances.length} Absen
                    </span>
                  </button>

                  <button
                    onClick={downloadLibraryVisits}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/80 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <Library className="w-4 h-4 text-pink-500" />
                      <span>Kunjungan Perpustakaan</span>
                    </div>
                    <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-black">
                      {libraryTAPs.length} Log
                    </span>
                  </button>

                  <button
                    onClick={downloadViolations}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/80 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>Laporan Pelanggaran</span>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black">
                      {violationRecords.length} Kasus
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Generator ID Siswa */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Cetak Kartu Presensi Siswa</h3>
              </div>
              <p className="text-xs text-slate-400 font-medium">Cari siswa berdasarkan nama atau NISN untuk mencetak kartu fisik identitas RFID / QR Code presensi</p>
              
              <form onSubmit={handleSearchCard} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nama / NISN..."
                    value={idCardSearch}
                    onChange={(e) => setIdCardSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cari
                </button>
              </form>

              {/* ID Card Mock Layout Preview */}
              {selectedStudentForCard ? (
                <div className="space-y-4 pt-2">
                  <div className="border border-slate-200 rounded-2xl bg-slate-50 p-1">
                    {/* Outer frame */}
                    <div
                      id="printable-id-card"
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
                      style={{ height: '360px' }}
                    >
                      {/* Top bar branding */}
                      <div className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white px-4 py-3 text-center">
                        <h4 className="font-black text-[11px] leading-tight tracking-wider uppercase">
                          {settings.appNameBranding || 'PRESENSI DIGITAL PRO'}
                        </h4>
                        <span className="text-[8px] text-indigo-100 font-bold block truncate">
                          {settings.schoolName || 'SMP NEGERI INDONESIA'}
                        </span>
                      </div>

                      {/* Photo & Main Details */}
                      <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                        {selectedStudentForCard.photo ? (
                          <img
                            src={selectedStudentForCard.photo}
                            alt={selectedStudentForCard.fullName}
                            className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xl border-2 border-white shadow-md">
                            {selectedStudentForCard.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h5 className="font-extrabold text-slate-800 text-xs leading-tight">
                            {selectedStudentForCard.fullName}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            NISN: {selectedStudentForCard.nisn} &bull; Kelas {selectedStudentForCard.currentClass}
                          </p>
                        </div>
                      </div>

                      {/* Footer RFID mock & Qr Code */}
                      <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
                        <div className="text-[9px] font-bold text-slate-500">
                          RFID TAG:
                          <span className="font-mono text-blue-600 block text-[10px] mt-0.5">
                            {selectedStudentForCard.rfidTag || 'TIDAK-TERPASANG'}
                          </span>
                        </div>
                        <div
                          className="w-10 h-10 bg-slate-800 rounded-sm flex items-center justify-center text-[7px] text-white font-extrabold text-center"
                          style={{
                            backgroundImage:
                              'radial-gradient(#475569 20%, transparent 20%), radial-gradient(#475569 20%, transparent 20%)',
                            backgroundSize: '4px 4px',
                            backgroundPosition: '0 0, 2px 2px',
                          }}
                        >
                          QR CODE
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={printIdCard}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Kartu Sekarang (Print PDF)</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
                  Cari siswa di atas untuk melihat desain preview & cetak kartu identitas siswa.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ==================== PANEL SESI & LOGIN USER ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Profil Aktif / Logout */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <UserCog className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Status Sesi Aktif</h3>
              </div>

              {currentUser ? (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{currentUser.name}</h4>
                      <p className="text-xs text-indigo-600 font-bold capitalize mt-0.5">{currentUser.role} &bull; {currentUser.accessLevel}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                    <div className="flex justify-between">
                      <span>Username:</span>
                      <span className="font-bold text-slate-800">{currentUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status Akun:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                        Aktif / Terhubung
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hak Akses:</span>
                      <span className="font-bold text-indigo-700 capitalize">{currentUser.accessLevel}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Apakah Anda yakin ingin keluar dari sesi?')) {
                        logout();
                        showNotice('Sesi Anda telah berhasil diakhiri!');
                      }
                    }}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Sesi</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold space-y-2">
                  <p>Tidak ada pengguna aktif.</p>
                  <p className="text-[11px] text-slate-400">Silakan gunakan form login di sebelah kanan atau gunakan Masuk Cepat.</p>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Tengah: Ganti Akun / login form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <LogIn className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Ganti Pengguna / Login Akun Baru</h3>
              </div>

              {/* Quick Preset Login grid */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Ganti Sesi Cepat (Preset Demo):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {users.slice(0, 3).map((u) => {
                    const isActive = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          login(u);
                          showNotice(`Sesi diganti ke: ${u.name} (${u.role.toUpperCase()})`);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                          isActive
                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 w-12 h-12 bg-indigo-100/30 rounded-full group-hover:scale-110 transition-transform"></div>
                        <div className="font-extrabold text-xs text-slate-800 flex items-center justify-between">
                          <span className="capitalize">{u.role}</span>
                          {isActive && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 mt-1 truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{u.accessLevel}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manual Login Form */}
              <form onSubmit={handleManualLogin} className="pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Username / NIP / NISN</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username (admin, guru, dll)"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="•••••••• (Bebas untuk demo)"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
                    {loginError}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk Sesi Akun Ini</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Form Pendaftaran User Baru */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Daftarkan Pengguna Demo Baru (Create User)</h3>
              </div>
              <p className="text-xs text-slate-400 font-medium">Buat akun mock baru untuk ditambahkan ke daftar manajemen user sistem</p>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800">
                  ✓ {successMsg}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso, S.Pd"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Username Akses</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: budispd"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Role Pengguna</label>
                    <select
                      value={newRole}
                      onChange={(e) => {
                        const r = e.target.value as any;
                        setNewRole(r);
                        if (r === 'admin') setNewAccess('Super Administrator');
                        else if (r === 'guru') setNewAccess('Staf Pengajar');
                        else setNewAccess('Peserta Didik');
                      }}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="guru">Guru</option>
                      <option value="siswa">Siswa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Tingkat Hak Akses</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Staf Pengajar / Walikelas"
                      value={newAccess}
                      onChange={(e) => setNewAccess(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Email (Opsional)</label>
                    <input
                      type="email"
                      placeholder="budi@sekolah.id"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Daftarkan Pengguna Baru</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
