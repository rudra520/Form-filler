/**
 * Utility functions for exporting data to CSV format for external record-keeping
 */

function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) return '';
  const str = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): void {
  const headerRow = headers.map(escapeCsvCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCsvCell).join(','));
  const csvContent = [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportApplicationsToCsv(applications: any[], filename = `formfiller-applications-report-${new Date().toISOString().slice(0, 10)}.csv`): void {
  const headers = [
    'Application ID',
    'Portal Key',
    'Exam Portal Name',
    'Exam Session',
    'Candidate Name',
    'Candidate Email',
    'Candidate Phone',
    'Status',
    'Convenience Fee (INR)',
    'Payment Status',
    'Assigned Partner',
    'Field Mappings Count',
    'Receipt Ack Number',
    'Submitted At',
  ];

  const rows = applications.map((app) => [
    app.id,
    app.portal,
    app.portalName,
    app.examSession,
    app.userName,
    app.userEmail,
    app.userPhone || '',
    app.status,
    app.convenienceFee,
    app.paymentStatus,
    app.assignedPartnerName || 'Unassigned',
    app.fieldMappings?.length || 0,
    app.submissionReceipt?.acknowledgementNumber || 'N/A',
    app.submissionReceipt?.submittedAt || '',
  ]);

  downloadCsv(filename, headers, rows);
}

export function exportAuditLogsToCsv(auditLogs: any[], filename = `formfiller-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`): void {
  const headers = [
    'Timestamp',
    'Log ID',
    'Action',
    'Actor Role',
    'Actor User ID',
    'Target Entity',
    'Details',
  ];

  const rows = auditLogs.map((log) => [
    log.timestamp ? new Date(log.timestamp).toISOString() : '',
    log.id || '',
    log.action,
    log.actorRole,
    log.actorId || '',
    log.targetEntity,
    typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || ''),
  ]);

  downloadCsv(filename, headers, rows);
}
