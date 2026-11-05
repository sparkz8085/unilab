export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin' | 'external_examiner' | 'parent';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  student_id?: string;
  employee_id?: string;
  department?: string;
  avatar_url?: string;
  is_active: boolean;
  enrolled_course_ids: string[];
  created_at: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  academic_session_id?: string;
  teacher_ids: string[];
  student_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  teachers?: User[];
  student_count?: number;
  practical_count?: number;
}

export type PracticalStatus = 'draft' | 'published' | 'archived';

export interface RubricCriterion {
  id?: string;
  criteria: string;
  max_points: number;
  description?: string;
}

export interface Attachment {
  name: string;
  url: string;
  size_bytes?: number;
  file_type?: string;
}

export interface Practical {
  id: string;
  course_id: string;
  lab_number: number;
  title: string;
  objective: string;
  instructions_md: string;
  starter_code: Record<string, string>;
  supported_languages: string[];
  rubric: RubricCriterion[];
  attachments: Attachment[];
  deadline: string;
  max_marks: number;
  status: PracticalStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  course_code?: string;
  course_title?: string;
  submission_count?: number;
  reviewed_count?: number;
  student_submission_status?: SubmissionStatus;
  student_submission_id?: string;
  student_marks_obtained?: number;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'reviewed' | 'returned';

export interface SubmissionFile {
  name: string;
  url?: string;
  size_bytes?: number;
  content?: string;
}

export interface Submission {
  id: string;
  practical_id: string;
  course_id: string;
  student_id: string;
  language: string;
  code_content: string;
  files: SubmissionFile[];
  output_text?: string;
  output_images: string[];
  student_notes?: string;
  status: SubmissionStatus;
  version: number;
  submitted_at?: string;
  marks_obtained?: number;
  feedback_id?: string;
  created_at: string;
  updated_at: string;
  student?: User;
  practical_title?: string;
  course_code?: string;
  max_marks?: number;
}

export interface RubricScore {
  criteria: string;
  score: number;
  max_points: number;
  feedback?: string;
}

export interface LineComment {
  line: number;
  comment: string;
  file_name?: string;
}

export interface Feedback {
  id: string;
  submission_id: string;
  practical_id: string;
  teacher_id: string;
  marks: number;
  rubric_scores: RubricScore[];
  comments: string;
  line_comments: LineComment[];
  reviewed_at: string;
  created_at: string;
  updated_at: string;
  teacher?: User;
}

export interface SystemStats {
  total_students: number;
  total_teachers: number;
  total_admins: number;
  total_courses: number;
  total_practicals: number;
  total_submissions: number;
  total_reviewed: number;
  submission_rate_percent: number;
  grading_rate_percent: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
