import { createClient } from '@supabase/supabase-js';

// Credentials provided
const supabaseUrl = 'https://cxbbvsfgbquffszzmkgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4YmJ2c2ZnYnF1ZmZzenpta2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTIwNzgsImV4cCI6MjA3OTQ4ODA3OH0.7R3mPpMr16pgithAkXyXhiiBrKwEWiB4s2Cl-rDbPMg';

export const supabase = createClient(supabaseUrl, supabaseKey);