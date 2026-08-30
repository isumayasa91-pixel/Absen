import React, { createContext, useContext, useState, useEffect } from 'react';
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
import {
  initialSystemSettings,
  initialAcademicYears,
  initialClasses,
  initialStudents,
  initialTeachers,
  initialUsers,
  initialAnnouncements,
  initialAttendanceRecords,
  initialPermissions,
  initialLeavePermissions,
  initialTeacherJournals,
  initialDisciplineRules,
  initialViolationRecords,
  initialLibraryBooks,
  initialLibraryTAPs,
  initialHolidays,
  initialCardRequests,
} from '../data/mockData';

interface AppContextType {
  currentUser: UserAccount | null;
  login: (user: UserAccount) => void;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  settings: SystemSetting;
  updateSettings: (newSettings: Partial<SystemSetting>) => void;

  academicYears: AcademicYear[];
  addAcademicYear: (yearName: string, semester: 'Ganjil' | 'Genap', isActive: boolean) => void;
  deleteAcademicYear: (id: string) => void;

  classes: ClassData[];
  addClass: (className: string, homeroomTeacher: string, academicYear: string) => void;
  importClasses: (classList: Partial<ClassData>[]) => void;
  deleteClass: (id: string) => void;
  clearAllClasses: () => void;

  students: Student[];
  addStudent: (fullName: string, currentClass: string, nisn: string, gender: 'L' | 'P') => void;
  importStudents: (studentList: Partial<Student>[]) => void;
  updateStudentPhoto: (studentId: string, photo: string) => void;
  updateMassStudentPhotos: (photosMap: { [key: string]: string }) => void;
  generateMassStudentAccounts: () => void;
  deleteStudent: (id: string) => void;

  teachers: Teacher[];
  addTeacher: (fullNameWithTitle: string, nip: string, position: any, phone?: string) => void;
  importTeachers: (teacherList: Partial<Teacher>[]) => void;
  generateMassTeacherAccounts: () => void;
  deleteTeacher: (id: string) => void;

  users: UserAccount[];
  addUser: (username: string, name: string, role: 'admin' | 'guru' | 'siswa', accessLevel: string) => void;
  deleteUser: (id: string) => void;

  announcements: Announcement[];
  addAnnouncement: (title: string, content: string, targetClass: string) => void;
  deleteAnnouncement: (id: string) => void;

  attendanceRecords: AttendanceRecord[];
  addOrUpdateAttendance: (record: AttendanceRecord) => void;
  deleteAttendanceRecord: (id: string) => void;
  manualInputAttendance: (data: {
    studentId: string;
    date: string;
    statusFinal: any;
    statusIn: any;
    statusOut: any;
    timeIn: string;
    timeOut: string;
    notes?: string;
  }) => void;
  tapRFIDOrScan: (studentId: string, method: 'RFID' | 'FaceID' | 'QR') => { success: boolean; message: string; record?: AttendanceRecord };

  permissions: PermissionSubmission[];
  addPermission: (data: Omit<PermissionSubmission, 'id' | 'submittedAt'>) => void;
  updatePermissionStatus: (id: string, status: 'Disetujui' | 'Ditolak') => void;
  deletePermission: (id: string) => void;

  leavePermissions: LeavePermission[];
  addLeavePermission: (data: Omit<LeavePermission, 'id'>) => void;
  deleteLeavePermission: (id: string) => void;

  teacherJournals: TeacherJournal[];
  addTeacherJournal: (data: Omit<TeacherJournal, 'id'>) => void;
  deleteTeacherJournal: (id: string) => void;

  libraryTAPs: LibraryTAP[];
  addLibraryTAP: (studentId: string, type: 'Masuk Perpus' | 'Pinjam Buku' | 'Pengembalian Buku', barcodeBook?: string, bookTitle?: string) => void;
  deleteLibraryTAP: (id: string) => void;
  libraryBooks: LibraryBook[];
  deleteLibraryBook: (id: string) => void;

  disciplineRules: DisciplineRule[];
  violationRecords: ViolationRecord[];
  addViolationRecord: (data: Omit<ViolationRecord, 'id'>) => void;
  deleteViolationRecord: (id: string) => void;

  holidays: HolidayEvent[];
  addHoliday: (date: string, title: string, type: 'Nasional' | 'Sekolah' | 'Cuti') => void;
  deleteHoliday: (id: string) => void;

  cardRequests: CardRequest[];
  addCardRequest: (data: Omit<CardRequest, 'id'>) => void;
  updateCardRequestStatus: (id: string, status: CardRequest['status']) => void;
  deleteCardRequest: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(`presensi_app_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(`presensi_app_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadFromStorage('currentUser', initialUsers[0]));
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [settings, setSettings] = useState<SystemSetting>(() => loadFromStorage('settings', initialSystemSettings));
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => loadFromStorage('academicYears', initialAcademicYears));
  const [classes, setClasses] = useState<ClassData[]>(() => loadFromStorage('classes', initialClasses));
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('students', initialStudents));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadFromStorage('teachers', initialTeachers));
  const [users, setUsers] = useState<UserAccount[]>(() => loadFromStorage('users', initialUsers));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('announcements', initialAnnouncements));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadFromStorage('attendanceRecords', initialAttendanceRecords));
  const [permissions, setPermissions] = useState<PermissionSubmission[]>(() => loadFromStorage('permissions', initialPermissions));
  const [leavePermissions, setLeavePermissions] = useState<LeavePermission[]>(() => loadFromStorage('leavePermissions', initialLeavePermissions));
  const [teacherJournals, setTeacherJournals] = useState<TeacherJournal[]>(() => loadFromStorage('teacherJournals', initialTeacherJournals));
  const [libraryTAPs, setLibraryTAPs] = useState<LibraryTAP[]>(() => loadFromStorage('libraryTAPs', initialLibraryTAPs));
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(() => loadFromStorage('libraryBooks', initialLibraryBooks));
  const [disciplineRules] = useState<DisciplineRule[]>(() => loadFromStorage('disciplineRules', initialDisciplineRules));
  const [violationRecords, setViolationRecords] = useState<ViolationRecord[]>(() => loadFromStorage('violationRecords', initialViolationRecords));
  const [holidays, setHolidays] = useState<HolidayEvent[]>(() => loadFromStorage('holidays', initialHolidays));
  const [cardRequests, setCardRequests] = useState<CardRequest[]>(() => loadFromStorage('cardRequests', initialCardRequests));

  useEffect(() => saveToStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('academicYears', academicYears), [academicYears]);
  useEffect(() => saveToStorage('classes', classes), [classes]);
  useEffect(() => saveToStorage('students', students), [students]);
  useEffect(() => saveToStorage('teachers', teachers), [teachers]);
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('announcements', announcements), [announcements]);
  useEffect(() => saveToStorage('attendanceRecords', attendanceRecords), [attendanceRecords]);
  useEffect(() => saveToStorage('permissions', permissions), [permissions]);
  useEffect(() => saveToStorage('leavePermissions', leavePermissions), [leavePermissions]);
  useEffect(() => saveToStorage('teacherJournals', teacherJournals), [teacherJournals]);
  useEffect(() => saveToStorage('libraryTAPs', libraryTAPs), [libraryTAPs]);
  useEffect(() => saveToStorage('libraryBooks', libraryBooks), [libraryBooks]);
  useEffect(() => saveToStorage('violationRecords', violationRecords), [violationRecords]);
  useEffect(() => saveToStorage('holidays', holidays), [holidays]);
  useEffect(() => saveToStorage('cardRequests', cardRequests), [cardRequests]);

  const login = (user: UserAccount) => setCurrentUser(user);
  const logout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const updateSettings = (newSettings: Partial<SystemSetting>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addAcademicYear = (yearName: string, semester: 'Ganjil' | 'Genap', isActive: boolean) => {
    let updated = academicYears;
    if (isActive) {
      updated = updated.map((y) => ({ ...y, isActive: false }));
    }
    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      yearName,
      semester,
      isActive,
    };
    setAcademicYears([...updated, newYear]);
  };

  const addClass = (className: string, homeroomTeacher: string, academicYear: string) => {
    const newClass: ClassData = {
      id: `c-${Date.now()}`,
      className,
      homeroomTeacher,
      academicYear,
      studentCount: 0,
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const importClasses = (classList: Partial<ClassData>[]) => {
    const formatted: ClassData[] = classList.map((c, i) => ({
      id: `c-imp-${Date.now()}-${i}`,
      className: c.className || `Kelas Baru ${i + 1}`,
      homeroomTeacher: c.homeroomTeacher || 'Belum Ditentukan',
      academicYear: c.academicYear || '2026/2027',
      studentCount: 30,
    }));
    setClasses((prev) => [...prev, ...formatted]);
  };

  const addStudent = (fullName: string, currentClass: string, nisn: string, gender: 'L' | 'P') => {
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      fullName,
      currentClass,
      nisn,
      gender,
      rfidTag: `RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      qrCode: `QR-${nisn}`,
      status: 'Aktif',
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const importStudents = (studentList: Partial<Student>[]) => {
    const formatted: Student[] = studentList.map((s, i) => ({
      id: `std-imp-${Date.now()}-${i}`,
      fullName: s.fullName || `Siswa Baru ${i + 1}`,
      currentClass: s.currentClass || 'X IPA 1',
      nisn: s.nisn || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      gender: s.gender === 'P' ? 'P' : 'L',
      rfidTag: `RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Aktif',
    }));
    setStudents((prev) => [...prev, ...formatted]);
  };

  const updateStudentPhoto = (studentId: string, photo: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId || s.nisn === studentId ? { ...s, photo } : s))
    );
  };

  const updateMassStudentPhotos = (photosMap: { [key: string]: string }) => {
    setStudents((prev) =>
      prev.map((s) => {
        const keyId = s.id;
        const keyNisn = s.nisn;
        const keyName = s.fullName.toLowerCase().trim();
        const found = photosMap[keyId] || photosMap[keyNisn] || photosMap[keyName];
        if (found) {
          return { ...s, photo: found };
        }
        return s;
      })
    );
  };

  const generateMassStudentAccounts = () => {
    const newUsers: UserAccount[] = students.map((std) => ({
      id: `u-std-${std.id}`,
      username: std.nisn || std.fullName.toLowerCase().replace(/\s+/g, ''),
      name: std.fullName,
      role: 'siswa' as const,
      accessLevel: 'Siswa / Murid',
      status: 'Aktif' as const,
      email: `${std.nisn}@siswa.sch.id`,
    }));
    // merge unique
    setUsers((prev) => {
      const existingNames = new Set(prev.map((u) => u.username));
      const filtered = newUsers.filter((u) => !existingNames.has(u.username));
      return [...prev, ...filtered];
    });
  };

  const addTeacher = (fullNameWithTitle: string, nip: string, position: any, phone?: string) => {
    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      fullNameWithTitle,
      nip,
      position,
      phone: phone || '081234567890',
    };
    setTeachers((prev) => [...prev, newTeacher]);
  };

  const importTeachers = (teacherList: Partial<Teacher>[]) => {
    const formatted: Teacher[] = teacherList.map((t, i) => ({
      id: `tch-imp-${Date.now()}-${i}`,
      fullNameWithTitle: t.fullNameWithTitle || `Guru Baru, S.Pd ${i + 1}`,
      nip: t.nip || `198${Math.floor(100000 + Math.random() * 900000)} 201001 1 001`,
      position: t.position || 'Guru Mapel',
      phone: t.phone || '08123456789',
    }));
    setTeachers((prev) => [...prev, ...formatted]);
  };

  const generateMassTeacherAccounts = () => {
    const newUsers: UserAccount[] = teachers.map((tch) => ({
      id: `u-tch-${tch.id}`,
      username: tch.nip.replace(/\s+/g, '') || tch.fullNameWithTitle.toLowerCase().replace(/\s+/g, ''),
      name: tch.fullNameWithTitle,
      role: 'guru' as const,
      accessLevel: tch.position,
      status: 'Aktif' as const,
      email: `${tch.nip}@guru.sch.id`,
    }));
    setUsers((prev) => {
      const existing = new Set(prev.map((u) => u.username));
      const filtered = newUsers.filter((u) => !existing.has(u.username));
      return [...prev, ...filtered];
    });
  };

  const addUser = (username: string, name: string, role: 'admin' | 'guru' | 'siswa', accessLevel: string) => {
    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      username,
      name,
      role,
      accessLevel,
      status: 'Aktif',
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const addAnnouncement = (title: string, content: string, targetClass: string) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      targetClass,
      date: new Date().toISOString().split('T')[0],
      author: currentUser?.name || 'Administrator',
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const addOrUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex((r) => r.studentId === record.studentId && r.date === record.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  };

  const manualInputAttendance = (data: {
    studentId: string;
    date: string;
    statusFinal: any;
    statusIn: any;
    statusOut: any;
    timeIn: string;
    timeOut: string;
    notes?: string;
  }) => {
    const std = students.find((s) => s.id === data.studentId);
    if (!std) return;

    const record: AttendanceRecord = {
      id: `att-man-${Date.now()}`,
      studentId: std.id,
      studentName: std.fullName,
      class: std.currentClass,
      date: data.date,
      statusFinal: data.statusFinal,
      statusIn: data.statusIn,
      statusOut: data.statusOut,
      timeIn: data.timeIn || '07:00:00',
      timeOut: data.timeOut || '-',
      tapMethod: 'Manual',
      notes: data.notes,
    };
    addOrUpdateAttendance(record);
  };

  const tapRFIDOrScan = (studentId: string, method: 'RFID' | 'FaceID' | 'QR') => {
    let query = (studentId || '').trim();
    if (query.includes(':')) {
      const parts = query.split(':');
      query = parts[1] || parts[2] || query;
    }
    const cleanDigits = query.replace(/[^0-9]/g, '');

    const std = students.find((s) => {
      const sId = s.id.toLowerCase();
      const sNisn = (s.nisn || '').toLowerCase();
      const sRfid = (s.rfidTag || '').toLowerCase();
      const sName = s.fullName.toLowerCase();
      const q = query.toLowerCase();

      return (
        sId === q ||
        sNisn === q ||
        sRfid === q ||
        sName === q ||
        (cleanDigits.length >= 4 && sNisn === cleanDigits) ||
        (q.startsWith('tap-rfid-') && q.includes(sNisn.slice(-6))) ||
        (sRfid && (q.includes(sRfid) || sRfid.includes(q))) ||
        (sNisn && (q.includes(sNisn) || sNisn.includes(q)))
      );
    });

    if (!std) {
      return { success: false, message: `Kartu RFID / Kode [${query}] tidak terdaftar di sistem!`, student: null, record: null, type: 'error' as const };
    }

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    // Check time vs settings (e.g. 07:15)
    const [h, m] = nowTime.split(':').map(Number);
    const [endH, endM] = (settings.timeInEnd || '07:15').split(':').map(Number);
    const isLate = h > endH || (h === endH && m > endM);

    const existing = attendanceRecords.find((r) => r.studentId === std.id && r.date === today);

    let updatedRecord: AttendanceRecord;
    let scanType: 'masuk' | 'pulang' | 'terlambat' = 'masuk';

    if (!existing || existing.statusIn === 'Belum') {
      // Clock in
      const statusFinal = isLate ? 'Terlambat' : 'Hadir';
      const statusIn = isLate ? 'Terlambat' : 'Hadir';
      scanType = isLate ? 'terlambat' : 'masuk';

      updatedRecord = {
        id: existing?.id || `att-tap-${Date.now()}`,
        studentId: std.id,
        studentName: std.fullName,
        class: std.currentClass,
        date: today,
        statusFinal,
        statusIn,
        statusOut: 'Belum',
        timeIn: nowTime,
        timeOut: '-',
        tapMethod: method,
      };

      // Auto add violation points if configured
      if (isLate && settings.autoViolationPoints) {
        setViolationRecords((prev) => [
          {
            id: `v-auto-${Date.now()}`,
            studentId: std.id,
            studentName: std.fullName,
            class: std.currentClass,
            ruleId: 'rule-1',
            ruleName: 'Terlambat Masuk Sekolah (< 15 menit)',
            points: 5,
            date: today,
            sanction: 'Poin Otomatis Sistem Presensi',
            reporter: 'Sistem RFID Auto-Point',
          },
          ...prev,
        ]);
      }
    } else {
      // Clock out
      scanType = 'pulang';
      updatedRecord = {
        ...existing,
        statusOut: 'Pulang',
        timeOut: nowTime,
      };
    }

    addOrUpdateAttendance(updatedRecord);
    return {
      success: true,
      message: scanType === 'pulang'
        ? `PRESENSI PULANG: ${std.fullName} (${std.currentClass}) Pukul ${nowTime}`
        : scanType === 'terlambat'
        ? `PRESENSI TERLAMBAT: ${std.fullName} (${std.currentClass}) Pukul ${nowTime}`
        : `PRESENSI MASUK: ${std.fullName} (${std.currentClass}) Pukul ${nowTime}`,
      student: std,
      record: updatedRecord,
      type: scanType,
    };
  };

  const addPermission = (data: Omit<PermissionSubmission, 'id' | 'submittedAt'>) => {
    const newPerm: PermissionSubmission = {
      ...data,
      id: `perm-${Date.now()}`,
      submittedAt: new Date().toLocaleString('id-ID'),
    };
    setPermissions((prev) => [newPerm, ...prev]);

    // If auto approved or approved, update attendance record as well
    if (data.statusApproval === 'Disetujui') {
      const std = students.find((s) => s.id === data.studentId);
      if (std) {
        addOrUpdateAttendance({
          id: `att-perm-${Date.now()}`,
          studentId: std.id,
          studentName: std.fullName,
          class: std.currentClass,
          date: data.startDate,
          statusFinal: data.type,
          statusIn: 'Belum',
          statusOut: 'Belum',
          timeIn: '-',
          timeOut: '-',
          tapMethod: 'Manual',
          notes: data.reason,
        });
      }
    }
  };

  const updatePermissionStatus = (id: string, status: 'Disetujui' | 'Ditolak') => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, statusApproval: status };
          if (status === 'Disetujui') {
            const std = students.find((s) => s.id === p.studentId);
            if (std) {
              addOrUpdateAttendance({
                id: `att-perm-${Date.now()}`,
                studentId: std.id,
                studentName: std.fullName,
                class: std.currentClass,
                date: p.startDate,
                statusFinal: p.type,
                statusIn: 'Belum',
                statusOut: 'Belum',
                timeIn: '-',
                timeOut: '-',
                tapMethod: 'Manual',
                notes: p.reason,
              });
            }
          }
          return updated;
        }
        return p;
      })
    );
  };

  const addLeavePermission = (data: Omit<LeavePermission, 'id'>) => {
    const newLeave: LeavePermission = {
      ...data,
      id: `leave-${Date.now()}`,
    };
    setLeavePermissions((prev) => [newLeave, ...prev]);
  };

  const addTeacherJournal = (data: Omit<TeacherJournal, 'id'>) => {
    const newJrn: TeacherJournal = {
      ...data,
      id: `jrn-${Date.now()}`,
    };
    setTeacherJournals((prev) => [newJrn, ...prev]);
  };

  const addLibraryTAP = (
    studentId: string,
    type: 'Masuk Perpus' | 'Pinjam Buku' | 'Pengembalian Buku',
    barcodeBook?: string,
    bookTitle?: string
  ) => {
    const std = students.find((s) => s.id === studentId);
    if (!std) return;

    const now = new Date();
    const ts = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    const newTap: LibraryTAP = {
      id: `lib-${Date.now()}`,
      studentId: std.id,
      studentName: std.fullName,
      class: std.currentClass,
      timestamp: ts,
      type,
      barcodeBook,
      bookTitle,
    };
    setLibraryTAPs((prev) => [newTap, ...prev]);
  };

  const addViolationRecord = (data: Omit<ViolationRecord, 'id'>) => {
    const newV: ViolationRecord = {
      ...data,
      id: `v-${Date.now()}`,
    };
    setViolationRecords((prev) => [newV, ...prev]);
  };

  const addHoliday = (date: string, title: string, type: 'Nasional' | 'Sekolah' | 'Cuti') => {
    const newH: HolidayEvent = {
      id: `hol-${Date.now()}`,
      date,
      title,
      type,
    };
    setHolidays((prev) => [...prev, newH]);
  };

  // Delete Functions
  const deleteAcademicYear = (id: string) => setAcademicYears((prev) => prev.filter((item) => item.id !== id));
  const deleteClass = (id: string) => setClasses((prev) => prev.filter((item) => item.id !== id));
  const clearAllClasses = () => setClasses([]);
  const deleteStudent = (id: string) => setStudents((prev) => prev.filter((item) => item.id !== id));
  const deleteTeacher = (id: string) => setTeachers((prev) => prev.filter((item) => item.id !== id));
  const deleteUser = (id: string) => setUsers((prev) => prev.filter((item) => item.id !== id));
  const deleteAnnouncement = (id: string) => setAnnouncements((prev) => prev.filter((item) => item.id !== id));
  const deleteAttendanceRecord = (id: string) => setAttendanceRecords((prev) => prev.filter((item) => item.id !== id));
  const deletePermission = (id: string) => setPermissions((prev) => prev.filter((item) => item.id !== id));
  const deleteLeavePermission = (id: string) => setLeavePermissions((prev) => prev.filter((item) => item.id !== id));
  const deleteTeacherJournal = (id: string) => setTeacherJournals((prev) => prev.filter((item) => item.id !== id));
  const deleteLibraryTAP = (id: string) => setLibraryTAPs((prev) => prev.filter((item) => item.id !== id));
  const deleteLibraryBook = (id: string) => setLibraryBooks((prev) => prev.filter((item) => item.id !== id));
  const deleteViolationRecord = (id: string) => setViolationRecords((prev) => prev.filter((item) => item.id !== id));
  const deleteHoliday = (id: string) => setHolidays((prev) => prev.filter((item) => item.id !== id));

  const addCardRequest = (data: Omit<CardRequest, 'id'>) => {
    const newReq: CardRequest = {
      id: `cr-${Date.now()}`,
      ...data,
    };
    setCardRequests((prev) => [newReq, ...prev]);
  };

  const updateCardRequestStatus = (id: string, status: CardRequest['status']) => {
    setCardRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const deleteCardRequest = (id: string) => {
    setCardRequests((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        activeTab,
        setActiveTab,
        settings,
        updateSettings,
        academicYears,
        addAcademicYear,
        deleteAcademicYear,
        classes,
        addClass,
        importClasses,
        deleteClass,
        clearAllClasses,
        students,
        addStudent,
        importStudents,
        updateStudentPhoto,
        updateMassStudentPhotos,
        generateMassStudentAccounts,
        deleteStudent,
        teachers,
        addTeacher,
        importTeachers,
        generateMassTeacherAccounts,
        deleteTeacher,
        users,
        addUser,
        deleteUser,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        attendanceRecords,
        addOrUpdateAttendance,
        deleteAttendanceRecord,
        manualInputAttendance,
        tapRFIDOrScan,
        permissions,
        addPermission,
        updatePermissionStatus,
        deletePermission,
        leavePermissions,
        addLeavePermission,
        deleteLeavePermission,
        teacherJournals,
        addTeacherJournal,
        deleteTeacherJournal,
        libraryTAPs,
        addLibraryTAP,
        deleteLibraryTAP,
        libraryBooks,
        deleteLibraryBook,
        disciplineRules,
        violationRecords,
        addViolationRecord,
        deleteViolationRecord,
        holidays,
        addHoliday,
        deleteHoliday,
        cardRequests,
        addCardRequest,
        updateCardRequestStatus,
        deleteCardRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
