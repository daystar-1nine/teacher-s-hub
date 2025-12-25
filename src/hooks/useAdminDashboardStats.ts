import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalUsers: number;
  teacherCount: number;
  studentCount: number;
  activeClasses: number;
  attendanceRate: number;
  avgPerformance: number;
  subjectsCount: number;
}

interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  metadata: any;
}

export function useAdminDashboardStats() {
  const { profile } = useAuth();
  const schoolCode = profile?.school_code;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', schoolCode],
    queryFn: async (): Promise<DashboardStats> => {
      if (!schoolCode) throw new Error('No school code');

      // Fetch all counts in parallel
      const [
        profilesResult,
        studentsResult,
        classesResult,
        attendanceResult,
        examResultsResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('role', { count: 'exact' })
          .eq('school_code', schoolCode),
        supabase
          .from('students')
          .select('id, subjects', { count: 'exact' })
          .eq('school_code', schoolCode),
        supabase
          .from('classes')
          .select('id', { count: 'exact' })
          .eq('school_code', schoolCode)
          .eq('is_active', true),
        supabase
          .from('attendance_records')
          .select('status')
          .eq('school_code', schoolCode)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        supabase
          .from('exam_results')
          .select('percentage')
          .eq('school_code', schoolCode),
      ]);

      const totalUsers = profilesResult.count || 0;
      const teacherCount = profilesResult.data?.filter(p => p.role === 'teacher').length || 0;
      const studentCount = studentsResult.count || 0;
      const activeClasses = classesResult.count || 0;

      // Calculate attendance rate
      const totalAttendance = attendanceResult.data?.length || 0;
      const presentCount = attendanceResult.data?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      // Calculate average performance
      const examPercentages = examResultsResult.data?.map(e => Number(e.percentage)) || [];
      const avgPerformance = examPercentages.length > 0
        ? Math.round(examPercentages.reduce((a, b) => a + b, 0) / examPercentages.length)
        : 0;

      // Count unique subjects
      const allSubjects = new Set<string>();
      studentsResult.data?.forEach(s => {
        s.subjects?.forEach((sub: string) => allSubjects.add(sub));
      });

      return {
        totalUsers,
        teacherCount,
        studentCount,
        activeClasses,
        attendanceRate,
        avgPerformance,
        subjectsCount: allSubjects.size,
      };
    },
    enabled: !!schoolCode,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-recent-activity', schoolCode],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!schoolCode) throw new Error('No school code');

      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, action, entity_type, created_at, metadata')
        .eq('school_code', schoolCode)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolCode,
    refetchInterval: 30000,
  });

  return {
    stats: stats || {
      totalUsers: 0,
      teacherCount: 0,
      studentCount: 0,
      activeClasses: 0,
      attendanceRate: 0,
      avgPerformance: 0,
      subjectsCount: 0,
    },
    recentActivity: recentActivity || [],
    isLoading: statsLoading || activityLoading,
  };
}
