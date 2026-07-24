export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      faculties: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          faculty_id: string;
          name: string;
          code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          faculty_id: string;
          name: string;
          code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          faculty_id?: string;
          name?: string;
          code?: string | null;
          created_at?: string;
        };
      };
      pending_registrations: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          faculty_id: string;
          department_id: string;
          level: number;
          password_hash: string;
          status: "pending" | "approved" | "rejected";
          rejection_reason: string | null;
          assigned_matric: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          faculty_id: string;
          department_id: string;
          level: number;
          password_hash: string;
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string | null;
          assigned_matric?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          faculty_id?: string;
          department_id?: string;
          level?: number;
          password_hash?: string;
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string | null;
          assigned_matric?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
      };
      students: {
        Row: {
          id: string;
          matric_number: string;
          full_name: string;
          email: string;
          phone: string;
          faculty_id: string;
          department_id: string;
          level: number;
          status: "active" | "suspended";
          created_at: string;
        };
        Insert: {
          id: string;
          matric_number: string;
          full_name: string;
          email: string;
          phone: string;
          faculty_id: string;
          department_id: string;
          level: number;
          status?: "active" | "suspended";
          created_at?: string;
        };
        Update: {
          id?: string;
          matric_number?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          faculty_id?: string;
          department_id?: string;
          level?: number;
          status?: "active" | "suspended";
          created_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          role:
            | "super_admin"
            | "admissions_officer"
            | "academic_officer"
            | "communications_officer";
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          role:
            | "super_admin"
            | "admissions_officer"
            | "academic_officer"
            | "communications_officer";
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          role?:
            | "super_admin"
            | "admissions_officer"
            | "academic_officer"
            | "communications_officer";
          created_at?: string;
        };
      };
      login_attempts: {
        Row: {
          identifier: string;
          fail_count: number;
          locked_until: string | null;
          updated_at: string;
        };
        Insert: {
          identifier: string;
          fail_count?: number;
          locked_until?: string | null;
          updated_at?: string;
        };
        Update: {
          identifier?: string;
          fail_count?: number;
          locked_until?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          target: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          target?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          action?: string;
          target?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          department_id: string;
          code: string;
          title: string;
          unit: number;
          level: number;
          semester: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          department_id: string;
          code: string;
          title: string;
          unit: number;
          level: number;
          semester: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          department_id?: string;
          code?: string;
          title?: string;
          unit?: number;
          level?: number;
          semester?: number;
          created_at?: string;
        };
      };
      course_registrations: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          session_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          session_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          session_id?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      results: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          grade: string;
          score: number;
          gpa: number | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          grade: string;
          score: number;
          gpa?: number | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          grade?: string;
          score?: number;
          gpa?: number | null;
          status?: string;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          target_role: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          target_role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          target_role?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      academic_sessions: {
        Row: {
          id: string;
          name: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_current?: boolean;
          created_at?: string;
        };
      };
      semesters: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          is_current?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_matric_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_role: {
        Args: {
          _user_id: string;
          _role: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role:
        | "super_admin"
        | "admissions_officer"
        | "academic_officer"
        | "communications_officer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admissions_officer", "academic_officer", "communications_officer"],
    },
  },
} as const;
