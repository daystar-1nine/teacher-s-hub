-- School settings/profile table (extends existing schools table)
CREATE TABLE public.school_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#F97316',
  academic_year_start DATE,
  academic_year_end DATE,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  working_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  holidays JSONB DEFAULT '[]'::jsonb,
  grading_system JSONB DEFAULT '{"A": 90, "B": 75, "C": 60, "D": 40, "F": 0}'::jsonb,
  attendance_threshold INTEGER DEFAULT 75,
  features_enabled JSONB DEFAULT '{"ai_features": true, "feedback_system": true, "homework_submissions": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_code TEXT NOT NULL,
  name TEXT NOT NULL,
  section TEXT,
  class_teacher_id UUID,
  subjects TEXT[] DEFAULT '{}'::text[],
  room_number TEXT,
  capacity INTEGER DEFAULT 40,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_code, name, section)
);

-- User roles table (for RBAC)
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student');

CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school_code TEXT NOT NULL,
  admin_role admin_role NOT NULL DEFAULT 'teacher',
  permissions JSONB DEFAULT '{
    "view_attendance": true,
    "edit_attendance": false,
    "view_exams": true,
    "edit_exams": false,
    "view_students": true,
    "edit_students": false,
    "assign_homework": false,
    "manage_classes": false,
    "manage_teachers": false,
    "manage_settings": false,
    "view_analytics": false,
    "send_announcements": false
  }'::jsonb,
  assigned_classes TEXT[] DEFAULT '{}'::text[],
  assigned_subjects TEXT[] DEFAULT '{}'::text[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, school_code)
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_code TEXT NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  target_type TEXT DEFAULT 'all', -- all, class, teacher
  target_classes TEXT[] DEFAULT '{}'::text[],
  attachments TEXT[] DEFAULT '{}'::text[],
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- School health reports (AI-generated)
CREATE TABLE public.school_health_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_code TEXT NOT NULL,
  generated_by UUID,
  report_month DATE NOT NULL,
  report_content JSONB NOT NULL,
  insights JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_health_reports ENABLE ROW LEVEL SECURITY;

-- Security definer function for permission checks
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND is_active = true
      AND (
        admin_role IN ('super_admin', 'school_admin')
        OR (permissions->>_permission)::boolean = true
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin(_user_id uuid, _school_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND school_code = _school_code
      AND is_active = true
      AND admin_role IN ('super_admin', 'school_admin')
  )
$$;

-- School settings policies
CREATE POLICY "Users can view their school settings" ON public.school_settings
FOR SELECT USING (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage school settings" ON public.school_settings
FOR ALL USING (public.is_school_admin(auth.uid(), school_code));

-- Classes policies
CREATE POLICY "Users can view classes in their school" ON public.classes
FOR SELECT USING (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage classes" ON public.classes
FOR ALL USING (public.is_school_admin(auth.uid(), school_code));

-- User permissions policies (only admins can manage)
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permissions" ON public.user_permissions
FOR ALL USING (public.is_school_admin(auth.uid(), school_code));

-- Announcements policies
CREATE POLICY "Users can view announcements in their school" ON public.announcements
FOR SELECT USING (
  school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid())
  AND is_published = true
);

CREATE POLICY "Admins can manage announcements" ON public.announcements
FOR ALL USING (public.is_school_admin(auth.uid(), school_code));

CREATE POLICY "Teachers with permission can create announcements" ON public.announcements
FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'send_announcements'));

-- School health reports policies
CREATE POLICY "Admins can view health reports" ON public.school_health_reports
FOR SELECT USING (public.is_school_admin(auth.uid(), school_code));

CREATE POLICY "Admins can manage health reports" ON public.school_health_reports
FOR ALL USING (public.is_school_admin(auth.uid(), school_code));

-- Indexes
CREATE INDEX idx_school_settings_code ON public.school_settings(school_code);
CREATE INDEX idx_classes_school ON public.classes(school_code);
CREATE INDEX idx_user_permissions_user ON public.user_permissions(user_id);
CREATE INDEX idx_announcements_school ON public.announcements(school_code, is_published, published_at DESC);
CREATE INDEX idx_health_reports_school ON public.school_health_reports(school_code, report_month DESC);

-- Insert default settings for existing schools
INSERT INTO public.school_settings (school_code)
SELECT DISTINCT code FROM public.schools
ON CONFLICT (school_code) DO NOTHING;