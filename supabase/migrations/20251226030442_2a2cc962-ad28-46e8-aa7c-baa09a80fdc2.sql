-- ============================================
-- FIX 1: Security Definer Functions to Break RLS Recursion
-- ============================================

-- Function to get user's school_code without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_school_code(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_code FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Function to get user's role without triggering RLS (for user_roles table)
CREATE OR REPLACE FUNCTION public.get_user_app_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Function to get user's profile role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_profile_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- ============================================
-- FIX 2: Drop and Recreate Profiles RLS Policies
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with security definer functions
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view profiles in their school"
ON public.profiles FOR SELECT
USING (
  school_code = public.get_user_school_code(auth.uid())
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- FIX 3: Drop and Recreate User Roles RLS Policies
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles in their school" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Recreate with security definer functions
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles in their school"
ON public.user_roles FOR SELECT
USING (
  public.get_user_app_role(auth.uid()) = 'admin' AND
  school_code = public.get_user_school_code(auth.uid())
);

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (
  public.get_user_app_role(auth.uid()) = 'admin' AND
  school_code = public.get_user_school_code(auth.uid())
);

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (
  public.get_user_app_role(auth.uid()) = 'admin' AND
  user_id != auth.uid() AND
  school_code = public.get_user_school_code(auth.uid())
);

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (
  public.get_user_app_role(auth.uid()) = 'admin' AND
  user_id != auth.uid() AND
  school_code = public.get_user_school_code(auth.uid())
);

-- ============================================
-- FIX 4: Update has_role function to use security definer properly
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- FIX 5: Update is_school_admin to use security definer
-- ============================================

CREATE OR REPLACE FUNCTION public.is_school_admin(_user_id uuid, _school_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role = 'admin'
    AND school_code = _school_code
  )
  OR EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = _user_id
    AND is_active = true
    AND (admins.school_code = _school_code OR admins.school_code IS NULL)
  )
$$;