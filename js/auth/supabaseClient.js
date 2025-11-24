// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pjqdjngolegmujhaezvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcWRqbmdvbGVnbXVqaGFlenZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDMxMzIsImV4cCI6MjA3OTUxOTEzMn0.4EZiqcyulDpk5DpXQ1rCJHHdL0t2toWbqV7F_TXzM4A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
