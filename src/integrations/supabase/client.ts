
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uqtolyaliilluyxxooyy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdG9seWFsaWlsbHV5eHhvb3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjM1MzAsImV4cCI6MjA1OTY5OTUzMH0.Ya-BeKiEhh-TjKzPxsjS0h0EdW236hs_ozrjtmSE05Y";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
