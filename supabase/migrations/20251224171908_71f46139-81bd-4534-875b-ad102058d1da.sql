-- Student goals table
CREATE TABLE public.student_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL DEFAULT 100,
  current_value INTEGER NOT NULL DEFAULT 0,
  goal_type TEXT NOT NULL DEFAULT 'attendance', -- attendance, exam, homework
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, expired
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student badges table
CREATE TABLE public.student_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_code TEXT NOT NULL,
  badge_type TEXT NOT NULL, -- attendance_streak, homework_star, exam_topper, perfect_week
  badge_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_code TEXT NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- attendance_marked, marks_updated, homework_assigned, etc
  entity_type TEXT NOT NULL, -- attendance, exam, homework, student
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school_code TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, alert
  category TEXT, -- homework_due, exam_reminder, low_attendance, risk_alert
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student risk scores table (AI-generated)
CREATE TABLE public.student_risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_code TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'low', -- low, medium, high
  risk_score INTEGER NOT NULL DEFAULT 0, -- 0-100
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  last_analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Question papers table
CREATE TABLE public.question_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_code TEXT NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium', -- easy, medium, hard
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_marks INTEGER NOT NULL DEFAULT 100,
  duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Parent summaries table
CREATE TABLE public.parent_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_code TEXT NOT NULL,
  generated_by UUID NOT NULL,
  summary_content JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_summaries ENABLE ROW LEVEL SECURITY;

-- Student goals policies
CREATE POLICY "Teachers can manage goals" ON public.student_goals
FOR ALL USING (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'));

CREATE POLICY "Students can view their goals" ON public.student_goals
FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Student badges policies
CREATE POLICY "Teachers can manage badges" ON public.student_badges
FOR ALL USING (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'));

CREATE POLICY "Students can view their badges" ON public.student_badges
FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Activity logs policies
CREATE POLICY "Teachers can view activity logs" ON public.activity_logs
FOR SELECT USING (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'));

CREATE POLICY "Users can insert activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Teachers can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'));

-- Student risk scores policies
CREATE POLICY "Teachers can manage risk scores" ON public.student_risk_scores
FOR ALL USING (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'));

-- Question papers policies
CREATE POLICY "Teachers can manage their papers" ON public.question_papers
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Teachers can view school papers" ON public.question_papers
FOR SELECT USING (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'));

-- Parent summaries policies
CREATE POLICY "Teachers can manage summaries" ON public.parent_summaries
FOR ALL USING (school_code IN (SELECT school_code FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'));

CREATE POLICY "Students can view their summaries" ON public.parent_summaries
FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Public access for shared summaries via token
CREATE POLICY "Anyone can view shared summaries" ON public.parent_summaries
FOR SELECT USING (share_token IS NOT NULL);

-- Indexes for performance
CREATE INDEX idx_student_goals_student ON public.student_goals(student_id);
CREATE INDEX idx_student_badges_student ON public.student_badges(student_id);
CREATE INDEX idx_activity_logs_school ON public.activity_logs(school_code, created_at DESC);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_risk_scores_student ON public.student_risk_scores(student_id);
CREATE INDEX idx_risk_scores_level ON public.student_risk_scores(school_code, risk_level);