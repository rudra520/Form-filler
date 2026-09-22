export type UserRole = 'citizen' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export type DocumentType =
  | 'aadhaar'
  | 'marksheet_10th'
  | 'marksheet_12th'
  | 'category_certificate'
  | 'passport_photo'
  | 'signature';

export interface VaultDocument {
  id: string;
  userId: string;
  docType: DocumentType;
  title: string;
  fileName: string;
  fileSize: string;
  extractedData: {
    fullName?: string;
    dob?: string;
    gender?: string;
    fatherName?: string;
    motherName?: string;
    rollNumber?: string;
    boardName?: string;
    passingYear?: string;
    totalMarks?: string;
    percentage?: string;
    category?: string;
    subCategory?: string;
    issueDate?: string;
    issuingAuthority?: string;
    documentNumber?: string;
    aadhaarMasked?: string;
  };
  ocrConfidence: number;
  encrypted: boolean;
  encryptionAlgorithm: string;
  status: 'verified' | 'pending' | 'review_required';
  uploadedAt: string;
}

export type ApplicationStatus =
  | 'CREATED'
  | 'REQUIRES_DOCUMENTS'
  | 'READY_FOR_SUBMISSION'
  | 'ASSIGNED'
  | 'FILLING'
  | 'WAITING_OTP'
  | 'SUBMITTED';

export type ExamPortal =
  | 'JEE_MAIN'
  | 'NEET_UG'
  | 'UPSC_CSE'
  | 'NDA_NA'
  | 'CUET_UG';

export interface FieldMapping {
  fieldKey: string;
  fieldLabel: string;
  sourceDoc: string;
  mappedValue: string;
  confidence: number;
  isVerified: boolean;
  domSelector?: string;
}

export interface SubmissionReceipt {
  acknowledgementNumber: string;
  applicationNumber: string;
  submittedAt: string;
  portalResponseCode: string;
  filingOperator: string;
  verificationHash: string;
}

export interface ApplicationActivityItem {
  id: string;
  action: string;
  description: string;
  actor: string;
  actorRole: 'citizen' | 'partner' | 'admin' | 'system';
  timestamp: string;
  statusAfter?: ApplicationStatus;
  metadata?: Record<string, any>;
}

export interface ExamApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  portal: ExamPortal;
  portalName: string;
  examSession: string;
  status: ApplicationStatus;
  convenienceFee: number;
  paymentStatus: 'PAID' | 'PENDING';
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  fieldMappings: FieldMapping[];
  activeOtpBridge?: {
    requestId: string;
    requestedAt: string;
    expiresAt: string;
    otpCode?: string;
    status: 'PENDING' | 'ENTERED' | 'VERIFIED' | 'EXPIRED';
    channel: 'SMS' | 'EMAIL' | 'DIGILOCKER';
  };
  submissionReceipt?: SubmissionReceipt;
  activityHistory?: ApplicationActivityItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemMetrics {
  tam: string;
  sam: string;
  som: string;
  arpu: number;
  ocrLatencyMs: number;
  formFillLatencyMs: number;
  targetMappingAccuracy: number;
  systemConcurrency: number;
  totalApplications: number;
  submittedCount: number;
  pendingOtps: number;
  dbStatus: {
    type: 'mongodb_atlas' | 'mongodb_memory';
    connected: boolean;
    clusterName: string;
    activeCollections: string[];
    uriConfigured: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}
