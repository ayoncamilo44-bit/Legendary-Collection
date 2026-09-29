import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LeX35BABY67D8qcmHXdI2g_dV2w_Odp'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
