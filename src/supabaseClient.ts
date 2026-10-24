import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { clinicConfig } from './clinicConfig';

const STORAGE_SUPABASE_URL_KEY = 'custom_supabase_url';
const STORAGE_SUPABASE_KEY_KEY = 'custom_supabase_anon_key';

/**
 * SQL Schema for Supabase:
 * Run this inside your Supabase Project -> SQL Editor to create the appointments table:
 *
 * ```sql
 * CREATE TABLE IF NOT EXISTS appointments (
 *   id TEXT PRIMARY KEY,
 *   patient_name TEXT NOT NULL,
 *   mobile_number TEXT NOT NULL,
 *   age INTEGER NOT NULL,
 *   gender TEXT,
 *   doctor_id TEXT NOT NULL,
 *   doctor_name TEXT NOT NULL,
 *   doctor_specialty TEXT NOT NULL,
 *   appointment_date TEXT NOT NULL,
 *   appointment_time TEXT NOT NULL,
 *   reason_for_visit TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
 *   status TEXT DEFAULT 'confirmed' NOT NULL
 * );
 *
 * -- Enable Row Level Security (RLS)
 * ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
 *
 * -- Allow public inserts for booking requests
 * CREATE POLICY "Allow public booking insert" ON appointments
 *   FOR INSERT WITH CHECK (true);
 *
 * -- Allow public read of appointments to check slot availability
 * CREATE POLICY "Allow public availability check" ON appointments
 *   FOR SELECT USING (true);
 * ```
 */

export function normalizeSupabaseUrl(rawUrl: string): string {
  let trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    if (!trimmed.includes('.')) {
      // It's a plain project id like "eunpxzethgdjvmujdsvo"
      return `https://${trimmed}.supabase.co`;
    }
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem(STORAGE_SUPABASE_URL_KEY);
  const localKey = localStorage.getItem(STORAGE_SUPABASE_KEY_KEY);
  const config = clinicConfig.supabase;

  const rawUrl = (localUrl || envUrl || config?.url || '').trim();
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = (localKey || envKey || config?.anonKey || '').trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project') &&
    !anonKey.includes('your-anon')
  );

  return { url, anonKey, isConfigured };
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveCustomSupabaseCredentials(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_SUPABASE_URL_KEY, url.trim());
  else localStorage.removeItem(STORAGE_SUPABASE_URL_KEY);

  if (anonKey) localStorage.setItem(STORAGE_SUPABASE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_SUPABASE_KEY_KEY);

  cachedClient = null; // Reset cached client
}

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are not configured yet.'
    };
  }

  try {
    const { error } = await client
      .from('appointments')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "appointments" does not exist')) {
        return {
          success: false,
          message: 'Connected to Supabase, but table "appointments" does not exist yet. Please run the SQL snippet in Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        message: `Supabase error: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase database!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Could not connect to Supabase.'
    };
  }
}
