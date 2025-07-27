export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          donation_id: string | null
          id: string
          participants: string[]
          subject: string | null
          task_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donation_id?: string | null
          id?: string
          participants: string[]
          subject?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donation_id?: string | null
          id?: string
          participants?: string[]
          subject?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "volunteer_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          allergen_info: Json | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string | null
          description: string | null
          dietary_info: Json | null
          donor_id: string
          estimated_meals: number | null
          expiry_date: string | null
          food_category: Database["public"]["Enums"]["food_category"]
          id: string
          images: Json | null
          latitude: number
          longitude: number
          pickup_address: string
          pickup_time_end: string
          pickup_time_start: string
          quantity: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["donation_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allergen_info?: Json | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          description?: string | null
          dietary_info?: Json | null
          donor_id: string
          estimated_meals?: number | null
          expiry_date?: string | null
          food_category: Database["public"]["Enums"]["food_category"]
          id?: string
          images?: Json | null
          latitude: number
          longitude: number
          pickup_address: string
          pickup_time_end: string
          pickup_time_start: string
          quantity: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["donation_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allergen_info?: Json | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          description?: string | null
          dietary_info?: Json | null
          donor_id?: string
          estimated_meals?: number | null
          expiry_date?: string | null
          food_category?: Database["public"]["Enums"]["food_category"]
          id?: string
          images?: Json | null
          latitude?: number
          longitude?: number
          pickup_address?: string
          pickup_time_end?: string
          pickup_time_start?: string
          quantity?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["donation_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_hubs: {
        Row: {
          address: string
          capacity_kg: number | null
          contact_person: string | null
          created_at: string | null
          current_inventory_kg: number | null
          description: string | null
          email: string | null
          id: string
          latitude: number
          longitude: number
          managed_by: string | null
          name: string
          operating_hours: Json
          phone: string | null
          updated_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          address: string
          capacity_kg?: number | null
          contact_person?: string | null
          created_at?: string | null
          current_inventory_kg?: number | null
          description?: string | null
          email?: string | null
          id?: string
          latitude: number
          longitude: number
          managed_by?: string | null
          name: string
          operating_hours: Json
          phone?: string | null
          updated_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          address?: string
          capacity_kg?: number | null
          contact_person?: string | null
          created_at?: string | null
          current_inventory_kg?: number | null
          description?: string | null
          email?: string | null
          id?: string
          latitude?: number
          longitude?: number
          managed_by?: string | null
          name?: string
          operating_hours?: Json
          phone?: string | null
          updated_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "food_hubs_managed_by_fkey"
            columns: ["managed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_items: {
        Row: {
          barcode: string | null
          brand: string | null
          calories_per_100g: number | null
          carbs_per_100g: number | null
          category: string | null
          created_at: string
          created_by: string | null
          fat_per_100g: number | null
          fiber_per_100g: number | null
          id: string
          image_url: string | null
          is_verified: boolean | null
          minerals: Json | null
          name: string
          protein_per_100g: number | null
          serving_size: string | null
          sodium_per_100mg: number | null
          sugar_per_100g: number | null
          updated_at: string
          vitamins: Json | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          minerals?: Json | null
          name: string
          protein_per_100g?: number | null
          serving_size?: string | null
          sodium_per_100mg?: number | null
          sugar_per_100g?: number | null
          updated_at?: string
          vitamins?: Json | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          minerals?: Json | null
          name?: string
          protein_per_100g?: number | null
          serving_size?: string | null
          sodium_per_100mg?: number | null
          sugar_per_100g?: number | null
          updated_at?: string
          vitamins?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_food_items: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          fiber: number | null
          food_item_id: string
          id: string
          meal_id: string
          protein: number | null
          quantity: number
          unit: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          fiber?: number | null
          food_item_id: string
          id?: string
          meal_id: string
          protein?: number | null
          quantity: number
          unit?: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          fiber?: number | null
          food_item_id?: string
          id?: string
          meal_id?: string
          protein?: number | null
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_food_items_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_food_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string
          id: string
          meal_date: string
          meal_name: string | null
          meal_type: string
          notes: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_fiber: number | null
          total_protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_date: string
          meal_name?: string | null
          meal_type: string
          notes?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_date?: string
          meal_name?: string | null
          meal_type?: string
          notes?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          metadata: Json | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          scheduled_for: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_goals: {
        Row: {
          created_at: string
          daily_calories: number | null
          daily_carbs: number | null
          daily_fat: number | null
          daily_fiber: number | null
          daily_protein: number | null
          daily_water_ml: number | null
          goal_type: string | null
          id: string
          is_active: boolean | null
          target_weight_kg: number | null
          updated_at: string
          user_id: string
          weekly_weight_change_kg: number | null
        }
        Insert: {
          created_at?: string
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_fiber?: number | null
          daily_protein?: number | null
          daily_water_ml?: number | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id: string
          weekly_weight_change_kg?: number | null
        }
        Update: {
          created_at?: string
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_fiber?: number | null
          daily_protein?: number | null
          daily_water_ml?: number | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id?: string
          weekly_weight_change_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_tracking: {
        Row: {
          arm_cm: number | null
          body_fat_percentage: number | null
          chest_cm: number | null
          created_at: string
          date: string
          energy_level: number | null
          id: string
          mood_rating: number | null
          muscle_mass_kg: number | null
          notes: string | null
          progress_photos: string[] | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_percentage?: number | null
          chest_cm?: number | null
          created_at?: string
          date: string
          energy_level?: number | null
          id?: string
          mood_rating?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          progress_photos?: string[] | null
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_percentage?: number | null
          chest_cm?: number | null
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          mood_rating?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          progress_photos?: string[] | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          address: string | null
          allergies: string[] | null
          availability_schedule: Json | null
          created_at: string
          date_of_birth: string | null
          dietary_preferences: string[] | null
          email: string
          full_name: string
          gender: string | null
          gps_coords: string | null
          health_conditions: string[] | null
          height_cm: number | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          profile_picture_url: string | null
          role: string
          total_donations: number | null
          total_meals_provided: number | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified: boolean | null
          volunteer_rating: number | null
          weight_kg: number | null
          whatsapp_number: string | null
        }
        Insert: {
          activity_level?: string | null
          address?: string | null
          allergies?: string[] | null
          availability_schedule?: Json | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          email: string
          full_name: string
          gender?: string | null
          gps_coords?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          profile_picture_url?: string | null
          role?: string
          total_donations?: number | null
          total_meals_provided?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified?: boolean | null
          volunteer_rating?: number | null
          weight_kg?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          activity_level?: string | null
          address?: string | null
          allergies?: string[] | null
          availability_schedule?: Json | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          email?: string
          full_name?: string
          gender?: string | null
          gps_coords?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          profile_picture_url?: string | null
          role?: string
          total_donations?: number | null
          total_meals_provided?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified?: boolean | null
          volunteer_rating?: number | null
          weight_kg?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      volunteer_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points_earned: number
          reward_type: string
          task_id: string | null
          volunteer_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_earned: number
          reward_type: string
          task_id?: string | null
          volunteer_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_earned?: number
          reward_type?: string
          task_id?: string | null
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_rewards_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "volunteer_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_rewards_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_tasks: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          completion_notes: string | null
          created_at: string | null
          delivery_latitude: number | null
          delivery_location: string | null
          delivery_longitude: number | null
          donation_id: string
          estimated_duration: number | null
          id: string
          instructions: string | null
          pickup_latitude: number
          pickup_location: string
          pickup_longitude: number
          points_awarded: number | null
          scheduled_time: string
          status: Database["public"]["Enums"]["task_status"] | null
          task_type: string
          updated_at: string | null
          volunteer_id: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          completion_notes?: string | null
          created_at?: string | null
          delivery_latitude?: number | null
          delivery_location?: string | null
          delivery_longitude?: number | null
          donation_id: string
          estimated_duration?: number | null
          id?: string
          instructions?: string | null
          pickup_latitude: number
          pickup_location: string
          pickup_longitude: number
          points_awarded?: number | null
          scheduled_time: string
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type: string
          updated_at?: string | null
          volunteer_id?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          completion_notes?: string | null
          created_at?: string | null
          delivery_latitude?: number | null
          delivery_location?: string | null
          delivery_longitude?: number | null
          donation_id?: string
          estimated_duration?: number | null
          id?: string
          instructions?: string | null
          pickup_latitude?: number
          pickup_location?: string
          pickup_longitude?: number
          points_awarded?: number | null
          scheduled_time?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: string
          updated_at?: string | null
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_tasks_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_tasks_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
      find_nearby_donations: {
        Args: {
          user_latitude: number
          user_longitude: number
          radius_km?: number
        }
        Returns: {
          id: string
          title: string
          food_category: Database["public"]["Enums"]["food_category"]
          distance_km: number
        }[]
      }
      match_volunteer_with_tasks: {
        Args: {
          volunteer_lat: number
          volunteer_lon: number
          max_distance_km?: number
        }
        Returns: {
          task_id: string
          donation_title: string
          distance_km: number
          points_potential: number
        }[]
      }
    }
    Enums: {
      donation_status:
        | "available"
        | "claimed"
        | "picked_up"
        | "delivered"
        | "expired"
        | "cancelled"
      food_category:
        | "fresh_produce"
        | "dairy"
        | "bakery"
        | "cooked_meals"
        | "canned_goods"
        | "grains"
        | "beverages"
        | "frozen"
        | "other"
      priority_level: "low" | "normal" | "high" | "urgent"
      task_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_type: "donor" | "recipient" | "volunteer" | "admin"
      verification_status: "pending" | "verified" | "rejected"
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
      donation_status: [
        "available",
        "claimed",
        "picked_up",
        "delivered",
        "expired",
        "cancelled",
      ],
      food_category: [
        "fresh_produce",
        "dairy",
        "bakery",
        "cooked_meals",
        "canned_goods",
        "grains",
        "beverages",
        "frozen",
        "other",
      ],
      priority_level: ["low", "normal", "high", "urgent"],
      task_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_type: ["donor", "recipient", "volunteer", "admin"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
