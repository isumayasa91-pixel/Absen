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
  ComputerCourseSession,
  ComputerCourseAttendance,
  ComputerCourseMember,
  StudentGradeRecord,
  PiketBookRecord,
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
  initialComputerSessions,
  initialComputerAttendances,
  initialComputerMembers,
  initialGrades,
  initialPiketRecords,
} from '../data/mockData';
import {
  listenSingleDoc,
  listenCollection,
  syncSingleDoc,
  saveCollectionItem,
  saveCollectionItemsBatch,
  deleteCollectionItem,
  clearCollectionBatch,
  clearEntireCollectionInFirestore,
} from '../lib/firestoreSync';

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
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => void;
  deleteAcademicYear: (id: string) => void;

  classes: ClassData[];
  addClass: (className: string, homeroomTeacher: string, academicYear: string) => void;
  importClasses: (classList: Partial<ClassData>[]) => void;
  updateClass: (id: string, data: Partial<ClassData>) => void;
  deleteClass: (id: string) => void;
  clearAllClasses: () => void;

  students: Student[];
  addStudent: (fullName: string, currentClass: string, nisn: string, gender: 'L' | 'P') => void;
  importStudents: (studentList: Partial<Student>[]) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  updateStudentPhoto: (studentId: string, photo: string) => void;
  updateMassStudentPhotos: (photosMap: { [key: string]: string }) => void;
  generateMassStudentAccounts: () => void;
  deleteStudent: (id: string) => void;
  clearAllStudents: () => void;

  teachers: Teacher[];
  addTeacher: (fullNameWithTitle: string, nip: string, position: any, phone?: string) => void;
  importTeachers: (teacherList: Partial<Teacher>[]) => void;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  generateMassTeacherAccounts: () => void;
  deleteTeacher: (id: string) => void;
  clearAllTeachers: () => void;

  users: UserAccount[];
  addUser: (username: string, name: string, role: 'admin' | 'guru' | 'siswa', accessLevel: string) => void;
  updateUser: (id: string, data: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;

  announcements: Announcement[];
  addAnnouncement: (title: string, content: string, targetClass: string) => void;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  clearAllAnnouncements: () => void;

  attendanceRecords: AttendanceRecord[];
  addOrUpdateAttendance: (record: AttendanceRecord) => void;
  deleteAttendanceRecord: (id: string) => void;
  clearAllAttendance: () => void;
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
  clearAllPermissions: () => void;

  leavePermissions: LeavePermission[];
  addLeavePermission: (data: Omit<LeavePermission, 'id'>) => void;
  deleteLeavePermission: (id: string) => void;

  teacherJournals: TeacherJournal[];
  addTeacherJournal: (data: Omit<TeacherJournal, 'id'>) => void;
  updateTeacherJournal: (id: string, data: Partial<TeacherJournal>) => void;
  deleteTeacherJournal: (id: string) => void;
  clearAllTeacherJournals: () => void;

  libraryTAPs: LibraryTAP[];
  addLibraryTAP: (studentId: string, type: 'Masuk Perpus' | 'Pinjam Buku' | 'Pengembalian Buku', barcodeBook?: string, bookTitle?: string) => void;
  deleteLibraryTAP: (id: string) => void;
  clearAllLibraryTAPs: () => void;
  libraryBooks: LibraryBook[];
  addLibraryBook: (data: Omit<LibraryBook, 'id'>) => void;
  updateLibraryBook: (id: string, data: Partial<LibraryBook>) => void;
  deleteLibraryBook: (id: string) => void;

  disciplineRules: DisciplineRule[];
  violationRecords: ViolationRecord[];
  addViolationRecord: (data: Omit<ViolationRecord, 'id'>) => void;
  deleteViolationRecord: (id: string) => void;
  clearAllViolationRecords: () => void;

  holidays: HolidayEvent[];
  addHoliday: (date: string, title: string, type: 'Nasional' | 'Sekolah' | 'Cuti') => void;
  deleteHoliday: (id: string) => void;

  cardRequests: CardRequest[];
  addCardRequest: (data: Omit<CardRequest, 'id'>) => void;
  updateCardRequestStatus: (id: string, status: CardRequest['status']) => void;
  deleteCardRequest: (id: string) => void;
  clearAllCardRequests: () => void;

  computerSessions: ComputerCourseSession[];
  addComputerSession: (data: Omit<ComputerCourseSession, 'id'>) => void;
  updateComputerSession: (id: string, data: Partial<ComputerCourseSession>) => void;
  deleteComputerSession: (id: string) => void;
  clearAllComputerSessions: () => void;

  computerAttendances: ComputerCourseAttendance[];
  addComputerAttendance: (data: Omit<ComputerCourseAttendance, 'id'>) => void;
  updateComputerAttendance: (id: string, data: Partial<ComputerCourseAttendance>) => void;
  deleteComputerAttendance: (id: string) => void;
  clearAllComputerAttendances: () => void;
  tapComputerCourse: (studentId: string, sessionId: string, pcNumber?: string, method?: 'RFID' | 'FaceID' | 'QR' | 'Manual') => { success: boolean; message: string; record?: ComputerCourseAttendance };

  computerMembers: ComputerCourseMember[];
  addComputerMember: (studentId: string, batch: string, preferredPc?: string) => void;
  deleteComputerMember: (id: string) => void;

  grades: StudentGradeRecord[];
  saveGradeRecord: (record: StudentGradeRecord) => void;
  saveGradesBatch: (gradeRecords: StudentGradeRecord[]) => void;
  deleteGradeRecord: (id: string) => void;
  clearAllGrades: () => void;

  piketRecords: PiketBookRecord[];
  savePiketRecord: (record: PiketBookRecord) => void;
  deletePiketRecord: (id: string) => void;
  clearAllPiketRecords: () => void;

  saveCollectionItem: (collectionName: string, item: any) => Promise<void>;
  showNotice: (msg: string) => void;
  resetEntireSystemData: () => Promise<void>;
  restoreDemoData: () => Promise<void>;
  quotaExceeded: boolean;
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
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadFromStorage('currentUser', null));
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [settings, setSettings] = useState<SystemSetting>(initialSystemSettings);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(initialAcademicYears);
  const [classes, setClasses] = useState<ClassData[]>(initialClasses);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [permissions, setPermissions] = useState<PermissionSubmission[]>(initialPermissions);
  const [leavePermissions, setLeavePermissions] = useState<LeavePermission[]>(initialLeavePermissions);
  const [teacherJournals, setTeacherJournals] = useState<TeacherJournal[]>(initialTeacherJournals);
  const [libraryTAPs, setLibraryTAPs] = useState<LibraryTAP[]>(initialLibraryTAPs);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(initialLibraryBooks);
  const [disciplineRules] = useState<DisciplineRule[]>(initialDisciplineRules);
  const [violationRecords, setViolationRecords] = useState<ViolationRecord[]>(initialViolationRecords);
  const [holidays, setHolidays] = useState<HolidayEvent[]>(initialHolidays);
  const [cardRequests, setCardRequests] = useState<CardRequest[]>(initialCardRequests);
  const [computerSessions, setComputerSessions] = useState<ComputerCourseSession[]>(initialComputerSessions);
  const [computerAttendances, setComputerAttendances] = useState<ComputerCourseAttendance[]>(initialComputerAttendances);
  const [computerMembers, setComputerMembers] = useState<ComputerCourseMember[]>(initialComputerMembers);
  const [grades, setGrades] = useState<StudentGradeRecord[]>(initialGrades);
  const [piketRecords, setPiketRecords] = useState<PiketBookRecord[]>(initialPiketRecords);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('firestore-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('firestore-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Local storage backup for current user session
  useEffect(() => saveToStorage('currentUser', currentUser), [currentUser]);

  // Firestore Real-Time Subscriptions across all devices
  useEffect(() => {
    const unsubSettings = listenSingleDoc('settings', 'global', initialSystemSettings, setSettings);
    const unsubYears = listenCollection('academicYears', initialAcademicYears, setAcademicYears);
    const unsubClasses = listenCollection('classes', initialClasses, setClasses);
    const unsubStudents = listenCollection('students', initialStudents, setStudents);
    const unsubTeachers = listenCollection('teachers', initialTeachers, setTeachers);
    const unsubUsers = listenCollection('users', initialUsers, setUsers);
    const unsubAnn = listenCollection('announcements', initialAnnouncements, setAnnouncements);
    const unsubAtt = listenCollection('attendanceRecords', initialAttendanceRecords, setAttendanceRecords);
    const unsubPerm = listenCollection('permissions', initialPermissions, setPermissions);
    const unsubLeave = listenCollection('leavePermissions', initialLeavePermissions, setLeavePermissions);
    const unsubJrn = listenCollection('teacherJournals', initialTeacherJournals, setTeacherJournals);
    const unsubLibTaps = listenCollection('libraryTAPs', initialLibraryTAPs, setLibraryTAPs);
    const unsubLibBooks = listenCollection('libraryBooks', initialLibraryBooks, setLibraryBooks);
    const unsubVio = listenCollection('violationRecords', initialViolationRecords, setViolationRecords);
    const unsubHol = listenCollection('holidays', initialHolidays, setHolidays);
    const unsubReq = listenCollection('cardRequests', initialCardRequests, setCardRequests);
    const unsubCompSessions = listenCollection('computerSessions', initialComputerSessions, setComputerSessions);
    const unsubCompAtt = listenCollection('computerAttendances', initialComputerAttendances, setComputerAttendances);
    const unsubCompMembers = listenCollection('computerMembers', initialComputerMembers, setComputerMembers);
    const unsubGrades = listenCollection('grades', initialGrades, setGrades);
    const unsubPiket = listenCollection('piketRecords', initialPiketRecords, setPiketRecords);

    return () => {
      unsubSettings();
      unsubYears();
      unsubClasses();
      unsubStudents();
      unsubTeachers();
      unsubUsers();
      unsubAnn();
      unsubAtt();
      unsubPerm();
      unsubLeave();
      unsubJrn();
      unsubLibTaps();
      unsubLibBooks();
      unsubVio();
      unsubHol();
      unsubReq();
      unsubCompSessions();
      unsubCompAtt();
      unsubCompMembers();
      unsubGrades();
      unsubPiket();
    };
  }, []);

  const login = (user: UserAccount) => setCurrentUser(user);
  const logout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const updateSettings = (newSettings: Partial<SystemSetting>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    syncSingleDoc('settings', 'global', updated);
  };

  const addAcademicYear = (yearName: string, semester: 'Ganjil' | 'Genap', isActive: boolean) => {
    let updated = academicYears;
    if (isActive) {
      updated = updated.map((y) => {
        if (y.isActive) {
          const deactivated = { ...y, isActive: false };
          saveCollectionItem('academicYears', deactivated);
          return deactivated;
        }
        return y;
      });
    }
    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      yearName,
      semester,
      isActive,
    };
    saveCollectionItem('academicYears', newYear);
  };

  const addClass = (className: string, homeroomTeacher: string, academicYear: string) => {
    const newClass: ClassData = {
      id: `c-${Date.now()}`,
      className,
      homeroomTeacher,
      academicYear,
      studentCount: 0,
    };
    saveCollectionItem('classes', newClass);
  };

  const importClasses = (classList: Partial<ClassData>[]) => {
    const activeAY = academicYears.find((y) => y.isActive) || academicYears[0];
    const existingClassNames = new Set(classes.map((c) => c.className.toLowerCase().trim()));

    const formatted: ClassData[] = classList
      .map((c, i) => {
        const cName = (c.className || `Kelas Baru ${i + 1}`).trim();
        return {
          id: `c-imp-${Date.now()}-${i}`,
          className: cName,
          homeroomTeacher: c.homeroomTeacher || 'Belum Ditentukan',
          academicYear: c.academicYear || activeAY?.yearName || '2026/2027',
          studentCount: c.studentCount || students.filter((s) => s.currentClass.toLowerCase().trim() === cName.toLowerCase()).length || 0,
        };
      })
      .filter((c) => c.className.length > 0 && !existingClassNames.has(c.className.toLowerCase()));

    if (formatted.length > 0) {
      saveCollectionItemsBatch('classes', formatted);
    }
  };

  const addStudent = (fullName: string, currentClass: string, nisn: string, gender: 'L' | 'P') => {
    const cleanClass = (currentClass || 'X IPA 1').trim();
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      fullName,
      currentClass: cleanClass,
      nisn,
      gender,
      rfidTag: `RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      qrCode: `QR-${nisn}`,
      status: 'Aktif',
    };
    saveCollectionItem('students', newStudent);

    // Otomatis simpan data kelas jika belum ada di sistem
    if (cleanClass) {
      const classExists = classes.some(
        (c) => c.className.toLowerCase().trim() === cleanClass.toLowerCase()
      );
      if (!classExists) {
        const activeAY = academicYears.find((y) => y.isActive) || academicYears[0];
        const autoClass: ClassData = {
          id: `c-auto-${Date.now()}`,
          className: cleanClass,
          homeroomTeacher: 'Belum Ditentukan',
          academicYear: activeAY?.yearName || '2026/2027',
          studentCount: 1,
        };
        saveCollectionItem('classes', autoClass);
      }
    }
  };

  const importStudents = (studentList: Partial<Student>[]) => {
    const formatted: Student[] = studentList.map((s, i) => ({
      id: `std-imp-${Date.now()}-${i}`,
      fullName: s.fullName || `Siswa Baru ${i + 1}`,
      currentClass: (s.currentClass || 'X IPA 1').trim(),
      nisn: s.nisn || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      gender: s.gender === 'P' ? 'P' : 'L',
      rfidTag: `RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Aktif',
    }));
    saveCollectionItemsBatch('students', formatted);

    // Otomatis buat & simpan data kelas baru dari daftar siswa yang di-import
    const activeAY = academicYears.find((y) => y.isActive) || academicYears[0];
    const existingClassNames = new Set(classes.map((c) => c.className.toLowerCase().trim()));
    const newClassesToCreate: ClassData[] = [];

    formatted.forEach((std) => {
      const clsName = std.currentClass.trim();
      if (clsName && !existingClassNames.has(clsName.toLowerCase())) {
        existingClassNames.add(clsName.toLowerCase());
        newClassesToCreate.push({
          id: `c-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          className: clsName,
          homeroomTeacher: 'Belum Ditentukan',
          academicYear: activeAY?.yearName || '2026/2027',
          studentCount: formatted.filter((s) => s.currentClass.toLowerCase().trim() === clsName.toLowerCase()).length,
        });
      }
    });

    if (newClassesToCreate.length > 0) {
      saveCollectionItemsBatch('classes', newClassesToCreate);
    }
  };

  const updateStudentPhoto = (studentId: string, photo: string) => {
    const target = students.find((s) => s.id === studentId || s.nisn === studentId);
    if (target) {
      saveCollectionItem('students', { ...target, photo });
    }
  };

  const updateMassStudentPhotos = (photosMap: { [key: string]: string }) => {
    const updatedBatch: Student[] = [];
    students.forEach((s) => {
      const found = photosMap[s.id] || photosMap[s.nisn] || photosMap[s.fullName.toLowerCase().trim()];
      if (found) {
        updatedBatch.push({ ...s, photo: found });
      }
    });
    if (updatedBatch.length > 0) {
      saveCollectionItemsBatch('students', updatedBatch);
    }
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
    saveCollectionItemsBatch('users', newUsers);
  };

  const addTeacher = (fullNameWithTitle: string, nip: string, position: any, phone?: string) => {
    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      fullNameWithTitle,
      nip,
      position,
      phone: phone || '081234567890',
    };
    saveCollectionItem('teachers', newTeacher);
  };

  const importTeachers = (teacherList: Partial<Teacher>[]) => {
    const formatted: Teacher[] = teacherList.map((t, i) => ({
      id: `tch-imp-${Date.now()}-${i}`,
      fullNameWithTitle: t.fullNameWithTitle || `Guru Baru, S.Pd ${i + 1}`,
      nip: t.nip || `198${Math.floor(100000 + Math.random() * 900000)} 201001 1 001`,
      position: t.position || 'Guru Mapel',
      phone: t.phone || '08123456789',
    }));
    saveCollectionItemsBatch('teachers', formatted);
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
    saveCollectionItemsBatch('users', newUsers);
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
    saveCollectionItem('users', newUser);
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
    saveCollectionItem('announcements', newAnn);
  };

  const addOrUpdateAttendance = (record: AttendanceRecord) => {
    saveCollectionItem('attendanceRecords', record);
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

  const tapRFIDOrScan = (studentId: string, method: 'RFID' | 'FaceID' | 'QR', forcedMode?: 'auto' | 'masuk' | 'pulang') => {
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

    const [h, m] = nowTime.split(':').map(Number);
    const [endH, endM] = (settings.timeInEnd || '07:15').split(':').map(Number);
    const isLate = h > endH || (h === endH && m > endM);

    const existing = attendanceRecords.find((r) => r.studentId === std.id && r.date === today);

    let updatedRecord: AttendanceRecord;
    let scanType: 'masuk' | 'pulang' | 'terlambat' = 'masuk';

    const mode = forcedMode || 'auto';
    const isCheckIn = mode === 'masuk' || (mode === 'auto' && (!existing || existing.statusIn === 'Belum'));

    if (isCheckIn) {
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
        statusOut: existing?.statusOut || 'Belum',
        timeIn: nowTime,
        timeOut: existing?.timeOut || '-',
        tapMethod: method,
      };

      if (isLate && settings.autoViolationPoints) {
        saveCollectionItem('violationRecords', {
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
        });
      }
    } else {
      scanType = 'pulang';
      updatedRecord = {
        id: existing?.id || `att-tap-${Date.now()}`,
        studentId: std.id,
        studentName: std.fullName,
        class: std.currentClass,
        date: today,
        statusFinal: existing?.statusFinal || 'Hadir',
        statusIn: existing?.statusIn || 'Hadir', // assume was present if punching out
        statusOut: 'Pulang',
        timeIn: existing?.timeIn || '-',
        timeOut: nowTime,
        tapMethod: method,
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
    saveCollectionItem('permissions', newPerm);

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
    const target = permissions.find((p) => p.id === id);
    if (target) {
      saveCollectionItem('permissions', { ...target, statusApproval: status });
      if (status === 'Disetujui') {
        const std = students.find((s) => s.id === target.studentId);
        if (std) {
          addOrUpdateAttendance({
            id: `att-perm-${Date.now()}`,
            studentId: std.id,
            studentName: std.fullName,
            class: std.currentClass,
            date: target.startDate,
            statusFinal: target.type,
            statusIn: 'Belum',
            statusOut: 'Belum',
            timeIn: '-',
            timeOut: '-',
            tapMethod: 'Manual',
            notes: target.reason,
          });
        }
      }
    }
  };

  const addLeavePermission = (data: Omit<LeavePermission, 'id'>) => {
    const newLeave: LeavePermission = {
      ...data,
      id: `leave-${Date.now()}`,
    };
    saveCollectionItem('leavePermissions', newLeave);
  };

  const addTeacherJournal = (data: Omit<TeacherJournal, 'id'>) => {
    const newJrn: TeacherJournal = {
      ...data,
      id: `jrn-${Date.now()}`,
    };
    saveCollectionItem('teacherJournals', newJrn);
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
    saveCollectionItem('libraryTAPs', newTap);
  };

  const addViolationRecord = (data: Omit<ViolationRecord, 'id'>) => {
    const newV: ViolationRecord = {
      ...data,
      id: `v-${Date.now()}`,
    };
    saveCollectionItem('violationRecords', newV);
  };

  const addHoliday = (date: string, title: string, type: 'Nasional' | 'Sekolah' | 'Cuti') => {
    const newH: HolidayEvent = {
      id: `hol-${Date.now()}`,
      date,
      title,
      type,
    };
    saveCollectionItem('holidays', newH);
  };

  const updateAcademicYear = (id: string, data: Partial<AcademicYear>) => {
    const target = academicYears.find((y) => y.id === id);
    if (target) {
      if (data.isActive) {
        academicYears.forEach((y) => {
          if (y.id !== id && y.isActive) {
            saveCollectionItem('academicYears', { ...y, isActive: false });
          }
        });
      }
      saveCollectionItem('academicYears', { ...target, ...data });
    }
  };

  const updateClass = (id: string, data: Partial<ClassData>) => {
    const target = classes.find((c) => c.id === id);
    if (target) {
      saveCollectionItem('classes', { ...target, ...data });
    }
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    const target = students.find((s) => s.id === id);
    if (target) {
      saveCollectionItem('students', { ...target, ...data });
    }
  };

  const updateTeacher = (id: string, data: Partial<Teacher>) => {
    const target = teachers.find((t) => t.id === id);
    if (target) {
      saveCollectionItem('teachers', { ...target, ...data });
    }
  };

  const updateUser = (id: string, data: Partial<UserAccount>) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      saveCollectionItem('users', { ...target, ...data });
    }
  };

  const updateAnnouncement = (id: string, data: Partial<Announcement>) => {
    const target = announcements.find((a) => a.id === id);
    if (target) {
      saveCollectionItem('announcements', { ...target, ...data });
    }
  };

  const updateTeacherJournal = (id: string, data: Partial<TeacherJournal>) => {
    const target = teacherJournals.find((j) => j.id === id);
    if (target) {
      saveCollectionItem('teacherJournals', { ...target, ...data });
    }
  };

  const addLibraryBook = (data: Omit<LibraryBook, 'id'>) => {
    const newBook: LibraryBook = {
      id: `bk-${Date.now()}`,
      ...data,
    };
    saveCollectionItem('libraryBooks', newBook);
  };

  const updateLibraryBook = (id: string, data: Partial<LibraryBook>) => {
    const target = libraryBooks.find((b) => b.id === id);
    if (target) {
      saveCollectionItem('libraryBooks', { ...target, ...data });
    }
  };

  // Delete & Clear Functions
  const safeDeleteCollectionItem = (collectionName: string, id: string) => {
    if (currentUser?.role === 'siswa') {
      showNotice('⚠️ Akses ditolak: Akun Siswa tidak diizinkan untuk menghapus data.');
      return;
    }
    deleteCollectionItem(collectionName, id);
  };

  const isDeleteAllowed = (): boolean => {
    if (currentUser?.role === 'siswa') {
      showNotice('⚠️ Akses ditolak: Akun Siswa tidak diizinkan untuk menghapus data.');
      return false;
    }
    return true;
  };

  const deleteAcademicYear = (id: string) => safeDeleteCollectionItem('academicYears', id);
  const deleteClass = (id: string) => safeDeleteCollectionItem('classes', id);
  const clearAllClasses = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('classes');
    setClasses([]);
  };

  const deleteStudent = (id: string) => safeDeleteCollectionItem('students', id);
  const clearAllStudents = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('students');
    setStudents([]);
  };

  const deleteTeacher = (id: string) => safeDeleteCollectionItem('teachers', id);
  const clearAllTeachers = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('teachers');
    setTeachers([]);
  };

  const deleteUser = (id: string) => safeDeleteCollectionItem('users', id);
  const deleteAnnouncement = (id: string) => safeDeleteCollectionItem('announcements', id);
  const clearAllAnnouncements = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('announcements');
    setAnnouncements([]);
  };

  const deleteAttendanceRecord = (id: string) => safeDeleteCollectionItem('attendanceRecords', id);
  const clearAllAttendance = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('attendanceRecords');
    setAttendanceRecords([]);
  };

  const deletePermission = (id: string) => safeDeleteCollectionItem('permissions', id);
  const clearAllPermissions = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('permissions');
    await clearEntireCollectionInFirestore('leavePermissions');
    setPermissions([]);
    setLeavePermissions([]);
  };

  const deleteLeavePermission = (id: string) => safeDeleteCollectionItem('leavePermissions', id);
  const deleteTeacherJournal = (id: string) => safeDeleteCollectionItem('teacherJournals', id);
  const clearAllTeacherJournals = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('teacherJournals');
    setTeacherJournals([]);
  };

  const deleteLibraryTAP = (id: string) => safeDeleteCollectionItem('libraryTAPs', id);
  const clearAllLibraryTAPs = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('libraryTAPs');
    setLibraryTAPs([]);
  };
  const deleteLibraryBook = (id: string) => safeDeleteCollectionItem('libraryBooks', id);
  const deleteViolationRecord = (id: string) => safeDeleteCollectionItem('violationRecords', id);
  const clearAllViolationRecords = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('violationRecords');
    setViolationRecords([]);
  };

  const deleteHoliday = (id: string) => safeDeleteCollectionItem('holidays', id);

  const addCardRequest = (data: Omit<CardRequest, 'id'>) => {
    const newReq: CardRequest = {
      id: `cr-${Date.now()}`,
      ...data,
    };
    saveCollectionItem('cardRequests', newReq);
  };

  const updateCardRequestStatus = (id: string, status: CardRequest['status']) => {
    const target = cardRequests.find((cr) => cr.id === id);
    if (target) {
      saveCollectionItem('cardRequests', { ...target, status });
    }
  };

  const deleteCardRequest = (id: string) => safeDeleteCollectionItem('cardRequests', id);
  const clearAllCardRequests = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('cardRequests');
    setCardRequests([]);
  };

  // Computer Course Methods
  const addComputerSession = (data: Omit<ComputerCourseSession, 'id'>) => {
    const newSession: ComputerCourseSession = {
      ...data,
      id: `cs-${Date.now()}`,
    };
    saveCollectionItem('computerSessions', newSession);
  };

  const updateComputerSession = (id: string, data: Partial<ComputerCourseSession>) => {
    const target = computerSessions.find((s) => s.id === id);
    if (target) {
      const updated = { ...target, ...data };
      saveCollectionItem('computerSessions', updated);
    }
  };

  const deleteComputerSession = (id: string) => safeDeleteCollectionItem('computerSessions', id);
  const clearAllComputerSessions = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('computerSessions');
    setComputerSessions([]);
  };

  const addComputerAttendance = (data: Omit<ComputerCourseAttendance, 'id'>) => {
    const newAtt: ComputerCourseAttendance = {
      ...data,
      id: `ca-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    saveCollectionItem('computerAttendances', newAtt);
  };

  const updateComputerAttendance = (id: string, data: Partial<ComputerCourseAttendance>) => {
    const target = computerAttendances.find((a) => a.id === id);
    if (target) {
      const updated = { ...target, ...data };
      saveCollectionItem('computerAttendances', updated);
    }
  };

  const deleteComputerAttendance = (id: string) => safeDeleteCollectionItem('computerAttendances', id);
  const clearAllComputerAttendances = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('computerAttendances');
    setComputerAttendances([]);
  };

  const addComputerMember = (studentId: string, batch: string, preferredPc: string = 'PC-01') => {
    const std = students.find((s) => s.id === studentId);
    if (!std) return;
    const existing = computerMembers.find((m) => m.studentId === studentId);
    if (existing) {
      const updated: ComputerCourseMember = {
        ...existing,
        batch,
        preferredPc,
        status: 'Aktif',
      };
      saveCollectionItem('computerMembers', updated);
      return;
    }
    const newMember: ComputerCourseMember = {
      id: `cm-${Date.now()}`,
      studentId: std.id,
      studentName: std.fullName,
      class: std.currentClass,
      nisn: std.nisn,
      batch,
      preferredPc,
      registeredDate: new Date().toISOString().split('T')[0],
      status: 'Aktif',
    };
    saveCollectionItem('computerMembers', newMember);
  };

  const deleteComputerMember = (id: string) => safeDeleteCollectionItem('computerMembers', id);

  const tapComputerCourse = (
    studentId: string,
    sessionId: string,
    pcNumber?: string,
    method: 'RFID' | 'FaceID' | 'QR' | 'Manual' = 'RFID'
  ) => {
    const std = students.find((s) => s.id === studentId);
    const session = computerSessions.find((s) => s.id === sessionId);

    if (!std) {
      return { success: false, message: 'Data siswa tidak ditemukan dalam sistem!' };
    }
    if (!session) {
      return { success: false, message: 'Sesi les komputer tidak ditemukan!' };
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const today = now.toISOString().split('T')[0];

    // Check if PC is already occupied or auto assign
    const member = computerMembers.find((m) => m.studentId === studentId);
    const assignedPc = pcNumber || member?.preferredPc || `PC-${String(Math.floor(Math.random() * 32) + 1).padStart(2, '0')}`;

    // Check if already checked in for this session
    const existing = computerAttendances.find((a) => a.sessionId === sessionId && a.studentId === studentId);
    if (existing) {
      const updated: ComputerCourseAttendance = {
        ...existing,
        status: 'Hadir',
        timeIn: existing.timeIn === '-' ? timeStr : existing.timeIn,
        tapMethod: method,
        pcNumber: pcNumber || existing.pcNumber || assignedPc,
      };
      saveCollectionItem('computerAttendances', updated);
      return {
        success: true,
        message: `Presensi ${std.fullName} berhasil diperbarui di ${updated.pcNumber}!`,
        record: updated,
      };
    }

    const newRecord: ComputerCourseAttendance = {
      id: `ca-${Date.now()}`,
      sessionId: session.id,
      sessionTopic: session.topic,
      studentId: std.id,
      studentName: std.fullName,
      class: std.currentClass,
      nisn: std.nisn,
      date: session.date || today,
      timeIn: timeStr,
      tapMethod: method,
      pcNumber: assignedPc,
      status: 'Hadir',
      taskScore: 85,
      taskNotes: 'Hadir tepat waktu mengikuti praktikum.',
    };

    saveCollectionItem('computerAttendances', newRecord);
    return {
      success: true,
      message: `Presensi Les Komputer BERHASIL: ${std.fullName} (${assignedPc})`,
      record: newRecord,
    };
  };

  const saveGradeRecord = (record: StudentGradeRecord) => {
    saveCollectionItem('grades', record);
  };

  const saveGradesBatch = (gradeRecords: StudentGradeRecord[]) => {
    saveCollectionItemsBatch('grades', gradeRecords);
  };

  const deleteGradeRecord = (id: string) => {
    safeDeleteCollectionItem('grades', id);
  };

  const clearAllGrades = () => {
    if (!isDeleteAllowed()) return;
    clearCollectionBatch('grades', grades);
    setGrades([]);
  };

  const savePiketRecord = (record: PiketBookRecord) => {
    saveCollectionItem('piketRecords', record);
    showNotice(`Buku Piket tanggal ${record.date} berhasil disimpan.`);
  };

  const deletePiketRecord = (id: string) => {
    if (!isDeleteAllowed()) return;
    safeDeleteCollectionItem('piketRecords', id);
    showNotice('Catatan Buku Piket berhasil dihapus.');
  };

  const clearAllPiketRecords = () => {
    if (!isDeleteAllowed()) return;
    clearCollectionBatch('piketRecords', piketRecords);
    setPiketRecords([]);
    showNotice('Semua catatan Buku Piket berhasil dibersihkan.');
  };

  const resetEntireSystemData = async () => {
    if (!isDeleteAllowed()) return;
    await clearEntireCollectionInFirestore('students');
    await clearEntireCollectionInFirestore('teachers');
    await clearEntireCollectionInFirestore('classes');
    await clearEntireCollectionInFirestore('attendanceRecords');
    await clearEntireCollectionInFirestore('teacherJournals');
    await clearEntireCollectionInFirestore('permissions');
    await clearEntireCollectionInFirestore('leavePermissions');
    await clearEntireCollectionInFirestore('violationRecords');
    await clearEntireCollectionInFirestore('announcements');
    await clearEntireCollectionInFirestore('cardRequests');
    await clearEntireCollectionInFirestore('libraryTAPs');
    await clearEntireCollectionInFirestore('academicYears');
    await clearEntireCollectionInFirestore('computerSessions');
    await clearEntireCollectionInFirestore('computerAttendances');
    await clearEntireCollectionInFirestore('computerMembers');
    await clearEntireCollectionInFirestore('grades');
    await clearEntireCollectionInFirestore('piketRecords');
    setStudents([]);
    setTeachers([]);
    setClasses([]);
    setAttendanceRecords([]);
    setTeacherJournals([]);
    setPermissions([]);
    setLeavePermissions([]);
    setViolationRecords([]);
    setAnnouncements([]);
    setCardRequests([]);
    setLibraryTAPs([]);
    setAcademicYears([]);
    setComputerSessions([]);
    setComputerAttendances([]);
    setComputerMembers([]);
    setGrades([]);
    setPiketRecords([]);
  };

  const restoreDemoData = async () => {
    await saveCollectionItemsBatch('students', initialStudents);
    await saveCollectionItemsBatch('teachers', initialTeachers);
    await saveCollectionItemsBatch('classes', initialClasses);
    await saveCollectionItemsBatch('attendanceRecords', initialAttendanceRecords);
    await saveCollectionItemsBatch('teacherJournals', initialTeacherJournals);
    await saveCollectionItemsBatch('permissions', initialPermissions);
    await saveCollectionItemsBatch('leavePermissions', initialLeavePermissions);
    await saveCollectionItemsBatch('violationRecords', initialViolationRecords);
    await saveCollectionItemsBatch('announcements', initialAnnouncements);
    await saveCollectionItemsBatch('cardRequests', initialCardRequests);
    await saveCollectionItemsBatch('academicYears', initialAcademicYears);
    await saveCollectionItemsBatch('computerSessions', initialComputerSessions);
    await saveCollectionItemsBatch('computerAttendances', initialComputerAttendances);
    await saveCollectionItemsBatch('computerMembers', initialComputerMembers);
    await saveCollectionItemsBatch('grades', initialGrades);
    await saveCollectionItemsBatch('piketRecords', initialPiketRecords);
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
        updateAcademicYear,
        deleteAcademicYear,
        classes,
        addClass,
        importClasses,
        updateClass,
        deleteClass,
        clearAllClasses,
        students,
        addStudent,
        importStudents,
        updateStudent,
        updateStudentPhoto,
        updateMassStudentPhotos,
        generateMassStudentAccounts,
        deleteStudent,
        clearAllStudents,
        teachers,
        addTeacher,
        importTeachers,
        updateTeacher,
        generateMassTeacherAccounts,
        deleteTeacher,
        clearAllTeachers,
        users,
        addUser,
        updateUser,
        deleteUser,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        clearAllAnnouncements,
        attendanceRecords,
        addOrUpdateAttendance,
        deleteAttendanceRecord,
        clearAllAttendance,
        manualInputAttendance,
        tapRFIDOrScan,
        permissions,
        addPermission,
        updatePermissionStatus,
        deletePermission,
        clearAllPermissions,
        leavePermissions,
        addLeavePermission,
        deleteLeavePermission,
        teacherJournals,
        addTeacherJournal,
        updateTeacherJournal,
        deleteTeacherJournal,
        clearAllTeacherJournals,
        libraryTAPs,
        addLibraryTAP,
        deleteLibraryTAP,
        clearAllLibraryTAPs,
        libraryBooks,
        addLibraryBook,
        updateLibraryBook,
        deleteLibraryBook,
        disciplineRules,
        violationRecords,
        addViolationRecord,
        deleteViolationRecord,
        clearAllViolationRecords,
        holidays,
        addHoliday,
        deleteHoliday,
        cardRequests,
        addCardRequest,
        updateCardRequestStatus,
        deleteCardRequest,
        clearAllCardRequests,
        computerSessions,
        addComputerSession,
        updateComputerSession,
        deleteComputerSession,
        clearAllComputerSessions,
        computerAttendances,
        addComputerAttendance,
        updateComputerAttendance,
        deleteComputerAttendance,
        clearAllComputerAttendances,
        tapComputerCourse,
        computerMembers,
        addComputerMember,
        deleteComputerMember,
        grades,
        saveGradeRecord,
        saveGradesBatch,
        deleteGradeRecord,
        clearAllGrades,
        piketRecords,
        savePiketRecord,
        deletePiketRecord,
        clearAllPiketRecords,
        saveCollectionItem,
        showNotice,
        resetEntireSystemData,
        restoreDemoData,
        quotaExceeded,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/80 flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
