import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, UserAccount } from '../../types';
import { UserCog, UserPlus, Search, Save, Shield, CheckCircle2, Key, Trash2, Pencil, X, Printer } from 'lucide-react';

export const ManajemenUserView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, settings, academicYears } = useApp();
  const [filterRole, setFilterRole] = useState<'All' | 'admin' | 'guru' | 'siswa'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Print Modal states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printSearch, setPrintSearch] = useState('');
  const [printRole, setPrintRole] = useState<'All' | 'admin' | 'guru' | 'siswa'>('All');

  // Form states
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [accessLevel, setAccessLevel] = useState('Administrator System');

  // Edit states
  const [editUsername, setEditUsername] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Role>('admin');
  const [editAccessLevel, setEditAccessLevel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;
    addUser(username.trim(), name.trim(), role, accessLevel);
    setUsername('');
    setName('');
    setShowModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editUsername.trim() || !editName.trim()) return;
    updateUser(editingUser.id, {
      username: editUsername.trim(),
      name: editName.trim(),
      role: editRole,
      accessLevel: editAccessLevel,
    });
    setEditingUser(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'All' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const printFilteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(printSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(printSearch.toLowerCase());
    const matchRole = printRole === 'All' || u.role === printRole;
    return matchSearch && matchRole;
  });

  const activeAY = academicYears?.find((a) => a.isActive);
  const activeAcademicYearName = activeAY ? `${activeAY.yearName} (${activeAY.semester})` : '2026/2027';

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Akun User & Hak Akses</h2>
            <p className="text-xs text-slate-500 font-medium">Pengaturan akun login, kredensial, dan hak akses Admin, Guru, Siswa</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-200 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Data User</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah User Manual</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Kotak Pencarian Username / Nama */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari username atau nama lengkap user..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Tabs (All, admin, Guru, Siswa/Murid) */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['All', 'admin', 'guru', 'siswa'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                  filterRole === r
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'siswa' ? 'Siswa/Murid' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table User Accounts */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Nama Lengkap User</th>
                <th className="p-3 text-center">Role Akses</th>
                <th className="p-3">Tingkat Akses</th>
                <th className="p-3 text-center">Status Akun</th>
                <th className="p-3 text-center">Aksi / Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-700">@{u.username}</td>
                  <td className="p-3 font-bold text-slate-900">{u.name}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : u.role === 'guru'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 font-semibold">{u.accessLevel}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setEditUsername(u.username);
                        setEditName(u.name);
                        setEditRole(u.role);
                        setEditAccessLevel(u.accessLevel);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit User Ini"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus akun user "@${u.username}"?`)) {
                          deleteUser(u.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus User Ini"
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

      {/* Modal Tambah Manual User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Tambah User / Pengguna Baru</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin_piket / guru_budi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap User"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role Akses <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="admin">Admin System</option>
                  <option value="guru">Guru / Pendidik</option>
                  <option value="siswa">Siswa / Murid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Keterangan Akses
                </label>
                <input
                  type="text"
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  placeholder="Contoh: Operator Piket / Admin Perpustakaan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Akun User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Edit Data User / Pengguna</h3>
                  <p className="text-xs text-slate-500 font-medium">Ubah kredensial & peranan hak akses</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Contoh: admin_piket"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama Lengkap User"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Peran / Hak Akses (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  <option value="admin">Administrator (Akses Penuh)</option>
                  <option value="guru">Guru / Wali Kelas</option>
                  <option value="siswa">Siswa / Orang Tua</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Keterangan Akses
                </label>
                <input
                  type="text"
                  value={editAccessLevel}
                  onChange={(e) => setEditAccessLevel(e.target.value)}
                  placeholder="Contoh: Operator Piket / Admin Perpustakaan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
      {/* Modal Cetak Data User */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 my-8 print:border-none print:shadow-none print:m-0 print:p-4 print:rounded-none">
            {/* Modal Actions Bar (Hidden on Print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 no-print print:hidden">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Cetak & Export Data User</h3>
                  <p className="text-xs text-slate-500 font-medium">Pratinjau dokumen resmi laporan daftar akun pengguna portal</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Filter Controls (Hidden on Print) */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3 no-print print:hidden">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={printSearch}
                  onChange={(e) => setPrintSearch(e.target.value)}
                  placeholder="Filter nama / username untuk dicetak..."
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 w-full md:w-auto justify-center">
                {(['All', 'admin', 'guru', 'siswa'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setPrintRole(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                      printRole === r
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'siswa' ? 'Siswa' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Printable Document Container */}
            <div className="print-area space-y-6 text-slate-900 font-sans p-2">
              {/* Kop Surat Resmi */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
                {/* Logo Pemda */}
                {settings?.regencyLogo ? (
                  <img src={settings.regencyLogo} alt="Logo Pemda" className="w-16 h-16 object-contain shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-bold text-[9px] text-center p-1 shrink-0">
                    LOGO PEMDA
                  </div>
                )}

                <div className="text-center flex-1 space-y-0.5">
                  <p className="text-[12px] font-black uppercase tracking-widest text-slate-800">
                    {settings?.governmentHeaderLine1 || 'PEMERINTAH KABUPATEN TABANAN'}
                  </p>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    {settings?.governmentHeaderLine2 || 'DINAS PENDIDIKAN'}
                  </p>
                  <h2 className="text-lg font-black uppercase tracking-wider text-slate-950">
                    {settings?.schoolName || 'SMP NEGERI 1 CONTOH'}
                  </h2>
                  <p className="text-xs font-medium text-slate-700">
                    {settings?.schoolAddress || 'Jl. Pendidikan No. 1'} &bull; {settings?.city || 'Kota'}{settings?.npsn ? ` • NPSN: ${settings.npsn}` : ''}
                  </p>
                  <p className="text-xs font-extrabold text-slate-900 pt-0.5">
                    TAHUN AJARAN {activeAcademicYearName}
                  </p>
                </div>

                {/* Logo Sekolah */}
                {settings?.schoolLogo ? (
                  <img src={settings.schoolLogo} alt="Logo Sekolah" className="w-16 h-16 object-contain shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-bold text-[9px] text-center p-1 shrink-0">
                    LOGO SEKOLAH
                  </div>
                )}
              </div>

              {/* Judul Dokumen */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wide underline">
                  LAPORAN DAFTAR AKUN PENGGUNA & HAK AKSES PORTAL ADMIN
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  Nomor Dokumen: REG-USER/{new Date().getFullYear()}/{String(new Date().getMonth() + 1).padStart(2, '0')}
                </p>
              </div>

              {/* Metadata Info Box */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
                <div>
                  <span className="text-slate-500 font-bold">Kategori Role:</span>{' '}
                  <span className="font-bold text-purple-700 uppercase">
                    {printRole === 'All' ? 'Semua Role (Admin, Guru, Siswa)' : printRole}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Total Akun Terdaftar:</span>{' '}
                  <span className="font-extrabold text-slate-900">{printFilteredUsers.length} Akun</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Tanggal Cetak:</span>{' '}
                  <span className="font-bold text-slate-800">
                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Tabel Accounts */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-300">
                      <th className="p-2.5 border border-slate-300 text-center w-10">No</th>
                      <th className="p-2.5 border border-slate-300">Username Login</th>
                      <th className="p-2.5 border border-slate-300">Nama Lengkap User</th>
                      <th className="p-2.5 border border-slate-300 text-center">Role / Peran</th>
                      <th className="p-2.5 border border-slate-300">Tingkat / Keterangan Akses</th>
                      <th className="p-2.5 border border-slate-300 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {printFilteredUsers.length > 0 ? (
                      printFilteredUsers.map((u, idx) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-600">{idx + 1}</td>
                          <td className="p-2.5 border border-slate-300 font-mono font-bold text-purple-800">@{u.username}</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-900">{u.name}</td>
                          <td className="p-2.5 border border-slate-300 text-center">
                            <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-800">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-2.5 border border-slate-300">{u.accessLevel || '-'}</td>
                          <td className="p-2.5 border border-slate-300 text-center">
                            <span className="font-bold text-[10px] text-emerald-700">
                              {u.status || 'Aktif'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 font-medium border border-slate-300">
                          Tidak ada data user yang sesuai dengan pencarian atau filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Area Pengesahan Tanda Tangan */}
              <div className="pt-8 flex justify-end">
                <div className="text-center w-64 space-y-1">
                  <p className="text-xs text-slate-700 font-medium">
                    {settings?.city || 'Kota'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs font-bold text-slate-900">Kepala Sekolah / Administrator</p>
                  <div className="h-16 flex items-center justify-center">
                    {settings?.principalSignature ? (
                      <img src={settings.principalSignature} alt="Tanda Tangan" className="h-14 object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">( Tanda Tangan Digital )</span>
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 underline">
                    {settings?.principalName || 'Nama Kepala Sekolah, M.Pd.'}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    NIP. {settings?.principalNip || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
