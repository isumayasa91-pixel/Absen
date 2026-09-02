import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  User,
  School,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { UserAccount } from '../types';

export const LoginModal: React.FC = () => {
  const { login, users, settings, students } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showUsername, setShowUsername] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Password/Username yang anda masukan salah');
      return;
    }

    setIsSubmitting(true);

    // 1. Search in user accounts list
    const foundUser = users.find((u) => u.username.toLowerCase() === cleanUsername);

    if (foundUser) {
      const expectedPassword = foundUser.password ? foundUser.password.toLowerCase() : '';
      const isValidPassword = expectedPassword
        ? cleanPassword.toLowerCase() === expectedPassword
        : (cleanPassword === 'admin123' ||
           cleanPassword === 'guru123' ||
           cleanPassword === 'siswa123' ||
           cleanPassword === '123456' ||
           cleanPassword.toLowerCase() === cleanUsername);

      if (isValidPassword) {
        setSuccessNotice('Password/Username yang Anda masukkan benar!');
        setTimeout(() => {
          login(foundUser);
          setIsSubmitting(false);
        }, 900);
        return;
      } else {
        setIsSubmitting(false);
        setError('Password/Username yang anda masukan salah');
        return;
      }
    }

    // 2. Search in students list by NISN or name format
    const studentFound = students.find((s) => {
      const cleanName = s.fullName.toLowerCase().replace(/\s+/g, '');
      return (s.nisn && s.nisn === username.trim()) || (cleanName === cleanUsername);
    });

    if (studentFound) {
      const isValidStudentPassword =
        cleanPassword === 'siswa123' ||
        cleanPassword === '123456' ||
        cleanPassword === (studentFound.nisn || '') ||
        cleanPassword.toLowerCase() === cleanUsername;

      if (isValidStudentPassword) {
        const studentUser: UserAccount = {
          id: `u-std-${studentFound.id}`,
          username: studentFound.nisn || studentFound.fullName.toLowerCase().replace(/\s+/g, ''),
          name: studentFound.fullName,
          role: 'siswa' as const,
          accessLevel: 'Siswa / Murid',
          status: 'Aktif' as const,
          email: `${studentFound.nisn || 'siswa'}@siswa.sch.id`,
        };
        setSuccessNotice('Password/Username yang Anda masukkan benar!');
        setTimeout(() => {
          login(studentUser);
          setIsSubmitting(false);
        }, 900);
        return;
      } else {
        setIsSubmitting(false);
        setError('Password/Username yang anda masukan salah');
        return;
      }
    }

    // 3. Fallback admin login
    if (cleanUsername === 'admin') {
      if (cleanPassword === 'admin123' || cleanPassword === 'admin' || cleanPassword === '123456') {
        setSuccessNotice('Password/Username yang Anda masukkan benar!');
        setTimeout(() => {
          login(users[0]);
          setIsSubmitting(false);
        }, 900);
        return;
      }
    }

    setIsSubmitting(false);
    setError('Password/Username yang anda masukan salah');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden space-y-0">
        
        {/* Header: Logo Sekolah & Branding */}
        <div className="p-6 pb-4 bg-gradient-to-b from-indigo-50/70 to-white text-center space-y-3 border-b border-slate-100">
          <div className="flex justify-center">
            {settings.schoolLogo ? (
              <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-md border border-slate-200/80 flex items-center justify-center">
                <img
                  src={settings.schoolLogo}
                  alt="Logo Sekolah"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white shadow-lg flex items-center justify-center border border-indigo-500">
                <School className="w-10 h-10" />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-base font-black text-slate-800 tracking-tight">{settings.schoolName || 'SMA Negeri 1 Nusa Bangsa'}</h2>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
              {settings.appNameBranding || 'Aplikasi Presensi Digital'}
            </p>
          </div>
        </div>

        {/* Sub Header: Kotak Dialog Login Aplikasi */}
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-2.5 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Kotak Dialog Login Aplikasi
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Field Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / NIP / NISN
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showUsername ? 'text' : 'password'}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowUsername(!showUsername)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                  title={showUsername ? 'Sembunyikan Username' : 'Tampilkan Username'}
                >
                  {showUsername ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                  title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Notification Alert Boxes */}
            {successNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300/80 rounded-xl text-xs font-extrabold text-emerald-800 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-300/80 rounded-xl text-xs font-extrabold text-rose-800 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Pengembang */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
              <span>Aplikasi ini di kembangkan oleh :</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                @wayansuma70
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
