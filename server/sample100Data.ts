import { ExamApplication, VaultDocument, User, ExamPortal, ApplicationStatus, ApplicationActivityItem } from '../src/types.js';

// Realistic Indian candidate names
const firstNames = [
  'Aarav', 'Aditi', 'Ananya', 'Aryan', 'Ayush', 'Bhavya', 'Chirag', 'Devansh', 'Diya', 'Divyansh',
  'Gauri', 'Hardik', 'Ishaan', 'Isha', 'Kavya', 'Krish', 'Lakshya', 'Manish', 'Meera', 'Mohit',
  'Nikhil', 'Neha', 'Pranav', 'Pooja', 'Rahul', 'Riya', 'Rohan', 'Sakshi', 'Sameer', 'Sanvi',
  'Shaurya', 'Shreya', 'Siddharth', 'Sneha', 'Tanmay', 'Tanya', 'Utkarsh', 'Vaishnavi', 'Varun', 'Yash',
  'Alok', 'Deepak', 'Kiran', 'Nandini', 'Pankaj', 'Rashmi', 'Saurabh', 'Swati', 'Vikas', 'Zoya'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Joshi', 'Mehta', 'Reddy', 'Chauhan',
  'Mishra', 'Yadav', 'Pandey', 'Nair', 'Deshmukh', 'Bose', 'Mukherjee', 'Rao', 'Iyer', 'Agarwal',
  'Kulkarni', 'Malhotra', 'Bhatia', 'Saxena', 'Kapoor', 'Trivedi', 'Tripathi', 'Thakur', 'Goswami', 'Chopra'
];

const portalConfigs: Array<{
  portal: ExamPortal;
  portalName: string;
  sessions: string[];
  baseFee: number;
}> = [
  {
    portal: 'JEE_MAIN',
    portalName: 'National Testing Agency (NTA) - JEE (Main) 2026',
    sessions: ['Session 1 (Jan 2026)', 'Session 2 (April 2026)'],
    baseFee: 150,
  },
  {
    portal: 'NEET_UG',
    portalName: 'National Testing Agency (NTA) - NEET (UG) 2026',
    sessions: ['Undergraduate Medical Entrance 2026'],
    baseFee: 150,
  },
  {
    portal: 'UPSC_CSE',
    portalName: 'Union Public Service Commission (UPSC) - Civil Services (Prelims)',
    sessions: ['Civil Services Examination 2026'],
    baseFee: 150,
  },
  {
    portal: 'NDA_NA',
    portalName: 'Union Public Service Commission (UPSC) - NDA & Naval Academy',
    sessions: ['Cycle I - April 2026', 'Cycle II - Sept 2026'],
    baseFee: 150,
  },
  {
    portal: 'CUET_UG',
    portalName: 'National Testing Agency (NTA) - CUET (UG) 2026',
    sessions: ['Undergraduate Common Entrance 2026-27'],
    baseFee: 150,
  },
];

const statuses: ApplicationStatus[] = [
  'SUBMITTED',
  'SUBMITTED',
  'SUBMITTED',
  'WAITING_OTP',
  'FILLING',
  'ASSIGNED',
  'READY_FOR_SUBMISSION',
  'REQUIRES_DOCUMENTS',
  'CREATED',
];

const operators = [
  'Priya Patel (CyberDesk Operator Node #4)',
  'Vikram Sen (Digital Seva Kendra #12)',
  'Amitabh Roy (CyberEnclave Hub #02)',
  'Sunita Rao (GovFiling Express Node #07)',
];

export function generate100SampleApplications(): ExamApplication[] {
  const apps: ExamApplication[] = [];

  for (let i = 1; i <= 100; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[(i * 3) % lastNames.length];
    const fullName = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${100 + i}@gmail.com`;
    const phone = `+91 ${9800000000 + ((i * 123456) % 199999999)}`;
    const cfg = portalConfigs[i % portalConfigs.length];
    const session = cfg.sessions[i % cfg.sessions.length];
    const status = statuses[i % statuses.length];
    const padIndex = String(i).padStart(3, '0');
    const appId = `app-${cfg.portal.toLowerCase().replace('_', '-')}-2026-${padIndex}`;

    // Creation date spread across past 30 days
    const daysAgo = (100 - i) * 0.25;
    const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const isSubmitted = status === 'SUBMITTED';
    const isWaitingOtp = status === 'WAITING_OTP';

    const ackNum = `${cfg.portal}-2026-${String(Math.floor(100000 + i * 417))}`;
    const appNum = `2601${String(100000 + i * 832)}`;

    const app: ExamApplication = {
      id: appId,
      userId: `usr-citizen-${100 + i}`,
      userName: fullName,
      userEmail: email,
      userPhone: phone,
      portal: cfg.portal,
      portalName: cfg.portalName,
      examSession: session,
      status,
      convenienceFee: cfg.baseFee,
      paymentStatus: status === 'CREATED' ? 'PENDING' : 'PAID',
      assignedPartnerId: status !== 'CREATED' && status !== 'REQUIRES_DOCUMENTS' ? 'usr-partner-1' : undefined,
      assignedPartnerName: status !== 'CREATED' && status !== 'REQUIRES_DOCUMENTS' ? operators[i % operators.length] : undefined,
      fieldMappings: [
        {
          fieldKey: 'candidate_name',
          fieldLabel: 'Candidate Full Name',
          sourceDoc: 'Aadhaar Identification Card',
          mappedValue: fullName,
          confidence: 0.995,
          isVerified: true,
          domSelector: 'input[name="txtCandidateName"]',
        },
        {
          fieldKey: 'dob',
          fieldLabel: 'Date of Birth (DD/MM/YYYY)',
          sourceDoc: 'Aadhaar / Class X Marksheet',
          mappedValue: `${String((i % 28) + 1).padStart(2, '0')}/${String((i % 12) + 1).padStart(2, '0')}/${2005 + (i % 4)}`,
          confidence: 0.992,
          isVerified: true,
          domSelector: 'input[name="txtDOB"]',
        },
        {
          fieldKey: 'category',
          fieldLabel: 'Reservation Category',
          sourceDoc: 'Category Certificate',
          mappedValue: i % 3 === 0 ? 'OBC-NCL' : i % 5 === 0 ? 'EWS' : i % 7 === 0 ? 'SC' : 'General / Unreserved',
          confidence: 0.985,
          isVerified: true,
          domSelector: 'select[name="ddlCategory"]',
        },
        {
          fieldKey: 'class_10_roll',
          fieldLabel: 'Class X Roll Number & Board',
          sourceDoc: 'Class X Secondary Marksheet',
          mappedValue: `${11400000 + i * 192} (CBSE)`,
          confidence: 0.99,
          isVerified: true,
          domSelector: 'input[name="txtRoll10"]',
        },
        {
          fieldKey: 'father_name',
          fieldLabel: "Father's Full Name",
          sourceDoc: 'Class X Secondary Marksheet',
          mappedValue: `Rajendra ${lName}`,
          confidence: 0.988,
          isVerified: true,
          domSelector: 'input[name="txtFatherName"]',
        },
      ],
      createdAt,
      updatedAt: new Date(Date.now() - (daysAgo * 0.5) * 86400000).toISOString(),
    };

    if (isSubmitted) {
      app.submissionReceipt = {
        acknowledgementNumber: ackNum,
        applicationNumber: appNum,
        submittedAt: new Date(Date.now() - (daysAgo * 0.4) * 86400000).toISOString(),
        portalResponseCode: 'HTTP_200_SUBMISSION_FINALIZED',
        filingOperator: operators[i % operators.length],
        verificationHash: `sha256-ff7a${Math.random().toString(36).substring(2, 12)}${i}a`,
      };
    }

    if (isWaitingOtp) {
      app.activeOtpBridge = {
        requestId: `otp-bridge-live-${1000 + i}`,
        requestedAt: new Date(Date.now() - 40000).toISOString(),
        expiresAt: new Date(Date.now() + 140000).toISOString(),
        status: 'PENDING',
        channel: 'SMS',
      };
    }

    // Build rich chronological activity history
    const baseTime = new Date(createdAt).getTime();
    const operatorName = operators[i % operators.length];
    const activities: ApplicationActivityItem[] = [
      {
        id: `act-1-${appId}`,
        action: 'Application Draft Initiated',
        description: `Candidate initiated filing for ${cfg.portalName}. Platform convenience fee ₹${cfg.baseFee} recorded.`,
        actor: fullName,
        actorRole: 'citizen',
        timestamp: new Date(baseTime).toISOString(),
        statusAfter: 'CREATED',
      },
      {
        id: `act-2-${appId}`,
        action: 'Identity & Certificate Attributes Mapped',
        description: 'Universal vault successfully extracted verified personal and academic attributes with zero-error validation.',
        actor: 'Universal Vault Engine',
        actorRole: 'system',
        timestamp: new Date(baseTime + 120000).toISOString(),
        statusAfter: status === 'REQUIRES_DOCUMENTS' ? 'REQUIRES_DOCUMENTS' : 'READY_FOR_SUBMISSION',
      },
    ];

    if (status === 'REQUIRES_DOCUMENTS') {
      activities.push({
        id: `act-req-${appId}`,
        action: 'Document Upload Required',
        description: 'Missing required category certificate or 12th marksheet. Candidate alert notification triggered.',
        actor: 'Compliance Checker',
        actorRole: 'system',
        timestamp: new Date(baseTime + 180000).toISOString(),
        statusAfter: 'REQUIRES_DOCUMENTS',
      });
    } else if (status !== 'CREATED') {
      activities.push({
        id: `act-3-${appId}`,
        action: 'Assigned to Submission Operator',
        description: `Application assigned to ${operatorName} for official portal verification.`,
        actor: operatorName,
        actorRole: 'partner',
        timestamp: new Date(baseTime + 1800000).toISOString(),
        statusAfter: 'ASSIGNED',
      });

      if (status === 'FILLING' || status === 'WAITING_OTP' || isSubmitted) {
        activities.push({
          id: `act-4-${appId}`,
          action: 'Automated Form Filling Injected',
          description: `FormFiller injected 5 candidate attributes into official government portal with zero manual re-typing errors.`,
          actor: operatorName,
          actorRole: 'partner',
          timestamp: new Date(baseTime + 3600000).toISOString(),
          statusAfter: 'FILLING',
        });
      }

      if (status === 'WAITING_OTP' || isSubmitted) {
        activities.push({
          id: `act-5-${appId}`,
          action: 'Candidate OTP Bridge Dispatched',
          description: 'Official government portal prompted for 2-factor authentication. Secure SMS bridge alert dispatched to candidate.',
          actor: operatorName,
          actorRole: 'partner',
          timestamp: new Date(baseTime + 4800000).toISOString(),
          statusAfter: 'WAITING_OTP',
        });
      }

      if (isSubmitted) {
        activities.push({
          id: `act-6-${appId}`,
          action: 'Candidate Authorization Verified',
          description: 'Candidate verified mobile OTP authorization. Operator authorized to finalize filing.',
          actor: fullName,
          actorRole: 'citizen',
          timestamp: new Date(baseTime + 5000000).toISOString(),
          statusAfter: 'WAITING_OTP',
        });

        activities.push({
          id: `act-7-${appId}`,
          action: 'Official Portal Filing Finalized',
          description: `Application successfully lodged on official portal. Acknowledgement No: ${ackNum}, Application ID: ${appNum}.`,
          actor: operatorName,
          actorRole: 'partner',
          timestamp: app.submissionReceipt!.submittedAt,
          statusAfter: 'SUBMITTED',
          metadata: {
            acknowledgementNumber: ackNum,
            applicationNumber: appNum,
          },
        });
      }
    }

    app.activityHistory = activities;
    apps.push(app);
  }

  return apps;
}
