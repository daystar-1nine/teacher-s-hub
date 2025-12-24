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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
      user_role: ["teacher", "student"],
    },
  },
} as const
