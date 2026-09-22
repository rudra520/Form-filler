import {
  User,
  UserRole,
  VaultDocument,
  ExamApplication,
  SystemMetrics,
  DocumentType,
  ExamPortal,
} from '../types';

const TOKEN_KEY = 'formfiller_jwt_token';
const USER_KEY = 'formfiller_user';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public static setAuth(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public static clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  public static logout() {
    this.clearAuth();
  }

  public static getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    return res.json();
  }

  // Auth
  public static async login(email: string, passwordPlain: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain }),
    });
    this.setAuth(data.token, data.user);
    return data;
  }

  public static async register(payload: {
    name: string;
    email: string;
    passwordPlain: string;
    role: UserRole;
    phone?: string;
  }): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.passwordPlain,
        role: payload.role,
        phone: payload.phone,
      }),
    });
    this.setAuth(data.token, data.user);
    return data;
  }

  public static async switchDemoRole(role: UserRole): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setAuth(data.token, data.user);
    return data;
  }

  public static async getMe(): Promise<User> {
    const data = await this.request<{ user: User }>('/auth/me');
    return data.user;
  }

  // Universal Vault
  public static async getVaultDocuments(userId?: string): Promise<VaultDocument[]> {
    const query = userId ? `?userId=${userId}` : '';
    const data = await this.request<{ documents: VaultDocument[] }>(`/vault${query}`);
    return data.documents;
  }

  public static async uploadVaultDocument(payload: {
    docType: DocumentType;
    title: string;
    fileName: string;
    fileSize: string;
    extractedData?: any;
    samplePreset?: boolean;
  }): Promise<VaultDocument> {
    const data = await this.request<{ document: VaultDocument }>('/vault/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.document;
  }

  public static async deleteVaultDocument(id: string): Promise<void> {
    await this.request(`/vault/${id}`, { method: 'DELETE' });
  }

  // OCR
  public static async runOcrExtraction(documentType: string, textSnippet?: string) {
    return this.request<{ extractedData: any; confidence: number; engine: string }>('/ocr/extract', {
      method: 'POST',
      body: JSON.stringify({ documentType, textSnippet }),
    });
  }

  // Applications
  public static async getApplications(): Promise<ExamApplication[]> {
    const data = await this.request<{ applications: ExamApplication[] }>('/applications');
    return data.applications;
  }

  public static async getApplicationById(id: string): Promise<ExamApplication> {
    const data = await this.request<{ application: ExamApplication }>(`/applications/${id}`);
    return data.application;
  }

  public static async createApplication(portal: ExamPortal, examSession?: string): Promise<ExamApplication> {
    const data = await this.request<{ application: ExamApplication }>('/applications', {
      method: 'POST',
      body: JSON.stringify({ portal, examSession }),
    });
    return data.application;
  }

  public static async assignApplication(id: string): Promise<ExamApplication> {
    const data = await this.request<{ application: ExamApplication }>(`/applications/${id}/assign`, {
      method: 'POST',
    });
    return data.application;
  }

  public static async runAutofill(id: string): Promise<{ application: ExamApplication; executionReport: any }> {
    return this.request<{ application: ExamApplication; executionReport: any }>(`/applications/${id}/run-autofill`, {
      method: 'POST',
    });
  }

  public static async requestOtpBridge(id: string): Promise<{ application: ExamApplication; message: string }> {
    return this.request<{ application: ExamApplication; message: string }>(`/applications/${id}/request-otp`, {
      method: 'POST',
    });
  }

  public static async submitOtp(id: string, otpCode: string): Promise<{ application: ExamApplication; message: string }> {
    return this.request<{ application: ExamApplication; message: string }>(`/applications/${id}/submit-otp`, {
      method: 'POST',
      body: JSON.stringify({ otpCode }),
    });
  }

  public static async submitCandidateOtp(id: string, otpCode: string): Promise<{ application: ExamApplication; message: string }> {
    return this.submitOtp(id, otpCode);
  }

  public static async finalizeSubmission(id: string): Promise<{
    application: ExamApplication;
    receipt: any;
    message: string;
  }> {
    return this.request<{ application: ExamApplication; receipt: any; message: string }>(
      `/applications/${id}/finalize-submission`,
      { method: 'POST' }
    );
  }

  public static async addApplicationActivity(
    id: string,
    payload: { action?: string; description: string; metadata?: any }
  ): Promise<{ application: ExamApplication; activity: any; message: string }> {
    return this.request<{ application: ExamApplication; activity: any; message: string }>(
      `/applications/${id}/activity`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  // Metrics and System
  public static async getMetrics(): Promise<SystemMetrics> {
    return this.request<SystemMetrics>('/metrics');
  }

  public static async getAuditLogs(): Promise<Array<any>> {
    const data = await this.request<{ logs: any[] }>('/audit-logs');
    return data.logs;
  }
}
