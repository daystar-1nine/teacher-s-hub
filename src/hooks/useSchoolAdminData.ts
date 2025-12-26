import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SchoolAdminProfile {
  user_id: string;
  school_code: string;
  admin_role: string;
  is_super_admin: boolean;
  can_manage_teachers: boolean;
  can_view_students: boolean;
  can_view_reports: boolean;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  school_code: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role_data?: {
    role: string;
  };
}

export function useSchoolAdminData() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const schoolCode = profile?.school_code;

  // Get school admin profile with permissions
  const adminProfileQuery = useQuery({
    queryKey: ['school-admin-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_school_admin_profile', { _user_id: user.id });
      
      if (error) {
        console.error('Error fetching school admin profile:', error);
        return null;
      }
      
      return (data?.[0] || null) as SchoolAdminProfile | null;
    },
    enabled: !!user?.id,
  });

  // Fetch teachers in the school
  const teachersQuery = useQuery({
    queryKey: ['school-teachers', schoolCode],
    queryFn: async () => {
      if (!schoolCode) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_code', schoolCode)
        .eq('role', 'teacher')
        .order('name');
      
      if (error) {
        console.error('Error fetching teachers:', error);
        throw error;
      }
      
      return data as TeacherProfile[];
    },
    enabled: !!schoolCode,
  });

  // Fetch students count in the school
  const studentsCountQuery = useQuery({
    queryKey: ['school-students-count', schoolCode],
    queryFn: async () => {
      if (!schoolCode) return 0;
      
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_code', schoolCode);
      
      if (error) {
        console.error('Error fetching students count:', error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!schoolCode,
  });

  // Fetch classes in the school
  const classesQuery = useQuery({
    queryKey: ['school-classes', schoolCode],
    queryFn: async () => {
      if (!schoolCode) return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_code', schoolCode)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching classes:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!schoolCode,
  });

  // Fetch school info
  const schoolQuery = useQuery({
    queryKey: ['school-info', schoolCode],
    queryFn: async () => {
      if (!schoolCode) return null;
      
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('code', schoolCode)
        .single();
      
      if (error) {
        console.error('Error fetching school:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!schoolCode,
  });

  // Update teacher profile mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async ({ profileId, updates }: { profileId: string; updates: Partial<TeacherProfile> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-teachers', schoolCode] });
      toast.success('Teacher profile updated successfully');
    },
    onError: (error) => {
      console.error('Error updating teacher:', error);
      toast.error('Failed to update teacher profile');
    },
  });

  // Deactivate teacher (change role to student or remove)
  const deactivateTeacherMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      // Update user_roles to change role from teacher to student
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'student' })
        .eq('user_id', userId)
        .eq('school_code', schoolCode);
      
      if (error) throw error;
      
      // Also update profile role
      await supabase
        .from('profiles')
        .update({ role: 'student' })
        .eq('user_id', userId)
        .eq('school_code', schoolCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-teachers', schoolCode] });
      toast.success('Teacher role has been changed');
    },
    onError: (error) => {
      console.error('Error deactivating teacher:', error);
      toast.error('Failed to update teacher role');
    },
  });

  return {
    adminProfile: adminProfileQuery.data,
    isSchoolAdmin: adminProfileQuery.data?.can_manage_teachers ?? false,
    isSuperAdmin: adminProfileQuery.data?.is_super_admin ?? false,
    teachers: teachersQuery.data ?? [],
    studentsCount: studentsCountQuery.data ?? 0,
    classes: classesQuery.data ?? [],
    school: schoolQuery.data,
    schoolCode,
    isLoading: adminProfileQuery.isLoading || teachersQuery.isLoading,
    updateTeacher: updateTeacherMutation.mutate,
    deactivateTeacher: deactivateTeacherMutation.mutate,
    refetchTeachers: () => queryClient.invalidateQueries({ queryKey: ['school-teachers', schoolCode] }),
  };
}
