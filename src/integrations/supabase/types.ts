export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          school_code: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          school_code: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          school_code?: string
          user_id?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_super_admin: boolean | null
          name: string
          school_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          name: string
          school_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          name?: string
          school_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_school_code_fkey"
            columns: ["school_code"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["code"]
          },
        ]
      }
      announcements: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_published: boolean | null
          priority: string | null
          published_at: string | null
          school_code: string
          target_classes: string[] | null
          target_type: string | null
          title: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          published_at?: string | null
          school_code: string
          target_classes?: string[] | null
          target_type?: string | null
          title: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          published_at?: string | null
          school_code?: string
          target_classes?: string[] | null
          target_type?: string | null
          title?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          class_name: string
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notes: string | null
          school_code: string
          status: string
          student_id: string
        }
        Insert: {
          class_name: string
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          school_code: string
          status: string
          student_id: string
        }
        Update: {
          class_name?: string
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          school_code?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number | null
          class_teacher_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          room_number: string | null
          school_code: string
          section: string | null
          subjects: string[] | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          room_number?: string | null
          school_code: string
          section?: string | null
          subjects?: string[] | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          room_number?: string | null
          school_code?: string
          section?: string | null
          subjects?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          class_name: string
          created_at: string
          exam_date: string
          exam_name: string
          grade: string | null
          id: string
          marks_obtained: number
          percentage: number
          remarks: string | null
          school_code: string
          student_id: string
          subject: string
          total_marks: number
        }
        Insert: {
          class_name: string
          created_at?: string
          exam_date: string
          exam_name: string
          grade?: string | null
          id?: string
          marks_obtained: number
          percentage: number
          remarks?: string | null
          school_code: string
          student_id: string
          subject: string
          total_marks?: number
        }
        Update: {
          class_name?: string
          created_at?: string
          exam_date?: string
          exam_name?: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          percentage?: number
          remarks?: string | null
          school_code?: string
          student_id?: string
          subject?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string | null
          class_name: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          response: string | null
          school_code: string
          student_id: string | null
          teacher_id: string | null
          type: string
        }
        Insert: {
          category?: string | null
          class_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          response?: string | null
          school_code: string
          student_id?: string | null
          teacher_id?: string | null
          type: string
        }
        Update: {
          category?: string | null
          class_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          response?: string | null
          school_code?: string
          student_id?: string | null
          teacher_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          assigned_by: string | null
          attachments: string[] | null
          class_name: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          school_code: string
          subject: string
          title: string
        }
        Insert: {
          assigned_by?: string | null
          attachments?: string[] | null
          class_name: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          school_code: string
          subject: string
          title: string
        }
        Update: {
          assigned_by?: string | null
          attachments?: string[] | null
          class_name?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          school_code?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      homework_submissions: {
        Row: {
          attachments: string[] | null
          content: string | null
          created_at: string
          feedback: string | null
          grade: number | null
          homework_id: string
          id: string
          status: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          grade?: number | null
          homework_id: string
          id?: string
          status?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          grade?: number | null
          homework_id?: string
          id?: string
          status?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      meet_links: {
        Row: {
          class_name: string
          created_at: string
          id: string
          is_active: boolean
          meet_link: string
          school_code: string
          subject: string | null
          teacher_id: string
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          meet_link: string
          school_code: string
          subject?: string | null
          teacher_id: string
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          meet_link?: string
          school_code?: string
          subject?: string | null
          teacher_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          school_code: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          school_code: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          school_code?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_summaries: {
        Row: {
          created_at: string
          generated_by: string
          id: string
          period_end: string
          period_start: string
          school_code: string
          share_token: string | null
          student_id: string
          summary_content: Json
        }
        Insert: {
          created_at?: string
          generated_by: string
          id?: string
          period_end: string
          period_start: string
          school_code: string
          share_token?: string | null
          student_id: string
          summary_content: Json
        }
        Update: {
          created_at?: string
          generated_by?: string
          id?: string
          period_end?: string
          period_start?: string
          school_code?: string
          share_token?: string | null
          student_id?: string
          summary_content?: Json
        }
        Relationships: [
          {
            foreignKeyName: "parent_summaries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          school_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          school_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_papers: {
        Row: {
          class_name: string
          created_at: string
          created_by: string
          difficulty: string
          duration_minutes: number | null
          id: string
          questions: Json
          school_code: string
          subject: string
          title: string
          topic: string | null
          total_marks: number
        }
        Insert: {
          class_name: string
          created_at?: string
          created_by: string
          difficulty?: string
          duration_minutes?: number | null
          id?: string
          questions?: Json
          school_code: string
          subject: string
          title: string
          topic?: string | null
          total_marks?: number
        }
        Update: {
          class_name?: string
          created_at?: string
          created_by?: string
          difficulty?: string
          duration_minutes?: number | null
          id?: string
          questions?: Json
          school_code?: string
          subject?: string
          title?: string
          topic?: string | null
          total_marks?: number
        }
        Relationships: []
      }
      school_health_reports: {
        Row: {
          created_at: string
          generated_by: string | null
          id: string
          insights: Json | null
          metrics: Json | null
          recommendations: Json | null
          report_content: Json
          report_month: string
          school_code: string
        }
        Insert: {
          created_at?: string
          generated_by?: string | null
          id?: string
          insights?: Json | null
          metrics?: Json | null
          recommendations?: Json | null
          report_content: Json
          report_month: string
          school_code: string
        }
        Update: {
          created_at?: string
          generated_by?: string | null
          id?: string
          insights?: Json | null
          metrics?: Json | null
          recommendations?: Json | null
          report_content?: Json
          report_month?: string
          school_code?: string
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          academic_year_end: string | null
          academic_year_start: string | null
          attendance_threshold: number | null
          created_at: string
          features_enabled: Json | null
          grading_system: Json | null
          holidays: Json | null
          id: string
          logo_url: string | null
          primary_color: string | null
          school_code: string
          secondary_color: string | null
          timezone: string | null
          updated_at: string
          working_days: string[] | null
        }
        Insert: {
          academic_year_end?: string | null
          academic_year_start?: string | null
          attendance_threshold?: number | null
          created_at?: string
          features_enabled?: Json | null
          grading_system?: Json | null
          holidays?: Json | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          school_code: string
          secondary_color?: string | null
          timezone?: string | null
          updated_at?: string
          working_days?: string[] | null
        }
        Update: {
          academic_year_end?: string | null
          academic_year_start?: string | null
          attendance_threshold?: number | null
          created_at?: string
          features_enabled?: Json | null
          grading_system?: Json | null
          holidays?: Json | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          school_code?: string
          secondary_color?: string | null
          timezone?: string | null
          updated_at?: string
          working_days?: string[] | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      student_badges: {
        Row: {
          badge_name: string
          badge_type: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          metadata: Json | null
          school_code: string
          student_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          school_code: string
          student_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          school_code?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_badges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_goals: {
        Row: {
          created_at: string
          created_by: string | null
          current_value: number
          deadline: string | null
          description: string | null
          goal_type: string
          id: string
          school_code: string
          status: string
          student_id: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_value?: number
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          school_code: string
          status?: string
          student_id: string
          target_value?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_value?: number
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          school_code?: string
          status?: string
          student_id?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_risk_scores: {
        Row: {
          created_at: string
          factors: Json
          id: string
          last_analyzed_at: string
          recommendations: Json | null
          risk_level: string
          risk_score: number
          school_code: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          factors?: Json
          id?: string
          last_analyzed_at?: string
          recommendations?: Json | null
          risk_level?: string
          risk_score?: number
          school_code: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          factors?: Json
          id?: string
          last_analyzed_at?: string
          recommendations?: Json | null
          risk_level?: string
          risk_score?: number
          school_code?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_risk_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_date: string | null
          class_name: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          id: string
          name: string
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          profile_id: string | null
          roll_number: string
          school_code: string
          section: string | null
          subjects: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          class_name: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          name: string
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          profile_id?: string | null
          roll_number: string
          school_code: string
          section?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          class_name?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          name?: string
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          profile_id?: string | null
          roll_number?: string
          school_code?: string
          section?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          admin_role: Database["public"]["Enums"]["admin_role"]
          assigned_classes: string[] | null
          assigned_subjects: string[] | null
          created_at: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          school_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_role?: Database["public"]["Enums"]["admin_role"]
          assigned_classes?: string[] | null
          assigned_subjects?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          school_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_role?: Database["public"]["Enums"]["admin_role"]
          assigned_classes?: string[] | null
          assigned_subjects?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          school_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          school_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          school_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          school_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_profile: {
        Args: never
        Returns: {
          email: string
          id: string
          is_active: boolean
          is_super_admin: boolean
          name: string
          school_code: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_school_admin: {
        Args: { _school_code: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_role: "super_admin" | "school_admin" | "teacher" | "student"
      app_role: "admin" | "teacher" | "student"
      user_role: "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "school_admin", "teacher", "student"],
      app_role: ["admin", "teacher", "student"],
      user_role: ["teacher", "student"],
    },
  },
} as const
