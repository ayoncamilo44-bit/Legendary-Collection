import { supabase } from './supabase.js';

// UI checks improve the experience; Supabase RLS remains the authority.
export async function isSiteAdmin() {
    try {
        const { data, error } = await supabase.rpc('is_site_admin');
        return !error && data === true;
    } catch (error) {
        console.error('Could not check site administrator access:', error);
        return false;
    }
}
