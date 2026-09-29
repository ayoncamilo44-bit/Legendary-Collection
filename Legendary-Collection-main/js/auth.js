import { supabase } from './supabase.js';

window.loginWithGoogle = async function() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard.html` }
    });
    if (error) console.error('Auth login error:', error.message);
};

window.logout = async function() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
};

window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const authBtnContainer = document.getElementById('auth-nav-btn');

    if (!authBtnContainer) return;

    if (session) {
        authBtnContainer.innerHTML = `
            <div class="flex items-center space-x-2">
                <a href="dashboard.html" class="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors shadow">
                    My Vault
                </a>
                <button onclick="logout()" class="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                    Logout
                </button>
            </div>
        `;
    } else {
        authBtnContainer.innerHTML = `
            <button onclick="loginWithGoogle()" class="px-3.5 py-1.5 rounded-lg bg-darkBorder text-white text-xs font-semibold hover:bg-gray-800 transition-colors border border-gray-700">
                Sign In with Google
            </button>
        `;
    }
});
