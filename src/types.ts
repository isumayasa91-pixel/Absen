export type Role = 'admin' | 'guru' | 'siswa';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  accessLevel: string;
  status: 'Aktif' | 'Nonaktif';
  email?: string;
  avatar?: string;
}

export interface AcademicYear {
  id: string;
  yearName: string; // e.g., "2026/2027"
  semester: 'Ganjil' | 'Genap';
  isActive: boolean;
}

export interface ClassData {
  id: string;
  className: string;
  homeroomTeacher: string;
  academicYear: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  fullName: string;
  currentClass: string;
  nisn: string;
  gender: 'L' | 'P';
  rfidTag?: string;
  qrCode?: string;
  photo?: string;
  isFaceRegistered?: boolean;
  faceRegisteredAt?: string;
  status: 'Aktif' | 'Alumni' | 'Pindah';
}

export type TeacherPosition = 'Guru Mapel' | 'Wali Kelas' | 'Guru BK' | 'Kepala Sekolah';

export interface Teacher {
  id: string;
  fullNameWithTitle: string;
  nip: string;
  position: TeacherPosition;
  email?: string;
  phone?: string;
  subject?: string;
}

export interface TeacherJournal {
  id: string;
  date: string;
  teacherName: string;
  subject: string;
  classTarget: string;
  topic: string;
  notes: string;
  timeSlot: string; // Jam Ke- 1-2
  absentStudents?: string; // Daftar/nama siswa yang absen / tidak hadir
}

export interface StudentGradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  currentClass: string;
  subject: string; // Mapel
  teacherName: string;
  
  // Nilai Tugas 1 s/d 5
  tugas1?: number | null;
  tugas2?: number | null;
  tugas3?: number | null;
  tugas4?: number | null;
  tugas5?: number | null;
  
  // Nilai PH 1 s/d 5 (Penilaian Harian)
  ph1?: number | null;
  ph2?: number | null;
  ph3?: number | null;
  ph4?: number | null;
  ph5?: number | null;
  
  // Nilai PTS & PAS
  pts?: number | null;
  pas?: number | null;
  
  // Hasil Akumulasi
  avgTugas?: number;
  avgPH?: number;
  finalScore?: number;
  predicate?: string;
  statusPassing?: 'Lulus' | 'Remidial';
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetClass: string; // 'Semua Kelas' or specific class
  date: string;
  author: string;
  isImportant?: boolean;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Dispen' | 'Terlambat';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string; // YYYY-MM-DD
  statusFinal: AttendanceStatus;
  statusIn: 'Hadir' | 'Terlambat' | 'Belum';
  statusOut: 'Pulang' | 'Belum';
  timeIn: string; // e.g., "06:45:12"
  timeOut: string; // e.g., "15:05:00"
  tapMethod: 'RFID' | 'FaceID' | 'Manual' | 'QR';
  notes?: string;
}

export interface PermissionSubmission {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  type: 'Izin' | 'Sakit' | 'Alpa';
  startDate: string;
  endDate: string;
  reason: string;
  proofPhotoUrl?: string;
  statusApproval: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
  approvalType?: 'Menunggu Persetujuan' | 'Langsung Disetujui';
  submittedAt: string;
}

export interface LeavePermission {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  timeOut: string;
  leaveType: 'Izin Sementara (kembali)' | 'Pulang Awal (Tidak Kembali)';
  reason: string;
  status: 'Berlaku' | 'Sudah Kembali' | 'Selesai';
}

export interface LibraryTAP {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  timestamp: string;
  type: 'Masuk Perpus' | 'Pinjam Buku' | 'Pengembalian Buku';
  barcodeBook?: string;
  bookTitle?: string;
}

export interface LibraryBook {
  id: string;
  barcode: string;
  title: string;
  author: string;
  category: string;
  stock: number;
}

export interface DisciplineRule {
  id: string;
  code: string;
  category: 'Ringan' | 'Sedang' | 'Berat';
  name: string;
  points: number;
  description: string;
}

export interface ViolationRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  ruleId: string;
  ruleName: string;
  points: number;
  date: string;
  sanction: string;
  reporter: string;
}

export interface HolidayEvent {
  id: string;
  date: string;
  title: string;
  type: 'Nasional' | 'Sekolah' | 'Cuti';
}

export interface CardRequest {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  nisn: string;
  reason: string;
  date: string;
  status: 'Menunggu' | 'Diproses' | 'Selesai Cetak' | 'Sudah Diterima';
  notes?: string;
}

export interface SystemSetting {
  schoolName: string;
  npsn?: string;
  appNameBranding: string;
  city: string;
  schoolAddress: string;
  principalName: string;
  principalNip: string;
  schoolLogo: string;
  regencyLogo?: string;
  governmentHeaderLine1?: string; // Baris 1 KOP Surat (contoh: PEMERINTAH KABUPATEN TABANAN)
  governmentHeaderLine2?: string; // Baris 2 KOP Surat (contoh: DINAS PENDIDIKAN)
  principalSignature?: string;
  schoolStamp?: string;
  enableClassAttendance: boolean;
  enableOnlineAttendance: boolean;
  autoViolationPoints: boolean;
  requireMorningToken: boolean;
  morningToken: string;
  timeInStart: string; // e.g. "06:30"
  timeInEnd: string;   // e.g. "07:15" (Batas terlambat)
  timeOutStart: string;// e.g. "15:00"
  schoolLat: number;
  schoolLng: number;
  geofenceRadius: number; // in meters
}

export interface ComputerCourseSession {
  id: string;
  sessionCode: string;
  topic: string;
  targetClass?: string; // Target kelas peserta les (misal: "X IPA 1", "Semua Kelas", "VII-A")
  instructor: string;
  labRoom: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  maxCapacity: number;
  status: 'Terjadwal' | 'Sedang Berlangsung' | 'Selesai';
  description?: string;
}

export interface ComputerCourseAttendance {
  id: string;
  sessionId: string;
  sessionTopic: string;
  studentId: string;
  studentName: string;
  class: string;
  nisn: string;
  date: string;
  timeIn: string;
  tapMethod: 'RFID' | 'FaceID' | 'QR' | 'Manual';
  pcNumber: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  taskScore?: number;
  taskNotes?: string;
}

export interface ComputerCourseMember {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  nisn: string;
  batch: string;
  preferredPc: string;
  registeredDate: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface PiketTeacherAttendance {
  teacherId: string;
  teacherName: string;
  nip?: string;
  subject?: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Tugas Luar' | 'Alpa' | 'Terlambat';
  timeSlot?: string; // Jam Pelajaran (misal: "Jam 1-3" atau "07:30 - 09:30")
  substituteTeacher?: string; // Guru Pengganti / Pembawa Tugas
  notes?: string;
}

export interface PiketClassAttendance {
  className: string;
  totalStudents: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  dispen?: number;
  terlambat?: number;
  absentStudentNames?: string; // Detail nama siswa yang tidak hadir & alasan
}

export interface EarlyLeaveRecord {
  id: string;
  studentName: string;
  className: string;
  timeOut: string;
  reason: string;
  pickedUpBy?: string; // Penjemput / Nama Orang Tua / Wali
}

export interface PiketBookRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // Hari (Senin, Selasa, dll)
  lessonStartTime: string; // Pelajaran dimulai (misal "07:15 WITA" / "07.00")
  
  // Guru Piket (dipilih sinkron dari data guru)
  piketTeacherIds: string[];
  piketTeacherNames: string[];
  piketTeacherNips?: string[];
  
  // A. Absen Guru
  teacherAttendances: PiketTeacherAttendance[];
  
  // B. Absen Siswa (Kelas VII A s/d IX E)
  classAttendances: PiketClassAttendance[];
  
  // Kejadian Penting / Absen Siswa yang Mendahului Pulang
  earlyLeaves: EarlyLeaveRecord[];
  importantEvents: string;
  
  // Rekapitulasi Total
  rekapSummary?: {
    totalStudents: number;
    totalHadir: number;
    totalSakit: number;
    totalIzin: number;
    totalAlpa: number;
    totalDispen: number;
    totalTeachers: number;
    teachersPresent: number;
    teachersAbsent: number;
  };

  // Pengesahan
  principalName?: string;
  principalNip?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
