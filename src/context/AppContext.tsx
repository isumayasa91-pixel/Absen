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

  classes: ClassData[];
  addClass: (className: string, homeroomTeacher: string, academicYear: string) => void;
  importClasses: (classList: Partial<ClassData>[]) => void;

  students: Student[];
  addStudent: (fullName: string, currentClass: string, nisn: string, gender: 'L' | 'P') => void;
  importStudents: (studentList: Partial<Student>[]) => void;
  generateMassStudentAccounts: () => void;

  teachers: Teacher[];
  addTeacher: (fullNameWithTitle: string, nip: string, position: any, phone?: string) => void;
  importTeachers: (teacherList: Partial<Teacher>[]) => void;
  generateMassTeacherAccounts: () => void;

  users: UserAccount[];
  addUser: (username: string, name: string, role: 'admin' | 'guru' | 'siswa', accessLevel: string) => void;

  announcements: Announcement[];
  addAnnouncement: (title: string, content: string, targetClass: string) => void;

  attendanceRecords: AttendanceRecord[];
  addOrUpdateAttendance: (record: AttendanceRecord) => void;
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

  leavePermissions: LeavePermission[];
  addLeavePermission: (data: Omit<LeavePermission, 'id'>) => void;

  teacherJournals: TeacherJournal[];
  addTeacherJournal: (data: Omit<TeacherJournal, 'id'>) => void;

  libraryTAPs: LibraryTAP[];
  addLibraryTAP: (studentId: string, type: 'Masuk Perpus' | 'Pinjam Buku' | 'Pengembalian Buku', barcodeBook?: string, bookTitle?: string) => void;
  libraryBooks: LibraryBook[];

  disciplineRules: DisciplineRule[];
  violationRecords: ViolationRecord[];
  addViolationRecord: (data: Omit<ViolationRecord, 'id'>) => void;

  holidays: HolidayEvent[];
  addHoliday: (date: string, title: string, type: 'Nasional' | 'Sekolah' | 'Cuti') => void;
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
  const [libraryBooks] = useState<LibraryBook[]>(() => loadFromStorage('libraryBooks', initialLibraryBooks));
  const [disciplineRules] = useState<DisciplineRule[]>(() => loadFromStorage('disciplineRules', initialDisciplineRules));
  const [violationRecords, setViolationRecords] = useState<ViolationRecord[]>(() => loadFromStorage('violationRecords', initialViolationRecords));
  const [holidays, setHolidays] = useState<HolidayEvent[]>(() => loadFromStorage('holidays', initialHolidays));

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
  useEffect(() => saveToStorage('violationRecords', violationRecords), [violationRecords]);
  useEffect(() => saveToStorage('holidays', holidays), [holidays]);

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
    const std = students.find((s) => s.id === studentId || s.rfidTag === studentId || s.nisn === studentId);
    if (!std) {
      return { success: false, message: 'Kartu RFID / Siswa tidak ditemukan!' };
    }

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    // Check time vs settings (e.g. 07:15)
    const [h, m] = nowTime.split(':').map(Number);
    const [endH, endM] = settings.timeInEnd.split(':').map(Number);
    const isLate = h > endH || (h === endH && m > endM);

    const existing = attendanceRecords.find((r) => r.studentId === std.id && r.date === today);

    let updatedRecord: AttendanceRecord;

    if (!existing || existing.statusIn === 'Belum') {
      // Clock in
      const statusFinal = isLate ? 'Terlambat' : 'Hadir';
      const statusIn = isLate ? 'Terlambat' : 'Hadir';

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
      updatedRecord = {
        ...existing,
        statusOut: 'Pulang',
        timeOut: nowTime,
      };
    }

    addOrUpdateAttendance(updatedRecord);
    return {
      success: true,
      message: `Presensi Berhasil: ${std.fullName} (${std.currentClass}) - ${updatedRecord.statusFinal} [${nowTime}]`,
      record: updatedRecord,
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
        classes,
        addClass,
        importClasses,
        students,
        addStudent,
        importStudents,
        generateMassStudentAccounts,
        teachers,
        addTeacher,
        importTeachers,
        generateMassTeacherAccounts,
        users,
        addUser,
        announcements,
        addAnnouncement,
        attendanceRecords,
        addOrUpdateAttendance,
        manualInputAttendance,
        tapRFIDOrScan,
        permissions,
        addPermission,
        updatePermissionStatus,
        leavePermissions,
        addLeavePermission,
        teacherJournals,
        addTeacherJournal,
        libraryTAPs,
        addLibraryTAP,
        libraryBooks,
        disciplineRules,
        violationRecords,
        addViolationRecord,
        holidays,
        addHoliday,
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
