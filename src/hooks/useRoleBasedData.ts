import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for role-based data access
 * - Students: See only their own data
 * - Teachers: See data for their assigned classes/school
 * - Admins: See all data for their school
 */
export function useRoleBasedData() {
  const { user, profile, appRole, userRoleData } = useAuth();

  const schoolCode = profile?.school_code || userRoleData?.school_code;

  /**
   * Get students based on role
   * - Student: Returns only their own student record
   * - Teacher: Returns students in their school
   * - Admin: Returns all students in their school
   */
  const getStudentsQuery = () => {
    let query = supabase.from('students').select('*');
    
    if (schoolCode) {
      query = query.eq('school_code', schoolCode);
    }
    
    // Students can only see their own record
    if (appRole === 'student' && user) {
      query = query.eq('user_id', user.id);
    }
    
    return query;
  };

  /**
   * Get attendance records based on role
   * - Student: Only their own attendance
   * - Teacher/Admin: All attendance in their school
   */
  const getAttendanceQuery = (studentId?: string) => {
    let query = supabase.from('attendance_records').select('*');
    
    if (schoolCode) {
      query = query.eq('school_code', schoolCode);
    }
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    return query;
  };

  /**
   * Get exam results based on role
   * - Student: Only their own results
   * - Teacher/Admin: All results in their school
   */
  const getExamResultsQuery = (studentId?: string) => {
    let query = supabase.from('exam_results').select('*');
    
    if (schoolCode) {
      query = query.eq('school_code', schoolCode);
    }
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    return query;
  };

  /**
   * Get homework based on role
   * - All roles can see homework for their school
   */
  const getHomeworkQuery = (className?: string) => {
    let query = supabase.from('homework').select('*');
    
    if (schoolCode) {
      query = query.eq('school_code', schoolCode);
    }
    
    if (className) {
      query = query.eq('class_name', className);
    }
    
    return query;
  };

  /**
   * Get homework submissions based on role
   * - Student: Only their own submissions
   * - Teacher/Admin: All submissions
   */
  const getHomeworkSubmissionsQuery = (studentId?: string, homeworkId?: string) => {
    let query = supabase.from('homework_submissions').select('*');
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    if (homeworkId) {
      query = query.eq('homework_id', homeworkId);
    }
    
    return query;
  };

  /**
   * Get feedback based on role
   * - Student: Only feedback addressed to them
   * - Teacher/Admin: All feedback in their school
   */
  const getFeedbackQuery = () => {
    let query = supabase.from('feedback').select('*');
    
    if (schoolCode) {
      query = query.eq('school_code', schoolCode);
    }
    
    return query;
  };

  /**
   * Get classes based on role
   * - All authenticated users can see classes in their school
   */
  const getClassesQuery = () => {
    let query = supabase.from('classes').select('*');
    
    if (schoolCode) {
      query = query.eq('school_code', schoolCode);
    }
    
    return query;
  };

  /**
   * Get announcements based on role
   * - All users see published announcements
   */
  const getAnnouncementsQuery = () => {
    let query = supabase.from('announcements').select('*').eq('is_published', true);
    
    if (schoolCode) {
      query = query.eq('school_code', schoolCode);
    }
    
    return query;
  };

  /**
   * Check if user can perform an action
   */
  const canManageStudents = appRole === 'admin' || appRole === 'teacher';
  const canManageClasses = appRole === 'admin' || appRole === 'teacher';
  const canViewAnalytics = appRole === 'admin' || appRole === 'teacher';
  const canManageSettings = appRole === 'admin';
  const canViewActivityLogs = appRole === 'admin';
  const canCreateAnnouncements = appRole === 'admin' || appRole === 'teacher';
  const canGenerateReports = appRole === 'admin' || appRole === 'teacher';

  /**
   * Get the student ID for the current user (if they are a student)
   */
  const getStudentId = async (): Promise<string | null> => {
    if (appRole !== 'student' || !user) return null;
    
    const { data } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    return data?.id || null;
  };

  return {
    // Role info
    appRole,
    schoolCode,
    isStudent: appRole === 'student',
    isTeacher: appRole === 'teacher',
    isAdmin: appRole === 'admin',
    
    // Permission checks
    canManageStudents,
    canManageClasses,
    canViewAnalytics,
    canManageSettings,
    canViewActivityLogs,
    canCreateAnnouncements,
    canGenerateReports,
    
    // Query builders
    getStudentsQuery,
    getAttendanceQuery,
    getExamResultsQuery,
    getHomeworkQuery,
    getHomeworkSubmissionsQuery,
    getFeedbackQuery,
    getClassesQuery,
    getAnnouncementsQuery,
    
    // Utilities
    getStudentId,
  };
}