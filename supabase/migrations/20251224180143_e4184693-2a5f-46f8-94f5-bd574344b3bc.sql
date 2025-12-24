-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    school_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles table
-- Users can view their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles in their school
CREATE POLICY "Admins can view all roles in their school"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') 
  AND school_code IN (
    SELECT ur.school_code 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid()
  )
);

-- Admins can insert roles for their school
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND school_code IN (
    SELECT ur.school_code 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid()
  )
);

-- Admins can update roles in their school (except their own)
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin')
  AND user_id != auth.uid()
  AND school_code IN (
    SELECT ur.school_code 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid()
  )
);

-- Admins can delete roles in their school (except their own)
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin')
  AND user_id != auth.uid()
  AND school_code IN (
    SELECT ur.school_code 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid()
  )
);

-- Update trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup and assign role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, school_code)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'student'),
    COALESCE(NEW.raw_user_meta_data ->> 'school_code', 'DEMO2024')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create role on user signup
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();