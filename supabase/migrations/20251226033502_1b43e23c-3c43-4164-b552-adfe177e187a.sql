-- Enhanced helper functions for school admin role management

-- Function to check if user is a school admin for any school
CREATE OR REPLACE FUNCTION public.is_any_school_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions
    WHERE user_id = _user_id 
    AND admin_role = 'school_admin'
    AND is_active = true
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = _user_id
    AND is_active = true
  )
$$;

-- Function to get the school code for a school admin
CREATE OR REPLACE FUNCTION public.get_admin_school_code(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT school_code FROM public.user_permissions WHERE user_id = _user_id AND is_active = true LIMIT 1),
    (SELECT school_code FROM public.user_roles WHERE user_id = _user_id LIMIT 1),
    (SELECT school_code FROM public.admins WHERE id = _user_id AND is_active = true LIMIT 1),
    (SELECT school_code FROM public.profiles WHERE user_id = _user_id LIMIT 1)
  )
$$;

-- Function to check if user can manage teachers in their school
CREATE OR REPLACE FUNCTION public.can_manage_teachers(_user_id uuid, _school_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Super admins can manage any school's teachers
    public.is_super_admin(_user_id)
    OR 
    -- School admins can only manage their own school's teachers
    (
      public.is_school_admin(_user_id, _school_code)
      AND public.get_admin_school_code(_user_id) = _school_code
    )
$$;

-- Function to get school admin profile with permissions
CREATE OR REPLACE FUNCTION public.get_school_admin_profile(_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  school_code text,
  admin_role text,
  is_super_admin boolean,
  can_manage_teachers boolean,
  can_view_students boolean,
  can_view_reports boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_code text;
  v_is_super boolean;
  v_admin_role text;
BEGIN
  -- Get user's school code
  v_school_code := public.get_admin_school_code(_user_id);
  
  -- Check if super admin
  v_is_super := public.is_super_admin(_user_id);
  
  -- Get admin role from user_permissions
  SELECT up.admin_role::text INTO v_admin_role
  FROM public.user_permissions up
  WHERE up.user_id = _user_id AND up.is_active = true
  LIMIT 1;
  
  -- If not in user_permissions, check admins table
  IF v_admin_role IS NULL THEN
    SELECT CASE WHEN a.is_super_admin THEN 'super_admin' ELSE 'school_admin' END INTO v_admin_role
    FROM public.admins a
    WHERE a.id = _user_id AND a.is_active = true
    LIMIT 1;
  END IF;
  
  -- If still null but has admin role in user_roles
  IF v_admin_role IS NULL THEN
    SELECT CASE WHEN ur.role = 'admin' THEN 'school_admin' ELSE ur.role::text END INTO v_admin_role
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT
    _user_id as user_id,
    v_school_code as school_code,
    COALESCE(v_admin_role, 'teacher') as admin_role,
    v_is_super as is_super_admin,
    v_is_super OR v_admin_role IN ('super_admin', 'school_admin') as can_manage_teachers,
    v_is_super OR v_admin_role IN ('super_admin', 'school_admin', 'teacher') as can_view_students,
    v_is_super OR v_admin_role IN ('super_admin', 'school_admin') as can_view_reports;
END;
$$;

-- Update profiles RLS to allow school admins to view profiles in their school
DROP POLICY IF EXISTS "School admins can view all profiles in school" ON public.profiles;
CREATE POLICY "School admins can view all profiles in school"
ON public.profiles
FOR SELECT
USING (
  school_code = public.get_admin_school_code(auth.uid())
  AND public.is_any_school_admin(auth.uid())
);

-- Update profiles to allow school admins to update teacher profiles in their school
DROP POLICY IF EXISTS "School admins can update profiles in school" ON public.profiles;
CREATE POLICY "School admins can update profiles in school"
ON public.profiles
FOR UPDATE
USING (
  school_code = public.get_admin_school_code(auth.uid())
  AND public.is_any_school_admin(auth.uid())
  AND role = 'teacher'
);

-- Add policy for school admins to view user_roles in their school
DROP POLICY IF EXISTS "School admins can view roles in their school" ON public.user_roles;
CREATE POLICY "School admins can view roles in their school"
ON public.user_roles
FOR SELECT
USING (
  school_code = public.get_admin_school_code(auth.uid())
  AND public.is_any_school_admin(auth.uid())
);

-- Add policy for school admins to update teacher roles in their school (not admin roles)
DROP POLICY IF EXISTS "School admins can update teacher roles" ON public.user_roles;
CREATE POLICY "School admins can update teacher roles"
ON public.user_roles
FOR UPDATE
USING (
  school_code = public.get_admin_school_code(auth.uid())
  AND public.is_any_school_admin(auth.uid())
  AND role IN ('teacher', 'student')  -- Can only modify teacher/student roles, not admin
  AND user_id <> auth.uid()  -- Cannot modify own role
);

-- Add policy for school admins to insert teacher roles
DROP POLICY IF EXISTS "School admins can create teacher roles" ON public.user_roles;
CREATE POLICY "School admins can create teacher roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  school_code = public.get_admin_school_code(auth.uid())
  AND public.is_any_school_admin(auth.uid())
  AND role IN ('teacher', 'student')  -- Can only create teacher/student roles, not admin
);