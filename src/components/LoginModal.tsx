import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, School, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login, users, settings, students } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    
    // 1. Search in user accounts list
    const found = users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (found) {
      login(found);
      setError('');
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
      setError('');
      return;
    }

    // 3. Fallback to default admin
    if (cleanUsername === 'admin') {
      login(users[0]);
      setError('');
      return;
    }

    setError('Username / NISN tidak ditemukan! Masukkan NISN Anda yang terdaftar.');
  };

  const selectPreset = (u: typeof users[0]) => {
    login(u);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Banner header */}
        <div className="bg-gradient-to-tr from-violet-800 via-indigo-700 to-purple-800 p-8 text-white relative overflow-hidden border-b border-indigo-500/20">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-white text-xl shadow-inner border border-white/20">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Sistem Presensi</span>
              <h2 className="text-xl font-black leading-tight tracking-tight">{settings.appNameBranding || 'Presensi Digital Pro'}</h2>
            </div>
          </div>
          <p className="text-xs text-indigo-100 font-medium leading-relaxed">
            {settings.schoolName} &bull; Portal Akses Manajemen Presensi Digital Administrator & Civitas Akademika.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / NIP / NISN
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username (contoh: admin)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-300/40 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Presets Quick Login for Admin/Guru/Siswa */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-1 text-xs font-bold text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilihan Akses Cepat Demo:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {users.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  onClick={() => selectPreset(u)}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 text-center transition-all text-xs font-semibold cursor-pointer group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-indigo-700 capitalize text-[11px] truncate">
                    {u.role}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{u.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
