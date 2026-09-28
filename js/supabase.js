import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://blpptyfncuxygmvumvok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscHB0eWZuY3V4eWdtdXZtdm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3Mjk3MTksImV4cCI6MjA0MjMwNTcxOX0.0P7l0lO9e8B-vG2K1-6L9B3H5N7X9Z'; // Paste your full anon key here

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
