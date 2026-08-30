import {
  UserAccount,
  AcademicYear,
  ClassData,
  Student,
  Teacher,
  TeacherJournal,
  Announcement,
  AttendanceRecord,
  PermissionSubmission,
  LeavePermission,
  LibraryTAP,
  LibraryBook,
  DisciplineRule,
  ViolationRecord,
  HolidayEvent,
  CardRequest,
  SystemSetting,
} from '../types';

export const initialSystemSettings: SystemSetting = {
  schoolName: 'SMA Negeri 1 Nusa Bangsa',
  appNameBranding: 'Presensi Digital Pro',
  city: 'Kota Jakarta Selatan',
  schoolAddress: 'Jl. Pemuda Pendidikan No. 45, Kebayoran Baru',
  principalName: 'Dr. H. Ahmad Wijaya, M.Pd.',
  principalNip: '19750812 199903 1 002',
  schoolLogo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
  principalSignature: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="60" viewBox="0 0 150 60"><path d="M10 40 Q 30 10, 45 35 T 70 25 T 95 40 T 130 15 M 25 35 L 110 35 M 40 45 Q 70 55, 120 40" stroke="%231e3a8a" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  schoolStamp: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" stroke="%23b91c1c" stroke-width="3" fill="none" stroke-dasharray="6,2"/><circle cx="60" cy="60" r="46" stroke="%23b91c1c" stroke-width="1.5" fill="none"/><text x="60" y="32" font-size="8" font-family="sans-serif" font-weight="bold" fill="%23b91c1c" text-anchor="middle">DINAS PENDIDIKAN</text><text x="60" y="95" font-size="7" font-family="sans-serif" font-weight="bold" fill="%23b91c1c" text-anchor="middle">SMA NEGERI 1 NUSA BANGSA</text><path d="M 35 60 L 85 60" stroke="%23b91c1c" stroke-width="2"/><text x="60" y="56" font-size="9" font-family="sans-serif" font-weight="black" fill="%23b91c1c" text-anchor="middle">CAP SEKOLAH</text><text x="60" y="70" font-size="8" font-family="sans-serif" font-weight="bold" fill="%23b91c1c" text-anchor="middle">TERVERIFIKASI</text></svg>`,
  enableClassAttendance: true,
  enableOnlineAttendance: true,
  autoViolationPoints: true,
  requireMorningToken: true,
  morningToken: 'EDU-8921',
  timeInStart: '06:30',
  timeInEnd: '07:15',
  timeOutStart: '15:00',
  schoolLat: -6.2088,
  schoolLng: 106.8456,
  geofenceRadius: 100,
};

export const initialAcademicYears: AcademicYear[] = [
  { id: 'ay-1', yearName: '2026/2027', semester: 'Ganjil', isActive: true },
  { id: 'ay-2', yearName: '2025/2026', semester: 'Genap', isActive: false },
  { id: 'ay-3', yearName: '2025/2026', semester: 'Ganjil', isActive: false },
];

export const initialClasses: ClassData[] = [];

export const initialStudents: Student[] = [
  { id: 'std-1', fullName: 'Aditya Pratama', currentClass: 'X IPA 1', nisn: '0078912341', gender: 'L', rfidTag: 'RFID-1001', status: 'Aktif' },
  { id: 'std-2', fullName: 'Anisa Rahmawati', currentClass: 'X IPA 1', nisn: '0078912342', gender: 'P', rfidTag: 'RFID-1002', status: 'Aktif' },
  { id: 'std-3', fullName: 'Bagas Kurniawan', currentClass: 'X IPA 1', nisn: '0078912343', gender: 'L', rfidTag: 'RFID-1003', status: 'Aktif' },
  { id: 'std-4', fullName: 'Citra Dewi', currentClass: 'X IPA 2', nisn: '0078912344', gender: 'P', rfidTag: 'RFID-1004', status: 'Aktif' },
  { id: 'std-5', fullName: 'Daffa Rizky', currentClass: 'XI IPS 1', nisn: '0078912345', gender: 'L', rfidTag: 'RFID-1005', status: 'Aktif' },
  { id: 'std-6', fullName: 'Eka Putri', currentClass: 'XII MIPA 1', nisn: '0078912346', gender: 'P', rfidTag: 'RFID-1006', status: 'Aktif' },
  { id: 'std-7', fullName: 'Faris Naufal', currentClass: 'X IPA 1', nisn: '0078912347', gender: 'L', rfidTag: 'RFID-1007', status: 'Aktif' },
  { id: 'std-8', fullName: 'Gita Gutawa', currentClass: 'X IPA 2', nisn: '0078912348', gender: 'P', rfidTag: 'RFID-1008', status: 'Aktif' },
];

export const initialTeachers: Teacher[] = [
  { id: 'tch-1', fullNameWithTitle: 'Budi Santoso, M.Pd', nip: '19820315 200801 1 005', position: 'Wali Kelas', subject: 'Matematika', phone: '081234567890' },
  { id: 'tch-2', fullNameWithTitle: 'Siti Aminah, S.Pd', nip: '19850620 201001 2 012', position: 'Guru Mapel', subject: 'Bahasa Indonesia', phone: '081298765432' },
  { id: 'tch-3', fullNameWithTitle: 'Drs. Bambang Hidayat', nip: '19720410 199802 1 003', position: 'Guru BK', subject: 'Bimbingan Konseling', phone: '081311223344' },
  { id: 'tch-4', fullNameWithTitle: 'Dr. H. Ahmad Wijaya, M.Pd.', nip: '19750812 199903 1 002', position: 'Kepala Sekolah', subject: 'Manajemen Pendidikan', phone: '081100998877' },
];

export const initialUsers: UserAccount[] = [
  { id: 'u-1', username: 'admin', name: 'Administrator Presensi', role: 'admin', accessLevel: 'Super Admin', status: 'Aktif', email: 'admin@sekolah.sch.id' },
  { id: 'u-2', username: 'budi_santoso', name: 'Budi Santoso, M.Pd', role: 'guru', accessLevel: 'Guru / Wali Kelas', status: 'Aktif', email: 'budi@sekolah.sch.id' },
  { id: 'u-3', username: 'aditya_pratama', name: 'Aditya Pratama', role: 'siswa', accessLevel: 'Siswa', status: 'Aktif', email: 'aditya@siswa.sch.id' },
];

export const initialAnnouncements: Announcement[] = [
  { id: 'ann-1', title: 'Pelaksanaan Ujian Tengah Semester Ganjil 2026', content: 'Diimbau kepada seluruh siswa untuk hadir tepat waktu pukul 06.45 WIB dan membawa Kartu Presensi RFID.', targetClass: 'Semua Kelas', date: '2026-08-28', author: 'Kepala Sekolah' },
  { id: 'ann-2', title: 'Peringatan Hari Kemerdekaan & Upacara Bendera', content: 'Seluruh wali kelas X IPA 1 & 2 wajib mendampingi presensi barisan siswa.', targetClass: 'X IPA 1', date: '2026-08-25', author: 'Guru BK' },
];

const todayStr = new Date().toISOString().split('T')[0];

export const initialAttendanceRecords: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'std-1', studentName: 'Aditya Pratama', class: 'X IPA 1', date: todayStr, statusFinal: 'Hadir', statusIn: 'Hadir', statusOut: 'Belum', timeIn: '06:42:10', timeOut: '-', tapMethod: 'RFID' },
  { id: 'att-2', studentId: 'std-2', studentName: 'Anisa Rahmawati', class: 'X IPA 1', date: todayStr, statusFinal: 'Hadir', statusIn: 'Hadir', statusOut: 'Belum', timeIn: '06:50:05', timeOut: '-', tapMethod: 'FaceID' },
  { id: 'att-3', studentId: 'std-3', studentName: 'Bagas Kurniawan', class: 'X IPA 1', date: todayStr, statusFinal: 'Terlambat', statusIn: 'Terlambat', statusOut: 'Belum', timeIn: '07:28:15', timeOut: '-', tapMethod: 'RFID', notes: 'Macet lalu lintas' },
  { id: 'att-4', studentId: 'std-4', studentName: 'Citra Dewi', class: 'X IPA 2', date: todayStr, statusFinal: 'Sakit', statusIn: 'Belum', statusOut: 'Belum', timeIn: '-', timeOut: '-', tapMethod: 'Manual', notes: 'Surat Dokter dikirim' },
  { id: 'att-5', studentId: 'std-5', studentName: 'Daffa Rizky', class: 'XI IPS 1', date: todayStr, statusFinal: 'Izin', statusIn: 'Belum', statusOut: 'Belum', timeIn: '-', timeOut: '-', tapMethod: 'Manual', notes: 'Acara Keluarga' },
  { id: 'att-6', studentId: 'std-6', studentName: 'Eka Putri', class: 'XII MIPA 1', date: todayStr, statusFinal: 'Alpa', statusIn: 'Belum', statusOut: 'Belum', timeIn: '-', timeOut: '-', tapMethod: 'Manual' },
  { id: 'att-7', studentId: 'std-7', studentName: 'Faris Naufal', class: 'X IPA 1', date: todayStr, statusFinal: 'Dispen', statusIn: 'Hadir', statusOut: 'Belum', timeIn: '06:55:00', timeOut: '-', tapMethod: 'RFID', notes: 'Lomba Olahraga' },
  { id: 'att-8', studentId: 'std-8', studentName: 'Gita Gutawa', class: 'X IPA 2', date: todayStr, statusFinal: 'Terlambat', statusIn: 'Terlambat', statusOut: 'Belum', timeIn: '07:35:40', timeOut: '-', tapMethod: 'QR' },
];

export const initialPermissions: PermissionSubmission[] = [
  { id: 'perm-1', studentId: 'std-4', studentName: 'Citra Dewi', class: 'X IPA 2', type: 'Sakit', startDate: todayStr, endDate: todayStr, reason: 'Demam tinggi dan flu berat', proofPhotoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80', statusApproval: 'Disetujui', approvalType: 'Langsung Disetujui', submittedAt: '2026-08-29 06:15' },
  { id: 'perm-2', studentId: 'std-5', studentName: 'Daffa Rizky', class: 'XI IPS 1', type: 'Izin', startDate: todayStr, endDate: todayStr, reason: 'Menghadiri acara pernikahan keluarga di luar kota', statusApproval: 'Menunggu Persetujuan', approvalType: 'Menunggu Persetujuan', submittedAt: '2026-08-29 06:40' },
];

export const initialLeavePermissions: LeavePermission[] = [
  { id: 'leave-1', studentId: 'std-1', studentName: 'Aditya Pratama', class: 'X IPA 1', date: todayStr, timeOut: '10:30', leaveType: 'Izin Sementara (kembali)', reason: 'Fisioterapi Kaki', status: 'Berlaku' },
];

export const initialTeacherJournals: TeacherJournal[] = [
  { id: 'jrn-1', date: todayStr, teacherName: 'Budi Santoso, M.Pd', subject: 'Matematika', classTarget: 'X IPA 1', topic: 'Persamaan Kuadrat & Fungsi Logaritma', notes: 'Siswa sangat aktif menyimak contoh soal nomor 1-5.', timeSlot: 'Jam 1 - 2 (07.00 - 08.30)' },
  { id: 'jrn-2', date: todayStr, teacherName: 'Siti Aminah, S.Pd', subject: 'Bahasa Indonesia', classTarget: 'X IPA 2', topic: 'Teks Laporan Hasil Observasi', notes: 'Praktikum pengamatan di perpustakaan sekolah.', timeSlot: 'Jam 3 - 4 (08.30 - 10.00)' },
];

export const initialDisciplineRules: DisciplineRule[] = [
  { id: 'rule-1', code: 'TTR-01', category: 'Ringan', name: 'Terlambat Masuk Sekolah (< 15 menit)', points: 5, description: 'Siswa datang setelah jam 07.15 WIB.' },
  { id: 'rule-2', code: 'TTR-02', category: 'Ringan', name: 'Seragam Tidak Rapi / Tidak Lengkap', points: 5, description: 'Tidak menggunakan atribut OSIS lengkap atau kaos kaki putih.' },
  { id: 'rule-3', code: 'TTR-03', category: 'Sedang', name: 'Meninggalkan Kelas Tanpa Izin (Bolo)', points: 15, description: 'Keluar area sekolah tanpa surat izin piket.' },
  { id: 'rule-4', code: 'TTR-04', category: 'Berat', name: 'Merokok di Area Sekolah', points: 50, description: 'Membawa atau merokok dalam lingkungan sekolah.' },
];

export const initialViolationRecords: ViolationRecord[] = [
  { id: 'v-1', studentId: 'std-3', studentName: 'Bagas Kurniawan', class: 'X IPA 1', ruleId: 'rule-1', ruleName: 'Terlambat Masuk Sekolah (< 15 menit)', points: 5, date: todayStr, sanction: 'Teguran Lisan & Piket Kebersihan', reporter: 'Drs. Bambang Hidayat (BK)' },
];

export const initialLibraryBooks: LibraryBook[] = [
  { id: 'bk-1', barcode: 'BK-9901', title: 'Matematika Tingkat Lanjut Kelas X', author: 'Prof. Suparno', category: 'Pelajaran', stock: 45 },
  { id: 'bk-2', barcode: 'BK-9902', title: 'Fisika Modern & Kuantum', author: 'Dr. Handoko', category: 'Sains', stock: 28 },
  { id: 'bk-3', barcode: 'BK-9903', title: 'Laskar Pelangi', author: 'Andrea Hirata', category: 'Novel', stock: 12 },
];

export const initialLibraryTAPs: LibraryTAP[] = [
  { id: 'lib-1', studentId: 'std-1', studentName: 'Aditya Pratama', class: 'X IPA 1', timestamp: `${todayStr} 09:45`, type: 'Masuk Perpus' },
  { id: 'lib-2', studentId: 'std-2', studentName: 'Anisa Rahmawati', class: 'X IPA 1', timestamp: `${todayStr} 10:15`, type: 'Pinjam Buku', barcodeBook: 'BK-9903', bookTitle: 'Laskar Pelangi' },
];

export const initialHolidays: HolidayEvent[] = [
  { id: 'hol-1', date: '2026-08-17', title: 'HUT Kemerdekaan RI ke-81', type: 'Nasional' },
  { id: 'hol-2', date: '2026-10-28', title: 'Hari Sumpah Pemuda', type: 'Sekolah' },
  { id: 'hol-3', date: '2026-12-25', title: 'Hari Raya Natal', type: 'Nasional' },
];

export const initialCardRequests: CardRequest[] = [
  { id: 'cr-1', studentId: 'std-1', studentName: 'Aditya Pratama', class: 'X IPA 1', nisn: '0078912341', reason: 'Kartu Hilang / Lupa Taruh', date: '2026-08-20', status: 'Diproses' },
  { id: 'cr-2', studentId: 'std-2', studentName: 'Anisa Rahmawati', class: 'X IPA 1', nisn: '0078912342', reason: 'Kartu Rusak / Patah Microchip', date: '2026-08-22', status: 'Selesai Cetak' },
  { id: 'cr-3', studentId: 'std-5', studentName: 'Daffa Rizky', class: 'XI IPS 1', nisn: '0078912345', reason: 'Ganti Kode RFID Tag Baru', date: '2026-08-28', status: 'Menunggu' },
];

