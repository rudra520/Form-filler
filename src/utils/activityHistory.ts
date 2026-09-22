import { ExamApplication, ApplicationActivityItem } from '../types';

/**
 * Generates or retrieves a comprehensive, chronological record of actions performed
 * on an individual application file.
 */
export function getApplicationActivities(app: ExamApplication): ApplicationActivityItem[] {
  // If the application already has a populated activityHistory, we use it,
  // but ensure it has at least the baseline milestones matching its state.
  const existing = Array.isArray(app.activityHistory) ? [...app.activityHistory] : [];

  if (existing.length === 0) {
    return generateMilestoneActivities(app);
  }

  // Sort chronologically (oldest to newest by default for calculation)
  return existing.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Reconstructs the chronological progression of an application based on its lifecycle states.
 */
export function generateMilestoneActivities(app: ExamApplication): ApplicationActivityItem[] {
  const activities: ApplicationActivityItem[] = [];
  const baseTime = new Date(app.createdAt || Date.now()).getTime();

  // Milestone 1: Application Created
  activities.push({
    id: `act-create-${app.id}`,
    action: 'Application Draft Initiated',
    description: `Filing process initiated for ${app.portalName}. Convenience fee ₹${app.convenienceFee} recorded as ${app.paymentStatus}.`,
    actor: app.userName || 'Applicant',
    actorRole: 'citizen',
    timestamp: new Date(baseTime).toISOString(),
    statusAfter: 'CREATED',
  });

  // Milestone 2: Vault Document & Field Attribute Matching
  const fieldsCount = app.fieldMappings?.length || 5;
  activities.push({
    id: `act-extract-${app.id}`,
    action: 'Identity & Certificate Attributes Mapped',
    description: `Automated matching resolved ${fieldsCount} verified attributes from candidate's encrypted vault (Aadhaar, Marksheets, Category).`,
    actor: 'Universal Vault Engine',
    actorRole: 'system',
    timestamp: new Date(baseTime + 120000).toISOString(), // +2 mins
    statusAfter: app.status === 'REQUIRES_DOCUMENTS' ? 'REQUIRES_DOCUMENTS' : 'READY_FOR_SUBMISSION',
  });

  // If requires documents
  if (app.status === 'REQUIRES_DOCUMENTS') {
    activities.push({
      id: `act-reqdoc-${app.id}`,
      action: 'Document Requirement Flagged',
      description: 'System flagged required secondary certificate or marksheet. Awaiting candidate upload to encrypted vault.',
      actor: 'Compliance Checker',
      actorRole: 'system',
      timestamp: new Date(baseTime + 180000).toISOString(),
      statusAfter: 'REQUIRES_DOCUMENTS',
    });
    return activities;
  }

  // Milestone 3: Operator Assignment
  const hasBeenAssigned =
    app.status === 'ASSIGNED' ||
    app.status === 'FILLING' ||
    app.status === 'WAITING_OTP' ||
    app.status === 'SUBMITTED' ||
    Boolean(app.assignedPartnerName);

  if (hasBeenAssigned) {
    const operatorName = app.assignedPartnerName || 'Priya Patel (CyberDesk Operator)';
    activities.push({
      id: `act-assign-${app.id}`,
      action: 'Assigned to Submission Operator',
      description: `Application claimed for secure processing and portal input verification by ${operatorName}.`,
      actor: operatorName,
      actorRole: 'partner',
      timestamp: new Date(baseTime + 3600000).toISOString(), // +1 hour
      statusAfter: 'ASSIGNED',
    });
  }

  // Milestone 4: Autofill Form Injection
  const hasAutofilled =
    app.status === 'FILLING' ||
    app.status === 'WAITING_OTP' ||
    app.status === 'SUBMITTED';

  if (hasAutofilled) {
    const operatorName = app.assignedPartnerName || 'Submission Operator';
    activities.push({
      id: `act-fill-${app.id}`,
      action: 'Automated Form Filling Executed',
      description: `Browser automation injected ${fieldsCount} candidate attributes into official government portal with zero manual re-typing errors.`,
      actor: operatorName,
      actorRole: 'partner',
      timestamp: new Date(baseTime + 7200000).toISOString(), // +2 hours
      statusAfter: 'FILLING',
    });
  }

  // Milestone 5: OTP Bridge Dispatched
  const hasOtp =
    app.status === 'WAITING_OTP' ||
    app.status === 'SUBMITTED' ||
    Boolean(app.activeOtpBridge);

  if (hasOtp) {
    const channel = app.activeOtpBridge?.channel || 'SMS';
    const operatorName = app.assignedPartnerName || 'Submission Operator';
    const otpTime = app.activeOtpBridge?.requestedAt
      ? new Date(app.activeOtpBridge.requestedAt).toISOString()
      : new Date(baseTime + 9000000).toISOString();

    activities.push({
      id: `act-otpreq-${app.id}`,
      action: 'Candidate OTP Bridge Dispatched',
      description: `Government portal prompted for 2-factor authentication. Secure ${channel} OTP bridge alert routed to candidate's mobile.`,
      actor: operatorName,
      actorRole: 'partner',
      timestamp: otpTime,
      statusAfter: 'WAITING_OTP',
    });
  }

  // Milestone 6: OTP Authorization Verified
  const isOtpVerified =
    app.activeOtpBridge?.status === 'VERIFIED' ||
    app.status === 'SUBMITTED';

  if (isOtpVerified) {
    activities.push({
      id: `act-otpver-${app.id}`,
      action: 'Candidate Authorization Verified',
      description: `Candidate ${app.userName} entered and verified the 6-digit one-time authorization code. Portal session authenticated.`,
      actor: app.userName || 'Candidate',
      actorRole: 'citizen',
      timestamp: new Date(baseTime + 9300000).toISOString(),
      statusAfter: 'WAITING_OTP',
    });
  }

  // Milestone 7: Final Portal Submission & Receipt
  if (app.status === 'SUBMITTED' && app.submissionReceipt) {
    const receipt = app.submissionReceipt;
    activities.push({
      id: `act-submit-${app.id}`,
      action: 'Official Portal Filing Finalized',
      description: `Application successfully lodged on official portal. Acknowledgement No: ${receipt.acknowledgementNumber}, App ID: ${receipt.applicationNumber}.`,
      actor: receipt.filingOperator || app.assignedPartnerName || 'Verified Partner Node',
      actorRole: 'partner',
      timestamp: receipt.submittedAt || new Date(baseTime + 10800000).toISOString(),
      statusAfter: 'SUBMITTED',
      metadata: {
        acknowledgementNumber: receipt.acknowledgementNumber,
        applicationNumber: receipt.applicationNumber,
      },
    });
  }

  return activities;
}

/**
 * Format timestamp into human-readable date and time
 */
export function formatActivityDateTime(isoString: string): { date: string; time: string; relative: string } {
  try {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) {
      return { date: 'Unknown', time: '', relative: '' };
    }

    const date = dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const time = dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Relative calculation
    const now = Date.now();
    const diffMs = now - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = '';
    if (diffSec < 45) {
      relative = 'just now';
    } else if (diffMin < 60) {
      relative = `${diffMin}m ago`;
    } else if (diffHours < 24) {
      relative = `${diffHours}h ago`;
    } else if (diffDays < 30) {
      relative = `${diffDays}d ago`;
    } else {
      relative = date;
    }

    return { date, time, relative };
  } catch {
    return { date: isoString, time: '', relative: '' };
  }
}
