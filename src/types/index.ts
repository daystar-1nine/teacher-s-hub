export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolCode: string;
  createdAt: Date;
  avatarUrl?: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  rollNumber: string;
  className: string;
  section?: string;
  subjects: string[];
  schoolCode: string;
  email: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  dateOfBirth?: Date;
  admissionDate?: Date;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  className: string;
  schoolCode: string;
  notes?: string;
  createdAt: Date;
}

export interface ExamResult {
  id: string;
  studentId: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade?: string;
  className: string;
  schoolCode: string;
  examDate: Date;
  remarks?: string;
  createdAt: Date;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  className: string;
  dueDate: Date;
  assignedBy: string;
  schoolCode: string;
  attachments?: string[];
  createdAt: Date;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  status: 'pending' | 'submitted' | 'late' | 'graded';
  submittedAt?: Date;
  content?: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  type: 'anonymous' | 'teacher';
  content: string;
  studentId?: string;
  teacherId?: string;
  className?: string;
  schoolCode: string;
  category?: string;
  isRead: boolean;
  response?: string;
  createdAt: Date;
}

export interface GoogleMeetLink {
  id: string;
  className: string;
  subject?: string;
  meetLink: string;
  teacherId: string;
  schoolCode: string;
  isActive: boolean;
  createdAt: Date;
}

export interface School {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
}

export interface TopicExplanation {
  topic: string;
  mode: 'beginner' | 'intermediate' | 'exam-focused';
  explanation: string;
  examples: string[];
  steps: string[];
  createdAt: Date;
}

export interface PerformanceInsight {
  studentId: string;
  strongSubjects: string[];
  weakSubjects: string[];
  overallTrend: 'improving' | 'stable' | 'declining';
  suggestions: string[];
  summary: string;
  generatedAt: Date;
}
