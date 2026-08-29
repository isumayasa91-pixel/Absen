import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpenCheck, Plus, Save, Calendar, Clock, School, User } from 'lucide-react';

export const JurnalGuruView: React.FC = () => {
  const { teacherJournals, addTeacherJournal, teachers, classes, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherName, setTeacherName] = useState(currentUser?.name || teachers[0]?.fullNameWithTitle || 'Budi Santoso, M.Pd');
  const [subject, setSubject] = useState('Matematika');
  const [classTarget, setClassTarget] = useState(classes[0]?.className || 'X IPA 1');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [timeSlot, setTimeSlot] = useState('Jam 1 - 2 (07.00 - 08.30)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    addTeacherJournal({
      date,
      teacherName,
      subject,
      classTarget,
      topic: topic.trim(),
      notes: notes.trim(),
      timeSlot,
    });
    setTopic('');
    setNotes('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Jurnal Pengajaran Guru</h2>
            <p className="text-xs text-slate-500 font-medium">Catatan harian kegiatan belajar mengajar (KBM) dan materi kelas</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-200 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Isi Jurnal Mengajar</span>
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
          <BookOpenCheck className="w-4 h-4 text-purple-600" />
          <span>Riwayat Jurnal Pengajaran Terkini</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Tanggal & Jam</th>
                <th className="p-3">Nama Guru Pendidik</th>
                <th className="p-3">Mata Pelajaran & Kelas</th>
                <th className="p-3">Topik Pembahasan Materi</th>
                <th className="p-3">Catatan / Evaluasi KBM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {teacherJournals.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{j.date}</div>
                    <span className="text-[10px] text-purple-700 font-semibold">{j.timeSlot}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{j.teacherName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-extrabold text-[11px] block w-fit mb-0.5">
                      {j.subject}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Kelas {j.classTarget}</span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{j.topic}</td>
                  <td className="p-3 text-slate-600">{j.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Jurnal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <BookOpenCheck className="w-4 h-4 text-purple-600" />
              <span>Input Jurnal Mengajar Baru</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Jam Ke-</label>
                  <input
                    type="text"
                    required
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="Contoh: Jam 1 - 2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Fisika / Matematika"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kelas Target</label>
                  <select
                    value={classTarget}
                    onChange={(e) => setClassTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.className}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Topik Materi Pembahasan</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Hukum Newton III & Penerapannya"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Catatan Evaluasi Kelas</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan keaktifan siswa atau kendala KBM..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Jurnal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
