
import { Inmate, InmateStatus, InspectionRecord, Case, InvestigationMinute, User, UserRole, Department, Memo, Ward, WantedPerson, Movement, MovementType, BehaviorReport, BehaviorType } from './types';

// Users
export const CURRENT_USER: User = {
  id: 'u1',
  name: 'العقيد/ خالد القحطاني',
  role: UserRole.ADMIN,
  department: Department.GENERAL_ADMIN,
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u2',
    name: 'النقيب/ فهد العتيبي',
    role: UserRole.OFFICER,
    department: Department.PRISON_ADMIN,
    avatar: 'https://i.pravatar.cc/150?u=u2'
  },
  {
    id: 'u3',
    name: 'الملازم/ سعد المالكي',
    role: UserRole.INVESTIGATOR,
    department: Department.INVESTIGATIONS,
    avatar: 'https://i.pravatar.cc/150?u=u3'
  },
  {
    id: 'u4',
    name: 'admin',
    role: UserRole.ADMIN,
    department: Department.GENERAL_ADMIN,
    avatar: 'https://i.pravatar.cc/150?u=admin',
    password: '123'
  }
];

// 1. Inmates
export const MOCK_INMATES: Inmate[] = [
  {
    id: '101',
    fullName: 'سعيد صالح العمري',
    nationalId: '1020304050',
    entryDate: '2024-05-20',
    referringAuthority: 'مكافحة المخدرات',
    photoUrl: 'https://i.pravatar.cc/150?u=101',
    status: InmateStatus.DETAINED,
    primaryCharge: 'حيازة وترويج',
    wardId: 'A1',
    caseNumber: 'C-2024-101',
    sentencePlan: '5 سنوات',
    medicalNotes: 'يعاني من الربو'
  },
  {
    id: '102',
    fullName: 'ماجد عبدالله الحربي',
    nationalId: '5040302010',
    entryDate: '2024-05-22',
    referringAuthority: 'الشرطة العسكرية',
    photoUrl: 'https://i.pravatar.cc/150?u=102',
    status: InmateStatus.PROCESSING,
    primaryCharge: 'مشاجرة',
    wardId: '',
    caseNumber: 'C-2024-102',
    sentencePlan: 'تحت الإجراء',
    medicalNotes: ''
  }
];

// Wards
export const MOCK_WARDS: Ward[] = [
  { id: 'A1', name: 'عنبر أ (مخدرات)', capacity: 50, currentCount: 45, supervisor: 'الرقيب/ محمد الدوسري' },
  { id: 'B1', name: 'عنبر ب (حقوقي)', capacity: 40, currentCount: 30, supervisor: 'الوكيل/ علي الشهري' },
  { id: 'C1', name: 'جناح العزل', capacity: 10, currentCount: 2, supervisor: 'الرقيب/ فهد القحطاني' }
];

// 2. Preventive Security Records
export const MOCK_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'ins1',
    inmateId: '101',
    isPhysicallyInspected: 'Yes',
    physicalNotes: 'يوجد وشم على الكتف الأيمن، جرح قديم في الساق.',
    isBelongingsInspected: 'Yes',
    belongings: [
      { item: 'هاتف جوال', type: 'Iphone 13', notes: 'شاشة مكسورة' },
      { item: 'مبلغ مالي', type: 'نقد', notes: '500 ريال' }
    ],
    isDocsInspected: 'Yes',
    documents: [
      { name: 'الهوية الوطنية', url: '#', type: 'Image' },
      { name: 'رخصة قيادة', url: '#', type: 'Image' }
    ],
    initialIntel: 'وردت معلومات عن علاقته بشبكة توزيع في الحي.',
    securityIntel: 'اعترف مبدئياً بوجود شحنة أخرى.',
    officerName: 'الملازم/ سعود الشريم',
    date: '2024-05-20'
  }
];

// Wanted Persons
export const MOCK_WANTED: WantedPerson[] = [
  {
    id: 'w1',
    fullName: 'خالد مسفر العجمي',
    nationalId: '1048596231',
    dob: '1985-03-12',
    nationality: 'سعودي',
    address: 'الرياض - حي النسيم',
    caseType: 'سرقة سيارات',
    dangerLevel: 'Medium',
    status: 'At Large',
    photoUrl: 'https://i.pravatar.cc/150?u=w1'
  },
  {
    id: 'w2',
    fullName: 'أحمد يوسف المصري',
    nationalId: '2058473625',
    dob: '1990-07-22',
    nationality: 'مصري',
    address: 'جدة - حي الصفا',
    caseType: 'نصب واحتيال',
    dangerLevel: 'Low',
    status: 'Captured',
    photoUrl: 'https://i.pravatar.cc/150?u=w2'
  }
];

// Movements
export const MOCK_MOVEMENTS: Movement[] = [
  {
    id: 'm1',
    inmateId: '101',
    inmateName: 'سعيد صالح العمري',
    type: MovementType.COURT,
    destination: 'المحكمة الجزائية',
    checkOutTime: '2024-05-21T08:00:00',
    checkInTime: '2024-05-21T13:30:00',
    officerName: 'الوكيل/ حمدان الشمري',
    isCompleted: true
  },
  {
    id: 'm2',
    inmateId: '101',
    inmateName: 'سعيد صالح العمري',
    type: MovementType.HOSPITAL,
    destination: 'مستشفى الملك فهد',
    checkOutTime: '2024-05-23T09:15:00',
    officerName: 'العريف/ ناصر البيشي',
    isCompleted: false
  }
];

// Behavior Reports
export const MOCK_REPORTS: BehaviorReport[] = [
  {
    id: 'r1',
    inmateId: '101',
    type: BehaviorType.VIOLATION,
    description: 'مشاجرة مع نزيل آخر في وقت الغداء',
    date: '2024-05-22',
    reportingOfficer: 'الرقيب/ محمد الدوسري'
  },
  {
    id: 'r2',
    inmateId: '101',
    type: BehaviorType.REWARD,
    description: 'التزام بالنظافة وحسن السلوك في العنبر',
    date: '2024-05-25',
    reportingOfficer: 'الرقيب/ محمد الدوسري'
  }
];
