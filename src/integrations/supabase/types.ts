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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      integration_jobs: {
        Row: {
          attempts: number
          created_at: string
          id: string
          kind: string
          last_error: string | null
          lead_id: string
          next_attempt_at: string
          processed_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          kind: string
          last_error?: string | null
          lead_id: string
          next_attempt_at?: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          kind?: string
          last_error?: string | null
          lead_id?: string
          next_attempt_at?: string
          processed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_jobs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          changed_fields: string[]
          created_at: string
          id: number
          lead_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: never
          lead_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: never
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_audit_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_submission_attempts: {
        Row: {
          client_hash: string
          created_at: string
          id: number
        }
        Insert: {
          client_hash: string
          created_at?: string
          id?: never
        }
        Update: {
          client_hash?: string
          created_at?: string
          id?: never
        }
        Relationships: []
      }
      leads: {
        Row: {
          commercial_opt_out_at: string | null
          commercial_opt_out_source: string | null
          consent_contact: boolean
          consent_processing: boolean
          consent_timestamp: string | null
          country: string | null
          created_at: string
          district: string | null
          duplicate_of: string | null
          email: string | null
          external_booking_id: string | null
          first_contact_at: string | null
          frequency: string | null
          id: string
          internal_notes: string
          last_contact_at: string | null
          message: string | null
          name: string
          next_follow_up_at: string | null
          notification_status: string
          phone: string
          preferred_contact: string
          privacy_version: string
          processing_timestamp: string
          service_interest: string
          source: string
          status: string
          submission_id: string | null
        }
        Insert: {
          commercial_opt_out_at?: string | null
          commercial_opt_out_source?: string | null
          consent_contact?: boolean
          consent_processing: boolean
          consent_timestamp?: string | null
          country?: string | null
          created_at?: string
          district?: string | null
          duplicate_of?: string | null
          email?: string | null
          external_booking_id?: string | null
          first_contact_at?: string | null
          frequency?: string | null
          id?: string
          internal_notes?: string
          last_contact_at?: string | null
          message?: string | null
          name: string
          next_follow_up_at?: string | null
          notification_status?: string
          phone: string
          preferred_contact?: string
          privacy_version: string
          processing_timestamp?: string
          service_interest: string
          source?: string
          status?: string
          submission_id?: string | null
        }
        Update: {
          commercial_opt_out_at?: string | null
          commercial_opt_out_source?: string | null
          consent_contact?: boolean
          consent_processing?: boolean
          consent_timestamp?: string | null
          country?: string | null
          created_at?: string
          district?: string | null
          duplicate_of?: string | null
          email?: string | null
          external_booking_id?: string | null
          first_contact_at?: string | null
          frequency?: string | null
          id?: string
          internal_notes?: string
          last_contact_at?: string | null
          message?: string | null
          name?: string
          next_follow_up_at?: string | null
          notification_status?: string
          phone?: string
          preferred_contact?: string
          privacy_version?: string
          processing_timestamp?: string
          service_interest?: string
          source?: string
          status?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_integration_jobs: {
        Args: { p_lead_id?: string; p_limit?: number }
        Returns: {
          attempts: number
          created_at: string
          id: string
          kind: string
          last_error: string | null
          lead_id: string
          next_attempt_at: string
          processed_at: string | null
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "integration_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_lead_admin: { Args: never; Returns: boolean }
      lead_metrics: { Args: never; Returns: Json }
      log_lead_list: { Args: never; Returns: undefined }
      record_commercial_opt_out: {
        Args: { p_lead_id: string; p_source: string }
        Returns: number
      }
      register_lead_attempt: {
        Args: { p_client_hash: string; p_max?: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
