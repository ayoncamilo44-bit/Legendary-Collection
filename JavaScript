import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
import { supabase } from './supabase.js';

// Bind auth actions to global window scope for inline HTML onclick handlers
window.loginWithGoogle = async function() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard.html` }
    });
    if (error) console.error('Error logging in:', error.message);
};

window.logout = async function() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
};

// Update UI navigation elements based on active session status
window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const authBtn = document.getElementById('auth-nav-btn');

    if (session) {
        if (authBtn) {
            authBtn.innerHTML = `
                <a href="dashboard.html" class="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors">
                    My Vault Dashboard
                </a>
                <button onclick="logout()" class="px-2 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                    Logout
                </button>
            `;
        }
    } else {
        if (authBtn) {
            authBtn.innerHTML = `
                <button onclick="loginWithGoogle()" class="px-3.5 py-1.5 rounded-lg bg-darkBorder text-white text-xs font-semibold hover:bg-gray-800 transition-colors">
                    Sign In with Google
                </button>
            `;
        }
    }
});
