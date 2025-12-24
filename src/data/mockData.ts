import { Student, AttendanceRecord, ExamResult, Homework, HomeworkSubmission, Feedback, GoogleMeetLink } from '@/types';

export const mockStudents: Student[] = [
  {
    id: 'std-1',
    userId: 'user-std-1',
    name: 'Alex Thompson',
    rollNumber: '001',
    className: '10-A',
    section: 'A',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
    schoolCode: 'DEMO2024',
    email: 'alex.t@school.edu',
    phone: '555-0101',
    parentName: 'John Thompson',
    parentPhone: '555-0102',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'std-2',
    userId: 'user-std-2',
    name: 'Emma Wilson',
    rollNumber: '002',
    className: '10-A',
    section: 'A',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'],
    schoolCode: 'DEMO2024',
    email: 'emma.w@school.edu',
    phone: '555-0201',
    parentName: 'Sarah Wilson',
    parentPhone: '555-0202',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'std-3',
    userId: 'user-std-3',
    name: 'James Chen',
    rollNumber: '003',
    className: '10-A',
    section: 'A',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
    schoolCode: 'DEMO2024',
    email: 'james.c@school.edu',
    phone: '555-0301',
    parentName: 'Wei Chen',
    parentPhone: '555-0302',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'std-4',
    userId: 'user-std-4',
    name: 'Sophia Rodriguez',
    rollNumber: '004',
    className: '10-A',
    section: 'A',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'],
    schoolCode: 'DEMO2024',
    email: 'sophia.r@school.edu',
    phone: '555-0401',
    parentName: 'Maria Rodriguez',
    parentPhone: '555-0402',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'std-5',
    userId: 'user-std-5',
    name: 'Liam Johnson',
    rollNumber: '005',
    className: '10-B',
    section: 'B',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
    schoolCode: 'DEMO2024',
    email: 'liam.j@school.edu',
    phone: '555-0501',
    parentName: 'David Johnson',
    parentPhone: '555-0502',
    createdAt: new Date('2024-01-15'),
  },
];

export const mockAttendance: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'std-1', date: '2024-12-20', status: 'present', markedBy: 'teacher-1', className: '10-A', schoolCode: 'DEMO2024', createdAt: new Date() },
  { id: 'att-2', studentId: 'std-2', date: '2024-12-20', status: 'present', markedBy: 'teacher-1', className: '10-A', schoolCode: 'DEMO2024', createdAt: new Date() },
  { id: 'att-3', studentId: 'std-3', date: '2024-12-20', status: 'absent', markedBy: 'teacher-1', className: '10-A', schoolCode: 'DEMO2024', createdAt: new Date() },
  { id: 'att-4', studentId: 'std-4', date: '2024-12-20', status: 'late', markedBy: 'teacher-1', className: '10-A', schoolCode: 'DEMO2024', createdAt: new Date() },
  { id: 'att-5', studentId: 'std-1', date: '2024-12-19', status: 'present', markedBy: 'teacher-1', className: '10-A', schoolCode: 'DEMO2024', createdAt: new Date() },
  { id: 'att-6', studentId: 'std-2', date: '2024-12-19', status: 'present', markedBy: 'teacher-1', className: '10-A', schoolCode: 'DEMO2024', createdAt: new Date() },
  { id: 'att-7', studentId: 'std-3', date: '2024-12-19', status: 'present', markedBy: 'teacher-1', className: '10-A', schoolCode: 'DEMO2024', createdAt: new Date() },
  { id: 'att-8', studentId: 'std-4', date: '2024-12-19', status: 'present', markedBy: 'teacher-1', className: '10-A', schoolCode: 'DEMO2024', createdAt: new Date() },
];

export const mockExamResults: ExamResult[] = [
  { id: 'exam-1', studentId: 'std-1', examName: 'Mid-Term', subject: 'Mathematics', marksObtained: 85, totalMarks: 100, percentage: 85, grade: 'A', className: '10-A', schoolCode: 'DEMO2024', examDate: new Date('2024-10-15'), createdAt: new Date() },
  { id: 'exam-2', studentId: 'std-1', examName: 'Mid-Term', subject: 'Physics', marksObtained: 78, totalMarks: 100, percentage: 78, grade: 'B+', className: '10-A', schoolCode: 'DEMO2024', examDate: new Date('2024-10-16'), createdAt: new Date() },
  { id: 'exam-3', studentId: 'std-1', examName: 'Mid-Term', subject: 'Chemistry', marksObtained: 92, totalMarks: 100, percentage: 92, grade: 'A+', className: '10-A', schoolCode: 'DEMO2024', examDate: new Date('2024-10-17'), createdAt: new Date() },
  { id: 'exam-4', studentId: 'std-1', examName: 'Mid-Term', subject: 'English', marksObtained: 70, totalMarks: 100, percentage: 70, grade: 'B', className: '10-A', schoolCode: 'DEMO2024', examDate: new Date('2024-10-18'), createdAt: new Date() },
  { id: 'exam-5', studentId: 'std-2', examName: 'Mid-Term', subject: 'Mathematics', marksObtained: 90, totalMarks: 100, percentage: 90, grade: 'A+', className: '10-A', schoolCode: 'DEMO2024', examDate: new Date('2024-10-15'), createdAt: new Date() },
  { id: 'exam-6', studentId: 'std-2', examName: 'Mid-Term', subject: 'Physics', marksObtained: 88, totalMarks: 100, percentage: 88, grade: 'A', className: '10-A', schoolCode: 'DEMO2024', examDate: new Date('2024-10-16'), createdAt: new Date() },
  { id: 'exam-7', studentId: 'std-3', examName: 'Mid-Term', subject: 'Mathematics', marksObtained: 65, totalMarks: 100, percentage: 65, grade: 'C+', className: '10-A', schoolCode: 'DEMO2024', examDate: new Date('2024-10-15'), createdAt: new Date() },
  { id: 'exam-8', studentId: 'std-3', examName: 'Mid-Term', subject: 'Computer Science', marksObtained: 95, totalMarks: 100, percentage: 95, grade: 'A+', className: '10-A', schoolCode: 'DEMO2024', examDate: new Date('2024-10-19'), createdAt: new Date() },
];

export const mockHomework: Homework[] = [
  {
    id: 'hw-1',
    title: 'Quadratic Equations Practice',
    description: 'Solve problems 1-20 from Chapter 4. Show all working steps.',
    subject: 'Mathematics',
    className: '10-A',
    dueDate: new Date('2024-12-27'),
    assignedBy: 'teacher-1',
    schoolCode: 'DEMO2024',
    createdAt: new Date('2024-12-20'),
  },
  {
    id: 'hw-2',
    title: 'Newton\'s Laws Essay',
    description: 'Write a 500-word essay explaining the three laws of motion with real-world examples.',
    subject: 'Physics',
    className: '10-A',
    dueDate: new Date('2024-12-28'),
    assignedBy: 'teacher-1',
    schoolCode: 'DEMO2024',
    createdAt: new Date('2024-12-20'),
  },
  {
    id: 'hw-3',
    title: 'Chemical Bonding Worksheet',
    description: 'Complete the worksheet on ionic and covalent bonding.',
    subject: 'Chemistry',
    className: '10-A',
    dueDate: new Date('2024-12-25'),
    assignedBy: 'teacher-1',
    schoolCode: 'DEMO2024',
    createdAt: new Date('2024-12-19'),
  },
];

export const mockHomeworkSubmissions: HomeworkSubmission[] = [
  { id: 'sub-1', homeworkId: 'hw-1', studentId: 'std-1', status: 'submitted', submittedAt: new Date('2024-12-22'), createdAt: new Date() },
  { id: 'sub-2', homeworkId: 'hw-1', studentId: 'std-2', status: 'pending', createdAt: new Date() },
  { id: 'sub-3', homeworkId: 'hw-1', studentId: 'std-3', status: 'pending', createdAt: new Date() },
  { id: 'sub-4', homeworkId: 'hw-2', studentId: 'std-1', status: 'pending', createdAt: new Date() },
  { id: 'sub-5', homeworkId: 'hw-3', studentId: 'std-1', status: 'graded', submittedAt: new Date('2024-12-21'), grade: 85, feedback: 'Excellent work!', createdAt: new Date() },
];

export const mockFeedback: Feedback[] = [
  { id: 'fb-1', type: 'anonymous', content: 'The physics lessons are very engaging. Love the experiments!', schoolCode: 'DEMO2024', category: 'Praise', isRead: true, createdAt: new Date('2024-12-18') },
  { id: 'fb-2', type: 'anonymous', content: 'Could we have more group activities in mathematics class?', schoolCode: 'DEMO2024', category: 'Suggestion', isRead: false, createdAt: new Date('2024-12-19') },
  { id: 'fb-3', type: 'teacher', content: 'Alex shows great improvement in problem-solving skills.', studentId: 'std-1', teacherId: 'teacher-1', schoolCode: 'DEMO2024', isRead: true, createdAt: new Date('2024-12-20') },
];

export const mockMeetLinks: GoogleMeetLink[] = [
  { id: 'meet-1', className: '10-A', subject: 'Mathematics', meetLink: 'https://meet.google.com/abc-defg-hij', teacherId: 'teacher-1', schoolCode: 'DEMO2024', isActive: true, createdAt: new Date() },
  { id: 'meet-2', className: '10-A', subject: 'Physics', meetLink: 'https://meet.google.com/klm-nopq-rst', teacherId: 'teacher-1', schoolCode: 'DEMO2024', isActive: true, createdAt: new Date() },
  { id: 'meet-3', className: '10-B', subject: 'Chemistry', meetLink: 'https://meet.google.com/uvw-xyz-123', teacherId: 'teacher-1', schoolCode: 'DEMO2024', isActive: true, createdAt: new Date() },
];

export const classOptions = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];
export const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography'];
