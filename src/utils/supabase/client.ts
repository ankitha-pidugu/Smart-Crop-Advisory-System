import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export type Database = {
  public: {
    Tables: {
      farmer_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location: string;
          preferred_language: string;
          latitude?: number;
          longitude?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          location: string;
          preferred_language?: string;
          latitude?: number;
          longitude?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          location?: string;
          preferred_language?: string;
          latitude?: number;
          longitude?: number;
          updated_at?: string;
        };
      };
      crop_submissions: {
        Row: {
          id: string;
          user_id: string;
          soil_type: string;
          ph_level: number;
          location: string;
          existing_crop: string;
          preferred_crop: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          soil_type: string;
          ph_level: number;
          location: string;
          existing_crop: string;
          preferred_crop: string;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          soil_type?: string;
          ph_level?: number;
          location?: string;
          existing_crop?: string;
          preferred_crop?: string;
        };
      };
      market_prices: {
        Row: {
          id: string;
          crop_name: string;
          price_per_kg: number;
          currency: string;
          market_location: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          crop_name: string;
          price_per_kg: number;
          currency?: string;
          market_location: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          crop_name?: string;
          price_per_kg?: number;
          currency?: string;
          market_location?: string;
          updated_at?: string;
        };
      };
      weather_data: {
        Row: {
          id: string;
          location: string;
          temperature: number;
          humidity: number;
          rainfall: number;
          forecast_date: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location: string;
          temperature: number;
          humidity: number;
          rainfall: number;
          forecast_date: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location?: string;
          temperature?: number;
          humidity?: number;
          rainfall?: number;
          forecast_date?: string;
          updated_at?: string;
        };
      };
    };
  };
};