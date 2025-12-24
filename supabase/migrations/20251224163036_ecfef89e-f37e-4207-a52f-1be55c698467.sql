-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('teacher', 'student');

-- Create schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  school_code TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table (for extended student info)
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  section TEXT,
  subjects TEXT[] DEFAULT '{}',
  school_code TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  date_of_birth DATE,
  admission_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES auth.users(id),
  class_name TEXT NOT NULL,
  school_code TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create exam results table
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  marks_obtained INTEGER NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 100,
  percentage DECIMAL(5,2) NOT NULL,
  grade TEXT,
  class_name TEXT NOT NULL,
  school_code TEXT NOT NULL,
  exam_date DATE NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homework table
CREATE TABLE public.homework (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  school_code TEXT NOT NULL,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homework submissions table
CREATE TABLE public.homework_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  homework_id UUID NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'late', 'graded')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  content TEXT,
  attachments TEXT[],
  grade INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(homework_id, student_id)
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('anonymous', 'teacher')),
  content TEXT NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES auth.users(id),
  class_name TEXT,
  school_code TEXT NOT NULL,
  category TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meet links table
CREATE TABLE public.meet_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name TEXT NOT NULL,
  subject TEXT,
  meet_link TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  school_code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_links ENABLE ROW LEVEL SECURITY;

-- Schools policies (public read for validation)
CREATE POLICY "Schools are publicly readable" ON public.schools FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view profiles in their school" ON public.profiles 
  FOR SELECT USING (school_code IN (SELECT school_code FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = user_id);

-- Students policies
CREATE POLICY "Teachers can view all students in their school" ON public.students 
  FOR SELECT USING (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can view their own record" ON public.students 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can insert students" ON public.students 
  FOR INSERT WITH CHECK (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update students in their school" ON public.students 
  FOR UPDATE USING (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

-- Attendance policies
CREATE POLICY "Teachers can view attendance in their school" ON public.attendance_records 
  FOR SELECT USING (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can view their own attendance" ON public.attendance_records 
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can insert attendance" ON public.attendance_records 
  FOR INSERT WITH CHECK (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update attendance" ON public.attendance_records 
  FOR UPDATE USING (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

-- Exam results policies
CREATE POLICY "Teachers can view exam results in their school" ON public.exam_results 
  FOR SELECT USING (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can view their own results" ON public.exam_results 
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can insert exam results" ON public.exam_results 
  FOR INSERT WITH CHECK (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

-- Homework policies
CREATE POLICY "Users can view homework in their school" ON public.homework 
  FOR SELECT USING (
    school_code IN (SELECT school_code FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can insert homework" ON public.homework 
  FOR INSERT WITH CHECK (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update homework" ON public.homework 
  FOR UPDATE USING (assigned_by = auth.uid());

CREATE POLICY "Teachers can delete homework" ON public.homework 
  FOR DELETE USING (assigned_by = auth.uid());

-- Homework submissions policies
CREATE POLICY "Teachers can view all submissions in their school" ON public.homework_submissions 
  FOR SELECT USING (
    homework_id IN (
      SELECT id FROM public.homework WHERE school_code IN (
        SELECT school_code FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'teacher'
      )
    )
  );

CREATE POLICY "Students can view their own submissions" ON public.homework_submissions 
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can insert their submissions" ON public.homework_submissions 
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can update their submissions" ON public.homework_submissions 
  FOR UPDATE USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can update submissions (for grading)" ON public.homework_submissions 
  FOR UPDATE USING (
    homework_id IN (
      SELECT id FROM public.homework WHERE assigned_by = auth.uid()
    )
  );

-- Feedback policies
CREATE POLICY "Teachers can view all feedback in their school" ON public.feedback 
  FOR SELECT USING (
    school_code IN (
      SELECT school_code FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can view their received feedback" ON public.feedback 
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) 
    AND type = 'teacher'
  );

CREATE POLICY "Authenticated users can insert feedback" ON public.feedback 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update feedback" ON public.feedback 
  FOR UPDATE USING (teacher_id = auth.uid());

-- Meet links policies
CREATE POLICY "Users can view active meet links in their school" ON public.meet_links 
  FOR SELECT USING (
    school_code IN (SELECT school_code FROM public.profiles WHERE user_id = auth.uid())
    AND is_active = true
  );

CREATE POLICY "Teachers can view their meet links" ON public.meet_links 
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert meet links" ON public.meet_links 
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their meet links" ON public.meet_links 
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their meet links" ON public.meet_links 
  FOR DELETE USING (teacher_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role, school_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student'),
    COALESCE(NEW.raw_user_meta_data ->> 'school_code', 'DEMO2024')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert demo school
INSERT INTO public.schools (code, name, address, email) VALUES 
  ('DEMO2024', 'Demo School', '123 Education Lane', 'admin@demo-school.edu'),
  ('SCHOOL001', 'Springfield High', '456 School Street', 'info@springfield.edu'),
  ('TEST123', 'Test Academy', '789 Test Avenue', 'test@academy.edu');
