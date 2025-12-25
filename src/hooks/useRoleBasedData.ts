import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook for role-based data access
 * - Students: See only their own data
 * - Teachers: See data for their assigned classes/school
 * - Admins: See all data for their school
 */
export function useRoleBasedData() {
  const { user, profile, appRole, userRoleData } = useAuth();
  const queryClient = useQueryClient();

  const schoolCode = profile?.school_code || userRoleData?.school_code;

  // ==================== STUDENTS ====================
  const studentsQuery = useQuery({
    queryKey: ['students', schoolCode, appRole, user?.id],
    queryFn: async () => {
      let query = supabase.from('students').select('*');
      
      if (schoolCode) {
        query = query.eq('school_code', schoolCode);
      }
      
      if (appRole === 'student' && user) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolCode,
  });

  // ==================== CLASSES ====================
  const classesQuery = useQuery({
    queryKey: ['classes', schoolCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_code', schoolCode!)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolCode,
  });

  // ==================== ATTENDANCE ====================
  const getAttendanceQuery = (date?: string, className?: string) => {
    return useQuery({
      queryKey: ['attendance', schoolCode, date, className],
      queryFn: async () => {
        let query = supabase.from('attendance_records').select('*, students(name, roll_number)');
        
        if (schoolCode) query = query.eq('school_code', schoolCode);
        if (date) query = query.eq('date', date);
        if (className) query = query.eq('class_name', className);
        
        const { data, error } = await query.order('date', { ascending: false });
        if (error) throw error;
        return data || [];
      },
      enabled: !!schoolCode,
    });
  };

  const saveAttendanceMutation = useMutation({
    mutationFn: async (records: { studentId: string; date: string; status: string; className: string }[]) => {
      const formattedRecords = records.map(r => ({
        student_id: r.studentId,
        date: r.date,
        status: r.status,
        class_name: r.className,
        school_code: schoolCode,
        marked_by: user?.id,
      }));

      // Upsert attendance records
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(formattedRecords, { onConflict: 'student_id,date' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  // ==================== HOMEWORK ====================
  const homeworkQuery = useQuery({
    queryKey: ['homework', schoolCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .eq('school_code', schoolCode!)
        .order('due_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolCode,
  });

  const createHomeworkMutation = useMutation({
    mutationFn: async (hw: { title: string; description: string; subject: string; className: string; dueDate: string }) => {
      const { data, error } = await supabase
        .from('homework')
        .insert({
          title: hw.title,
          description: hw.description,
          subject: hw.subject,
          class_name: hw.className,
          due_date: hw.dueDate,
          school_code: schoolCode,
          assigned_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
  });

  // ==================== HOMEWORK SUBMISSIONS ====================
  const getHomeworkSubmissionsQuery = (homeworkId?: string) => {
    return useQuery({
      queryKey: ['homework_submissions', homeworkId],
      queryFn: async () => {
        let query = supabase.from('homework_submissions').select('*, students(name, roll_number), homework(title, subject)');
        
        if (homeworkId) query = query.eq('homework_id', homeworkId);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      },
      enabled: !!homeworkId,
    });
  };

  const submitHomeworkMutation = useMutation({
    mutationFn: async ({ homeworkId, studentId, content }: { homeworkId: string; studentId: string; content?: string }) => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .upsert({
          homework_id: homeworkId,
          student_id: studentId,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework_submissions'] });
    },
  });

  // ==================== EXAM RESULTS ====================
  const examResultsQuery = useQuery({
    queryKey: ['exam_results', schoolCode, appRole, user?.id],
    queryFn: async () => {
      let query = supabase.from('exam_results').select('*, students(name, roll_number, class_name)');
      
      if (schoolCode) query = query.eq('school_code', schoolCode);
      
      const { data, error } = await query.order('exam_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolCode,
  });

  const createExamResultMutation = useMutation({
    mutationFn: async (result: { 
      studentId: string; 
      examName: string; 
      subject: string; 
      marksObtained: number; 
      totalMarks: number; 
      className: string;
      examDate: string;
    }) => {
      const percentage = Math.round((result.marksObtained / result.totalMarks) * 100);
      const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'F';

      const { data, error } = await supabase
        .from('exam_results')
        .insert({
          student_id: result.studentId,
          exam_name: result.examName,
          subject: result.subject,
          marks_obtained: result.marksObtained,
          total_marks: result.totalMarks,
          percentage,
          grade,
          class_name: result.className,
          school_code: schoolCode,
          exam_date: result.examDate,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam_results'] });
    },
  });

  // ==================== FEEDBACK ====================
  const feedbackQuery = useQuery({
    queryKey: ['feedback', schoolCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, students(name)')
        .eq('school_code', schoolCode!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolCode,
  });

  const createFeedbackMutation = useMutation({
    mutationFn: async (fb: { type: string; content: string; studentId?: string; category?: string }) => {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          type: fb.type,
          content: fb.content,
          student_id: fb.studentId,
          teacher_id: fb.type === 'teacher' ? user?.id : null,
          school_code: schoolCode,
          category: fb.category,
          is_read: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  const markFeedbackReadMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      const { error } = await supabase
        .from('feedback')
        .update({ is_read: true })
        .eq('id', feedbackId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  // ==================== MEET LINKS ====================
  const meetLinksQuery = useQuery({
    queryKey: ['meet_links', schoolCode, appRole, user?.id],
    queryFn: async () => {
      let query = supabase.from('meet_links').select('*');
      
      if (schoolCode) query = query.eq('school_code', schoolCode);
      
      // Teachers see their own links, students see active links
      if (appRole === 'student') {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolCode,
  });

  const createMeetLinkMutation = useMutation({
    mutationFn: async (link: { className: string; subject?: string; meetLink: string }) => {
      const { data, error } = await supabase
        .from('meet_links')
        .insert({
          class_name: link.className,
          subject: link.subject,
          meet_link: link.meetLink,
          teacher_id: user?.id,
          school_code: schoolCode,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meet_links'] });
    },
  });

  const deleteMeetLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('meet_links')
        .delete()
        .eq('id', linkId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meet_links'] });
    },
  });

  // ==================== UTILITIES ====================
  const getStudentId = async (): Promise<string | null> => {
    if (appRole !== 'student' || !user) return null;
    
    const { data } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    return data?.id || null;
  };

  const getClassOptions = () => {
    return classesQuery.data?.map(c => c.name) || [];
  };

  // Static subject list (could be fetched from DB in future)
  const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography'];

  return {
    // Role info
    appRole,
    schoolCode,
    isStudent: appRole === 'student',
    isTeacher: appRole === 'teacher',
    isAdmin: appRole === 'admin',
    
    // Permission checks
    canManageStudents: appRole === 'admin' || appRole === 'teacher',
    canManageClasses: appRole === 'admin' || appRole === 'teacher',
    canViewAnalytics: appRole === 'admin' || appRole === 'teacher',
    canManageSettings: appRole === 'admin',
    canViewActivityLogs: appRole === 'admin',
    canCreateAnnouncements: appRole === 'admin' || appRole === 'teacher',
    canGenerateReports: appRole === 'admin' || appRole === 'teacher',
    
    // Data queries
    studentsQuery,
    classesQuery,
    homeworkQuery,
    examResultsQuery,
    feedbackQuery,
    meetLinksQuery,
    
    // Query functions (for dynamic params)
    getAttendanceQuery,
    getHomeworkSubmissionsQuery,
    
    // Mutations
    saveAttendanceMutation,
    createHomeworkMutation,
    submitHomeworkMutation,
    createExamResultMutation,
    createFeedbackMutation,
    markFeedbackReadMutation,
    createMeetLinkMutation,
    deleteMeetLinkMutation,
    
    // Utilities
    getStudentId,
    getClassOptions,
    subjectOptions,
  };
}
