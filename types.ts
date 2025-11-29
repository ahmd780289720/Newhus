
export enum UserRole {
  ADMIN = 'مدير الشعبة',
  OFFICER = 'ضابط',
  INVESTIGATOR = 'محقق',
  SECURITY = 'أمن وقائي',
  INTEL = 'معلومات',
  SECRETARY = 'سكرتارية'
}

export enum Department {
  GENERAL_ADMIN = 'GENERAL_ADMIN', // يرى كل شيء
  PRISON_ADMIN = 'PRISON_ADMIN',
  INVESTIGATIONS = 'INVESTIGATIONS',
  INFO_DEPT = 'INFO_DEPT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: Department;
  avatar?: string;
  password?: string; // Added password
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  target: string; // e.g., "Inmate: Ahmed"
  timestamp: string;
}

// --- 1. Preventive Security Types ---
export interface InspectionRecord {
  id: string;
  inmateId: string;
  isPhysicallyInspected: 'Yes' | 'No' | 'Partial';
  physicalNotes: string;
  isBelongingsInspected: 'Yes' | 'No';
  belongings: { item: string; type: string; notes: string }[];
  isDocsInspected: 'Yes' | 'No';
  documents: { name: string; url: string; type: 'Image' | 'PDF' }[]; // Updated to support file objects
  initialIntel: string; 
  securityIntel: string; 
  officerName: string;
  date: string;
}

// --- 2. Inmate & Prison Types ---
export enum InmateStatus {
  PROCESSING = 'تحت الإجراء (تفتيش)',
  READY_FOR_HOUSING = 'بانتظار التسكين',
  DETAINED = 'نزيل بالسجن',
  HOSPITALIZED = 'بالمستشفى',
  INVESTIGATION = 'بالتحقيق',
  RELEASED = 'مفرج عنه',
  TRANSFERRED = 'مرحل'
}

export type InmateType = 'SUSPECT' | 'POW' | 'MILITARY';

export interface Inmate {
  id: string;
  // Basic Info
  fullName: string;
  type?: InmateType;
  nationalId: string; // Or document number
  documentType?: 'Passport' | 'ID' | 'None';
  entryDate: string;
  entryTime?: string; // Added Entry Time
  photoUrl: string;
  status: InmateStatus;
  
  // Location Info
  governorate?: string;
  village?: string;
  residence?: string;

  // Social Info
  maritalStatus?: 'Single' | 'Married';
  childrenBoys?: number;
  childrenGirls?: number;
  educationLevel?: 'University' | 'HighSchool' | 'Illiterate';
  specialization?: string; // If University

  // Legal Info
  referringAuthority: string;
  primaryCharge: string;
  chargeType?: 'Major' | 'Regular' | 'Minor';
  wardId?: string;
  caseNumber?: string;
  sentencePlan?: string;
  medicalNotes?: string;

  // Type Specific
  // Military
  unit?: string;
  
  // POW
  front?: string;
  capturePlace?: string;

  // Suspect Work Info
  workStatus?: 'Military' | 'Civilian' | 'Unemployed';
  jobTitle?: string;
  employer?: string;
}

export interface Ward {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  supervisor: string;
}

// --- 3. Investigation Types ---
export interface Case {
  id: string;
  inmateId: string;
  caseTitle: string;
  initialCharge: string;
  status: 'Open' | 'Closed';
  startDate: string;
}

export interface InvestigationMinute {
  id: string;
  caseId: string;
  inmateId: string;
  date: string;
  time?: string; // Added Minute Time
  securityCheckReviewed: boolean;
  content: string;
  conclusion: string;
  confirmedCharge: string;
  isCaseClosed: boolean;
  investigatorName: string;
  attachment?: string; // Base64 encoded string
  attachmentType?: 'PDF' | 'IMAGE';
}

// --- 4. Information Dept Types ---
export interface ExternalSource {
  id: string;
  sourceName: string;
  info: string;
  date: string;
  reliability: 'High' | 'Medium' | 'Low';
}

// --- 5. Main Branch Types ---
export interface Memo {
  id: string;
  type: 'Incoming' | 'Outgoing';
  subject: string;
  date: string;
  fromTo: string;
  status: 'Pending' | 'Done';
}

// --- 6. Wanted Persons ---
export interface WantedPerson {
  id: string;
  fullName: string;
  nationalId: string;
  dob: string;
  nationality: string;
  address: string;
  caseType: string;
  dangerLevel: 'High' | 'Medium' | 'Low';
  status: 'At Large' | 'Captured' | 'Cancelled';
  photoUrl: string;
}

// --- 7. Movements ---
export enum MovementType {
  COURT = 'محكمة',
  HOSPITAL = 'مستشفى',
  TRANSFER = 'نقل سجن',
  RELEASE = 'إفراج'
}

export interface Movement {
  id: string;
  inmateId: string;
  inmateName: string;
  type: MovementType;
  destination: string;
  checkOutTime: string;
  checkInTime?: string;
  officerName: string;
  isCompleted: boolean;
}

// --- 8. Behavior Reports ---
export enum BehaviorType {
  VIOLATION = 'مخالفة',
  REWARD = 'مكافأة',
  NOTE = 'ملاحظة'
}

export interface BehaviorReport {
  id: string;
  inmateId: string;
  type: BehaviorType;
  description: string;
  date: string;
  reportingOfficer: string;
}

export interface FavoriteItem {
  id: string;
  label: string;
  view: ViewState;
  subView?: string;
}

export type ViewState = 
  | 'DASHBOARD' 
  | 'PRISON_ADMIN' 
  | 'INVESTIGATIONS' 
  | 'INFO_DEPT' 
  | 'MAIN_BRANCH'
  | 'WANTED_MANAGER' 
  | 'REPORTS_CENTER' 
  | 'STORAGE_CENTER'
  | 'USER_MANAGER'
  | 'RELEASE_ORDER'
  | 'DEVELOPER_CONSOLE';
