-- ============================================
-- PHASE 1: Create Isolated Admins Table
-- ============================================

-- Create the admins table (completely separate from user_roles)
CREATE TABLE public.admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  school_code text REFERENCES public.schools(code),
  is_super_admin boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PHASE 2: Security Definer Function for Admin Check
-- ============================================

-- Function to check if a user is an admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = _user_id AND is_active = true
  )
$$;

-- Function to check if a user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = _user_id AND is_super_admin = true AND is_active = true
  )
$$;

-- Function to get admin profile (for authenticated admins only)
CREATE OR REPLACE FUNCTION public.get_admin_profile()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  school_code text,
  is_super_admin boolean,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN;
  END IF;
  
  RETURN QUERY 
  SELECT a.id, a.email, a.name, a.school_code, a.is_super_admin, a.is_active
  FROM public.admins a 
  WHERE a.id = auth.uid();
END;
$$;

-- ============================================
-- PHASE 3: RLS Policies for Admins Table
-- ============================================

-- Admins can view their own profile
CREATE POLICY "Admins can view their own profile"
ON public.admins
FOR SELECT
USING (id = auth.uid());

-- Super admins can view all admins in their school
CREATE POLICY "Super admins can view admins in their school"
ON public.admins
FOR SELECT
USING (
  public.is_super_admin(auth.uid()) AND
  (school_code = (SELECT a.school_code FROM public.admins a WHERE a.id = auth.uid()) OR
   (SELECT a.school_code FROM public.admins a WHERE a.id = auth.uid()) IS NULL)
);

-- Only super admins can insert new admins
CREATE POLICY "Super admins can insert admins"
ON public.admins
FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid())
);

-- Only super admins can update admins (but not themselves for is_super_admin)
CREATE POLICY "Super admins can update admins"
ON public.admins
FOR UPDATE
USING (
  public.is_super_admin(auth.uid()) AND
  (id != auth.uid() OR NOT (is_super_admin IS DISTINCT FROM (SELECT a.is_super_admin FROM public.admins a WHERE a.id = id)))
);

-- Only super admins can delete admins (but not themselves)
CREATE POLICY "Super admins can delete admins"
ON public.admins
FOR DELETE
USING (
  public.is_super_admin(auth.uid()) AND id != auth.uid()
);

-- ============================================
-- PHASE 4: Update Trigger for updated_at
-- ============================================

CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();