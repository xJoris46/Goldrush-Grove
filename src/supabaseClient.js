import { createClient } from "@supabase/supabase-js";

// These two values are safe to be public — Supabase's "anon" key is
// designed to be used in client-side code. Access control happens
// through the Row Level Security policies in setup-database.sql, not
// by keeping this key secret.
const SUPABASE_URL = "https://dcijlnpygkodsqatllho.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjaWpsbnB5Z2tvZHNxYXRsbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTIyMjEsImV4cCI6MjEwMzkyODIyMX0.ScqG2WyIjLX-qkYUlZ-B165ksUnq-AohjwxJvXsrU8E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
