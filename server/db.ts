import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import { User, VaultDocument, ExamApplication, SystemMetrics } from '../src/types.js';
import { generate100SampleApplications } from './sample100Data.js';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let isConnectedToAtlas = false;
let clusterName = 'Local Memory Store (Free MongoDB Atlas Ready)';

// Seed users
const defaultHashedPassword = bcrypt.hashSync('Pass@1234', 8);

const seededUsers: User[] = [
  {
    id: 'usr-citizen-1',
    email: 'student@formfiller.in',
    name: 'Aarav Sharma',
    role: 'citizen',
    phone: '+91 98765 43210',
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'usr-partner-1',
    email: 'partner@formfiller.in',
    name: 'Priya Patel (CyberDesk Operator)',
    role: 'partner',
    phone: '+91 98123 45678',
    createdAt: '2026-01-20T08:30:00Z',
  },
  {
    id: 'usr-admin-1',
    email: 'admin@formfiller.in',
    name: 'Rudra Pratap Singh (Co-Founder & Admin)',
    role: 'admin',
    phone: '+91 99999 88888',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// Seed user credentials
const userPasswords: Record<string, string> = {
  'student@formfiller.in': defaultHashedPassword,
  'partner@formfiller.in': defaultHashedPassword,
  'admin@formfiller.in': defaultHashedPassword,
};

// Seed Vault Documents for student
const seededDocuments: VaultDocument[] = [
  {
    id: 'doc-aadhaar-01',
    userId: 'usr-citizen-1',
    docType: 'aadhaar',
    title: 'Aadhaar Identification Card (UIDAI)',
    fileName: 'aadhaar_front_verified.pdf',
    fileSize: '420 KB',
    extractedData: {
      fullName: 'Aarav Sharma',
      dob: '2008-04-12',
      gender: 'Male',
      fatherName: 'Rajesh Sharma',
      aadhaarMasked: 'XXXX-XXXX-8924',
      issuingAuthority: 'Unique Identification Authority of India (UIDAI)',
    },
    ocrConfidence: 0.994,
    encrypted: true,
    encryptionAlgorithm: 'AES-256-GCM',
    status: 'verified',
    uploadedAt: '2026-02-16T14:22:00Z',
  },
  {
    id: 'doc-marksheet-10th',
    userId: 'usr-citizen-1',
    docType: 'marksheet_10th',
    title: 'Class X Secondary Examination Marksheet',
    fileName: 'cbse_class_10_marksheet.pdf',
    fileSize: '1.2 MB',
    extractedData: {
      fullName: 'Aarav Sharma',
      rollNumber: '11649201',
      boardName: 'Central Board of Secondary Education (CBSE)',
      passingYear: '2024',
      totalMarks: '482 / 500',
      percentage: '96.4%',
      fatherName: 'Rajesh Sharma',
      motherName: 'Sunita Sharma',
    },
    ocrConfidence: 0.988,
    encrypted: true,
    encryptionAlgorithm: 'AES-256-GCM',
    status: 'verified',
    uploadedAt: '2026-02-16T14:35:00Z',
  },
  {
    id: 'doc-category-cert',
    userId: 'usr-citizen-1',
    docType: 'category_certificate',
    title: 'OBC-NCL Central Category Certificate',
    fileName: 'obc_ncl_central_format.pdf',
    fileSize: '890 KB',
    extractedData: {
      fullName: 'Aarav Sharma',
      category: 'OBC-NCL',
      subCategory: 'Non-Creamy Layer (Central List)',
      issueDate: '2025-08-14',
      issuingAuthority: 'Sub-Divisional Magistrate (SDM), New Delhi',
      documentNumber: 'DEL/SDM/2025/OBC/99812',
    },
    ocrConfidence: 0.981,
    encrypted: true,
    encryptionAlgorithm: 'AES-256-GCM',
    status: 'verified',
    uploadedAt: '2026-02-17T09:15:00Z',
  },
  {
    id: 'doc-photo',
    userId: 'usr-citizen-1',
    docType: 'passport_photo',
    title: 'Passport Size Photograph (White Background)',
    fileName: 'passport_photo_aarav.jpg',
    fileSize: '85 KB',
    extractedData: {
      fullName: 'Aarav Sharma',
      documentNumber: 'IMG-RES-3.5x4.5cm-300DPI',
    },
    ocrConfidence: 0.999,
    encrypted: true,
    encryptionAlgorithm: 'AES-256-GCM',
    status: 'verified',
    uploadedAt: '2026-02-17T09:20:00Z',
  },
];

// Seed Applications mapped to State Machine
const seededApplications: ExamApplication[] = [
  {
    id: 'app-jee-2026-001',
    userId: 'usr-citizen-1',
    userName: 'Aarav Sharma',
    userEmail: 'student@formfiller.in',
    userPhone: '+91 98765 43210',
    portal: 'JEE_MAIN',
    portalName: 'National Testing Agency (NTA) - JEE Main Session 2',
    examSession: '2026 Session 2 (April Cycle)',
    status: 'WAITING_OTP',
    convenienceFee: 150,
    paymentStatus: 'PAID',
    assignedPartnerId: 'usr-partner-1',
    assignedPartnerName: 'Priya Patel (CyberDesk Operator)',
    fieldMappings: [
      {
        fieldKey: 'candidate_name',
        fieldLabel: 'Candidate Full Name',
        sourceDoc: 'Aadhaar Card',
        mappedValue: 'Aarav Sharma',
        confidence: 0.998,
        isVerified: true,
        domSelector: 'input[name="ctl00$txtCandidateName"]',
      },
      {
        fieldKey: 'dob',
        fieldLabel: 'Date of Birth (DD/MM/YYYY)',
        sourceDoc: 'Aadhaar Card',
        mappedValue: '12/04/2008',
        confidence: 0.995,
        isVerified: true,
        domSelector: 'input[name="ctl00$txtDOB"]',
      },
      {
        fieldKey: 'father_name',
        fieldLabel: "Father's Full Name",
        sourceDoc: '10th Marksheet CBSE',
        mappedValue: 'Rajesh Sharma',
        confidence: 0.989,
        isVerified: true,
        domSelector: 'input[name="ctl00$txtFatherName"]',
      },
      {
        fieldKey: 'category',
        fieldLabel: 'Reservation Category',
        sourceDoc: 'OBC-NCL Certificate',
        mappedValue: 'OBC-NCL (Central List)',
        confidence: 0.982,
        isVerified: true,
        domSelector: 'select[name="ctl00$ddlCategory"]',
      },
      {
        fieldKey: 'class_10_roll',
        fieldLabel: 'Class X Roll Number & Board',
        sourceDoc: '10th Marksheet CBSE',
        mappedValue: '11649201 (CBSE)',
        confidence: 0.99,
        isVerified: true,
        domSelector: 'input[name="ctl00$txtRoll10"]',
      },
    ],
    activeOtpBridge: {
      requestId: 'otp-bridge-jee-9921',
      requestedAt: new Date(Date.now() - 45000).toISOString(),
      expiresAt: new Date(Date.now() + 135000).toISOString(),
      status: 'PENDING',
      channel: 'SMS',
    },
    createdAt: '2026-02-18T11:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-neet-2026-002',
    userId: 'usr-citizen-1',
    userName: 'Aarav Sharma',
    userEmail: 'student@formfiller.in',
    userPhone: '+91 98765 43210',
    portal: 'NEET_UG',
    portalName: 'National Testing Agency (NTA) - NEET (UG) 2026',
    examSession: 'Undergraduate Medical Entrance 2026',
    status: 'READY_FOR_SUBMISSION',
    convenienceFee: 150,
    paymentStatus: 'PAID',
    assignedPartnerId: 'usr-partner-1',
    assignedPartnerName: 'Priya Patel (CyberDesk Operator)',
    fieldMappings: [
      {
        fieldKey: 'candidate_name',
        fieldLabel: 'Candidate Name',
        sourceDoc: 'Aadhaar Card',
        mappedValue: 'Aarav Sharma',
        confidence: 0.998,
        isVerified: true,
      },
      {
        fieldKey: 'dob',
        fieldLabel: 'Birth Date',
        sourceDoc: 'Aadhaar Card',
        mappedValue: '12/04/2008',
        confidence: 0.995,
        isVerified: true,
      },
      {
        fieldKey: 'category_quota',
        fieldLabel: 'Category Quota',
        sourceDoc: 'OBC-NCL Certificate',
        mappedValue: 'OBC-NCL',
        confidence: 0.985,
        isVerified: true,
      },
    ],
    createdAt: '2026-02-20T09:30:00Z',
    updatedAt: '2026-02-20T09:40:00Z',
  },
  {
    id: 'app-upsc-2026-003',
    userId: 'usr-citizen-1',
    userName: 'Aarav Sharma',
    userEmail: 'student@formfiller.in',
    userPhone: '+91 98765 43210',
    portal: 'UPSC_CSE',
    portalName: 'Union Public Service Commission (UPSC) - Civil Services (Prelims)',
    examSession: 'Civil Services Examination 2026',
    status: 'SUBMITTED',
    convenienceFee: 150,
    paymentStatus: 'PAID',
    assignedPartnerId: 'usr-partner-1',
    assignedPartnerName: 'Priya Patel (CyberDesk Operator)',
    fieldMappings: [
      {
        fieldKey: 'candidate_name',
        fieldLabel: 'Full Name',
        sourceDoc: 'Aadhaar Card',
        mappedValue: 'Aarav Sharma',
        confidence: 0.998,
        isVerified: true,
      },
      {
        fieldKey: 'mother_name',
        fieldLabel: "Mother's Name",
        sourceDoc: '10th Marksheet CBSE',
        mappedValue: 'Sunita Sharma',
        confidence: 0.991,
        isVerified: true,
      },
    ],
    submissionReceipt: {
      acknowledgementNumber: 'UPSC-CSE-2026-DEL-981742',
      applicationNumber: '2601994812',
      submittedAt: '2026-02-19T16:42:19Z',
      portalResponseCode: 'HTTP_200_SUBMISSION_FINALIZED',
      filingOperator: 'Priya Patel (Partner-Verified Node #4)',
      verificationHash: 'sha256-e9b40fa932ccb40f80e9812e9b891823a',
    },
    createdAt: '2026-02-17T15:00:00Z',
    updatedAt: '2026-02-19T16:42:19Z',
  },
];

// Audit log list
const auditLogs: Array<{
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ip: string;
}> = [
  {
    id: 'audit-1',
    timestamp: '2026-02-19T16:42:20Z',
    actor: 'Priya Patel',
    role: 'partner',
    action: 'PORTAL_SUBMISSION_COMPLETED',
    details: 'Submitted UPSC-CSE application with verification hash',
    ip: '103.21.244.12',
  },
  {
    id: 'audit-2',
    timestamp: '2026-02-18T11:05:00Z',
    actor: 'Priya Patel',
    role: 'partner',
    action: 'OTP_BRIDGE_INITIATED',
    details: 'Triggered Human-In-The-Loop OTP request for JEE Main NTA Portal',
    ip: '103.21.244.12',
  },
  {
    id: 'audit-3',
    timestamp: '2026-02-17T14:35:00Z',
    actor: 'Aarav Sharma',
    role: 'citizen',
    action: 'VAULT_DOCUMENT_UPLOADED',
    details: 'Class X Marksheet parsed with 98.8% OCR confidence score',
    ip: '14.139.60.10',
  },
];

// Generate 100 realistic examination applications across Indian exams
const sample100Applications: ExamApplication[] = generate100SampleApplications();

// In-Memory data stores (initial 3 core demo apps + 100 realistic sample records)
const memoryUsers = [...seededUsers];
const memoryDocs = [...seededDocuments];
const memoryApps = [...seededApplications, ...sample100Applications];

// Connect to MongoDB Atlas if MONGODB_URI is provided
export async function initDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>') || uri.includes('MY_MONGODB')) {
    console.log('MongoDB: No valid MONGODB_URI found. Utilizing in-memory MongoDB-compatible store.');
    isConnectedToAtlas = false;
    clusterName = 'Embedded Memory Store (MongoDB Atlas Compatible)';
    return;
  }

  try {
    let connectionUri = uri.trim();
    // Normalize URI if database name and query string are omitted
    if (!connectionUri.includes('?') && !connectionUri.split('@')[1]?.includes('/')) {
      connectionUri = `${connectionUri}/formfiller?retryWrites=true&w=majority`;
    }

    console.log('Connecting to MongoDB Atlas at:', connectionUri.replace(/:([^@]+)@/, ':****@'));
    mongoClient = new MongoClient(connectionUri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000,
    });
    await mongoClient.connect();
    db = mongoClient.db('formfiller');
    isConnectedToAtlas = true;
    clusterName = 'MongoDB Atlas Cluster (Connected Live)';
    console.log('Successfully connected to MongoDB Atlas database:', db.databaseName);

    // Ensure collections and seed initial data if empty
    const usersCol = db.collection<User>('users');
    const existingUsers = await usersCol.countDocuments();
    if (existingUsers === 0) {
      await usersCol.insertMany(seededUsers);
      console.log('MongoDB Atlas: Seeded initial users');
    }

    const docsCol = db.collection<VaultDocument>('vault_documents');
    const existingDocs = await docsCol.countDocuments();
    if (existingDocs === 0) {
      await docsCol.insertMany(seededDocuments);
      console.log('MongoDB Atlas: Seeded initial vault documents');
    }

    const appsCol = db.collection<ExamApplication>('applications');
    const existingApps = await appsCol.countDocuments();
    if (existingApps < 10) {
      if (existingApps > 0) {
        await appsCol.deleteMany({});
      }
      await appsCol.insertMany([...seededApplications, ...sample100Applications]);
      console.log('MongoDB Atlas: Seeded initial core + 100 sample applications');
    }
  } catch (err) {
    const errorMsg = (err as Error).message || '';
    if (errorMsg.includes('SSL alert number 80') || errorMsg.includes('tlsv1 alert internal error')) {
      console.warn('⚠️ MongoDB Atlas IP Whitelist needed: In your Atlas Dashboard -> Network Access, click "Add IP Address" and select "Allow Access from Anywhere" (0.0.0.0/0).');
      clusterName = 'Embedded Memory Store (Atlas IP Whitelist Required: 0.0.0.0/0)';
    } else {
      console.warn('MongoDB Atlas connection failed or timed out. Falling back to embedded store:', errorMsg);
      clusterName = 'Embedded Memory Store (Fallback Active)';
    }
    isConnectedToAtlas = false;
  }
}

// System Metrics and Status
export function getDbStatus() {
  return {
    type: isConnectedToAtlas ? ('mongodb_atlas' as const) : ('mongodb_memory' as const),
    connected: true,
    clusterName,
    activeCollections: ['users', 'vault_documents', 'applications', 'otp_bridge', 'audit_logs'],
    uriConfigured: Boolean(process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')),
  };
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  let totalApps = memoryApps.length;
  let submittedCount = memoryApps.filter((a) => a.status === 'SUBMITTED').length;
  let pendingOtps = memoryApps.filter((a) => a.status === 'WAITING_OTP').length;

  if (isConnectedToAtlas && db) {
    try {
      totalApps = await db.collection('applications').countDocuments();
      submittedCount = await db.collection('applications').countDocuments({ status: 'SUBMITTED' });
      pendingOtps = await db.collection('applications').countDocuments({ status: 'WAITING_OTP' });
    } catch {
      // ignore
    }
  }

  return {
    tam: '₹18,000 Cr ($2.1B) / year',
    sam: '₹1,500 Cr ($180M) / year',
    som: '₹15 Cr ($1.8M) / year (100k students target)',
    arpu: 150, // ₹150 platform convenience fee per application
    ocrLatencyMs: 1240, // PRD target ≤ 1.5s
    formFillLatencyMs: 240, // PRD target ≤ 300ms
    targetMappingAccuracy: 98.6, // PRD target ≥ 98%
    systemConcurrency: 142,
    totalApplications: totalApps,
    submittedCount,
    pendingOtps,
    dbStatus: getDbStatus(),
  };
}

// User Operations
export async function findUserByEmail(email: string): Promise<User | null> {
  if (isConnectedToAtlas && db) {
    try {
      const user = await db.collection<User>('users').findOne({ email: email.toLowerCase() });
      if (user) return user;
    } catch (e) {
      console.error('Mongo findUserByEmail error:', e);
    }
  }
  return memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (isConnectedToAtlas && db) {
    try {
      const user = await db.collection<User>('users').findOne({ id });
      if (user) return user;
    } catch (e) {
      console.error('Mongo findUserById error:', e);
    }
  }
  return memoryUsers.find((u) => u.id === id) || null;
}

export async function createUser(user: User, passwordPlain: string): Promise<User> {
  const hashed = bcrypt.hashSync(passwordPlain, 8);
  userPasswords[user.email.toLowerCase()] = hashed;

  if (isConnectedToAtlas && db) {
    try {
      await db.collection('users').insertOne(user);
      await db.collection('user_auth').insertOne({ userId: user.id, email: user.email.toLowerCase(), hash: hashed });
      return user;
    } catch (e) {
      console.error('Mongo createUser error:', e);
    }
  }
  memoryUsers.push(user);
  return user;
}

export function verifyUserPassword(email: string, passwordPlain: string): boolean {
  const hash = userPasswords[email.toLowerCase()];
  if (!hash) return false;
  return bcrypt.compareSync(passwordPlain, hash);
}

export async function getAllUsers(): Promise<User[]> {
  if (isConnectedToAtlas && db) {
    try {
      return await db.collection<User>('users').find().toArray();
    } catch (e) {
      console.error('Mongo getAllUsers error:', e);
    }
  }
  return memoryUsers;
}

// Document Operations
export async function getVaultDocuments(userId: string): Promise<VaultDocument[]> {
  if (isConnectedToAtlas && db) {
    try {
      return await db.collection<VaultDocument>('vault_documents').find({ userId }).toArray();
    } catch (e) {
      console.error('Mongo getVaultDocuments error:', e);
    }
  }
  return memoryDocs.filter((d) => d.userId === userId);
}

export async function saveVaultDocument(doc: VaultDocument): Promise<VaultDocument> {
  if (isConnectedToAtlas && db) {
    try {
      await db.collection('vault_documents').insertOne(doc);
      return doc;
    } catch (e) {
      console.error('Mongo saveVaultDocument error:', e);
    }
  }
  memoryDocs.unshift(doc);
  return doc;
}

export async function deleteVaultDocument(docId: string, userId: string): Promise<boolean> {
  if (isConnectedToAtlas && db) {
    try {
      const res = await db.collection('vault_documents').deleteOne({ id: docId, userId });
      return res.deletedCount > 0;
    } catch (e) {
      console.error('Mongo deleteVaultDocument error:', e);
    }
  }
  const idx = memoryDocs.findIndex((d) => d.id === docId && d.userId === userId);
  if (idx !== -1) {
    memoryDocs.splice(idx, 1);
    return true;
  }
  return false;
}

// Application Operations
export async function getApplications(options: { userId?: string; partnerId?: string; role?: string }): Promise<ExamApplication[]> {
  if (isConnectedToAtlas && db) {
    try {
      const filter: any = {};
      if (options.role === 'citizen' && options.userId) {
        filter.userId = options.userId;
      }
      return await db.collection<ExamApplication>('applications').find(filter).toArray();
    } catch (e) {
      console.error('Mongo getApplications error:', e);
    }
  }

  if (options.role === 'citizen' && options.userId) {
    return memoryApps.filter((a) => a.userId === options.userId);
  }
  return memoryApps;
}

export async function getApplicationById(id: string): Promise<ExamApplication | null> {
  if (isConnectedToAtlas && db) {
    try {
      return await db.collection<ExamApplication>('applications').findOne({ id });
    } catch (e) {
      console.error('Mongo getApplicationById error:', e);
    }
  }
  return memoryApps.find((a) => a.id === id) || null;
}

export async function createApplication(app: ExamApplication): Promise<ExamApplication> {
  if (isConnectedToAtlas && db) {
    try {
      await db.collection('applications').insertOne(app);
      return app;
    } catch (e) {
      console.error('Mongo createApplication error:', e);
    }
  }
  memoryApps.unshift(app);
  return app;
}

export async function updateApplication(id: string, updates: Partial<ExamApplication>): Promise<ExamApplication | null> {
  updates.updatedAt = new Date().toISOString();

  if (isConnectedToAtlas && db) {
    try {
      await db.collection('applications').updateOne({ id }, { $set: updates });
      return await db.collection<ExamApplication>('applications').findOne({ id });
    } catch (e) {
      console.error('Mongo updateApplication error:', e);
    }
  }

  const idx = memoryApps.findIndex((a) => a.id === id);
  if (idx !== -1) {
    memoryApps[idx] = { ...memoryApps[idx], ...updates };
    return memoryApps[idx];
  }
  return null;
}

// Audit Logs
export function addAuditLog(entry: {
  actor: string;
  role: string;
  action: string;
  details: string;
  ip?: string;
}) {
  auditLogs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ip: entry.ip || '127.0.0.1',
    ...entry,
  });
}

export function getAuditLogs() {
  return auditLogs.slice(0, 30);
}
