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
        // Logged in state - show personalized options
        authBtnContainer.innerHTML = `
            <div class="flex items-center gap-3">
                <a href="dashboard.html" class="px-4 py-2 glass-card text-white rounded-lg text-sm font-semibold smooth-transition hover:bg-darkHover flex items-center gap-2">
                    <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                    My Dashboard
                </a>
                <button onclick="logout()" class="px-3 py-2 text-gray-400 hover:text-danger smooth-transition flex items-center gap-2">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                    Logout
                </button>
            </div>
        `;
    } else {
        // Not logged in - show optional sign in with benefit explanation
        authBtnContainer.innerHTML = `
            <button onclick="loginWithGoogle()" class="px-5 py-2.5 glass-card text-white rounded-lg text-sm font-semibold smooth-transition hover:bg-darkHover flex items-center gap-2 border border-darkBorder">
                <i data-lucide="user" class="w-4 h-4"></i>
                Sign In
            </button>
        `;
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
