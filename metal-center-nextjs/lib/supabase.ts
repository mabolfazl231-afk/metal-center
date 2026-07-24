import { createClient } from "@supabase/supabase-js";

// این کلاینت با کلید anon (عمومی) کار می‌کند — امن است چون همراه با
// Row Level Security (RLS) که در migration تعریف شده، محدودیت دسترسی اعمال می‌شود.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
