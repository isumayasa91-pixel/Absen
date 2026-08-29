import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, AlertTriangle, FileText, Plus, Save, Search } from 'lucide-react';

export const PelanggaranView: React.FC = () => {
  const {
    activeTab: globalActiveTab,
    disciplineRules,
    violationRecords,
    addViolationRecord,
    students,
  } = useApp();

  const getSubTabFromActiveTab = (tab: string): 'tata-tertib' | 'pelanggaran' | 'rekap' => {
    if (tab === 'pelanggaran') return 'pelanggaran';
    if (tab === 'rekap-pelanggaran') return 'rekap';
    return 'tata-tertib';
  };

  const [activeTab, setActiveTab] = useState<'tata-tertib' | 'pelanggaran' | 'rekap'>(() => getSubTabFromActiveTab(globalActiveTab));

  useEffect(() => {
    if (globalActiveTab === 'tata-tertib' || globalActiveTab === 'pelanggaran' || globalActiveTab === 'rekap-pelanggaran') {
      setActiveTab(getSubTabFromActiveTab(globalActiveTab));
    }
  }, [globalActiveTab]);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [selectedRule, setSelectedRule] = useState(disciplineRules[0]?.id || 'rule-1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sanction, setSanction] = useState('Teguran Lisan & Pembinaan Wali Kelas');
  const [reporter, setReporter] = useState('Guru BK / Tim Piket');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find((s) => s.id === selectedStudent);
    const rule = disciplineRules.find((r) => r.id === selectedRule);
    if (!std || !rule) return;

    addViolationRecord({
      studentId: std.id,
      studentName: std.fullName,
      class: std.currentClass,
      ruleId: rule.id,
      ruleName: rule.name,
      points: rule.points,
      date,
      sanction,
      reporter,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-[#E11D48] flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Pelanggaran & Tata Tertib</h2>
            <p className="text-xs text-slate-500 font-medium">Pencatatan poin pelanggaran siswa, aturan tata tertib, dan sanksi kedisiplinan</p>
          </div>
        </div>

        {/* Subtabs & Action */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('tata-tertib')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tata-tertib' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tata Tertib
            </button>
            <button
              onClick={() => setActiveTab('pelanggaran')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pelanggaran' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catat Pelanggaran
            </button>
            <button
              onClick={() => setActiveTab('rekap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rekap' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Poin
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-rose-200 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Pelanggaran</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Tata Tertib */}
      {activeTab === 'tata-tertib' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Master Poin & Tata Tertib Sekolah</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Nama Pelanggaran</th>
                  <th className="p-3 text-center">Poin Bobot</th>
                  <th className="p-3">Deskripsi aturan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {disciplineRules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{r.code}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.category === 'Berat'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : r.category === 'Sedang'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{r.name}</td>
                    <td className="p-3 text-center font-extrabold text-rose-600">+{r.points} Poin</td>
                    <td className="p-3 text-slate-600">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Pelanggaran (Catatan Input) */}
      {activeTab === 'pelanggaran' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Catatan Pelanggaran Siswa Terbaru</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Siswa & Kelas</th>
                  <th className="p-3">Jenis Pelanggaran</th>
                  <th className="p-3 text-center">Poin</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Sanksi Ditentukan</th>
                  <th className="p-3">Pelapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {violationRecords.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{v.studentName} ({v.class})</td>
                    <td className="p-3 font-semibold text-slate-800">{v.ruleName}</td>
                    <td className="p-3 text-center font-extrabold text-rose-600">+{v.points}</td>
                    <td className="p-3 font-mono">{v.date}</td>
                    <td className="p-3 text-slate-700">{v.sanction}</td>
                    <td className="p-3 text-slate-500 font-semibold">{v.reporter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Rekap Poin */}
      {activeTab === 'rekap' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Rekapitulasi Akumulasi Poin Pelanggaran Siswa</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3 text-center">Total Frekuensi</th>
                  <th className="p-3 text-center">Akumulasi Poin</th>
                  <th className="p-3 text-center">Status Kedisiplinan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {students.map((s) => {
                  const sRecords = violationRecords.filter((v) => v.studentId === s.id);
                  const totalP = sRecords.reduce((acc, curr) => acc + curr.points, 0);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{s.fullName}</td>
                      <td className="p-3">{s.currentClass}</td>
                      <td className="p-3 text-center font-bold">{sRecords.length} Kali</td>
                      <td className="p-3 text-center font-extrabold text-rose-600">{totalP} Poin</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            totalP >= 50
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : totalP >= 15
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {totalP >= 50 ? 'Panggilan Orangtua / SP2' : totalP >= 15 ? 'Teguran BK' : 'Disiplin Baik'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Input Pelanggaran */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Input Catatan Pelanggaran Siswa</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Siswa <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.currentClass})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jenis Pelanggaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRule}
                  onChange={(e) => setSelectedRule(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {disciplineRules.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.code}] {r.name} (+{r.points} Poin)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal Kejadian</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sanksi Ditentukan</label>
                <input
                  type="text"
                  required
                  value={sanction}
                  onChange={(e) => setSanction(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pelanggaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
