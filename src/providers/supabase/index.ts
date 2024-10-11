import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SECRET_SUPABASE_URL;
const suapbaseKey = import.meta.env.SECRET_SUPABASE_SECRET;
export const supabase = createClient(supabaseUrl, suapbaseKey);
