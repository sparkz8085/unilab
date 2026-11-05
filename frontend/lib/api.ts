import {
  AcademicSession,
  AuthResponse,
  Course,
  Feedback,
  LineComment,
  Practical,
  RubricScore,
  Submission,
  SubmissionFile,
  SystemStats,
  User,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'unilab_access_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, token);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || `Request failed with status ${response.status}.`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      storeToken(response.access_token);
      return response;
    },
    register: async (payload: {
      email: string;
      password: string;
      full_name: string;
      student_id?: string;
      department?: string;
    }): Promise<AuthResponse> => {
      const response = await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      storeToken(response.access_token);
      return response;
    },
    getMe: () => request<User>('/auth/me'),
  },

  users: {
    list: (role?: string, search?: string) =>
      request<User[]>(`/users${query({ role, search })}`),
    getById: (id: string) => request<User>(`/users/${id}`),
    updateProfile: (payload: Partial<User>) =>
      request<User>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    changePassword: (current_password: string, new_password: string) =>
      request<{ message: string }>('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password, new_password }),
      }),
  },

  courses: {
    list: () => request<Course[]>('/courses'),
    getById: (id: string) => request<Course>(`/courses/${id}`),
    create: (payload: Partial<Course>) =>
      request<Course>('/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Course>) =>
      request<Course>(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    enrollStudents: (id: string, student_ids: string[]) =>
      request<Course>(`/courses/${id}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ student_ids }),
      }),
  },

  practicals: {
    list: (course_id?: string, upcoming?: boolean) =>
      request<Practical[]>(`/practicals${query({ course_id, upcoming })}`),
    getById: (id: string) => request<Practical>(`/practicals/${id}`),
    create: (payload: Partial<Practical>) =>
      request<Practical>('/practicals', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Practical>) =>
      request<Practical>(`/practicals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/practicals/${id}`, { method: 'DELETE' }),
  },

  submissions: {
    submitWork: (payload: {
      practical_id: string;
      language: string;
      code_content: string;
      files?: SubmissionFile[];
      output_text?: string;
      output_images?: string[];
      student_notes?: string;
      is_draft?: boolean;
    }) =>
      request<Submission>('/submissions', {
        method: 'POST',
        body: JSON.stringify({ ...payload, files: payload.files || [] }),
      }),
    getById: (id: string) => request<Submission>(`/submissions/${id}`),
    listForPractical: (practical_id: string) =>
      request<Submission[]>(`/submissions${query({ practical_id })}`),
    getMyHistory: () => request<Submission[]>('/submissions/my-history'),
    getMyForPractical: (practical_id: string) =>
      request<Submission | null>(`/submissions/for-practical/${practical_id}`),
    uploadFile: (submission_id: string, file: File) => {
      const body = new FormData();
      body.append('file', file);
      return request<SubmissionFile>(`/submissions/${submission_id}/files`, {
        method: 'POST',
        body,
      });
    },
  },

  feedback: {
    submit: (payload: {
      submission_id: string;
      marks: number;
      rubric_scores?: RubricScore[];
      comments: string;
      line_comments?: LineComment[];
    }) =>
      request<Feedback>('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          rubric_scores: payload.rubric_scores || [],
          line_comments: payload.line_comments || [],
        }),
      }),
    getBySubmission: (submission_id: string) =>
      request<Feedback | null>(`/feedback/submission/${submission_id}`),
  },

  admin: {
    getStats: () => request<SystemStats>('/admin/stats'),
    listSessions: () => request<AcademicSession[]>('/admin/sessions'),
    createSession: (payload: Partial<AcademicSession>) =>
      request<AcademicSession>('/admin/sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  health: () => request<{ status: string; app: string; database_connected: boolean }>('/health'),
};
