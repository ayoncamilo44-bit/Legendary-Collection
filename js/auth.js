import { supabase } from './supabase.js';

function showAuthMessage(message) {
    const container = document.getElementById('auth-nav-btn');
    if (!container) return;

    let status = document.getElementById('auth-status');
    if (!status) {
        status = document.createElement('p');
        status.id = 'auth-status';
        status.setAttribute('role', 'alert');
        status.className = 'mt-2 max-w-xs text-xs text-red-300';
        container.append(status);
    }
    status.textContent = message;
}

window.loginWithGoogle = async function() {
    try {
        const redirectUrl = new URL(window.location.href);
        redirectUrl.search = '';
        redirectUrl.hash = '';

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectUrl.toString() }
        });
        if (error) throw error;
    } catch (error) {
        console.error('Google sign-in error:', error);
        showAuthMessage('Google sign-in could not start. Check the Supabase project settings and Google provider configuration.');
    }
};

window.logout = async function() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = new URL('./index.html', window.location.href).toString();
    } catch (error) {
        console.error('Sign-out error:', error);
        showAuthMessage('Sign-out failed. Please try again.');
    }
};

window.addEventListener('DOMContentLoaded', async () => {
    const authBtnContainer = document.getElementById('auth-nav-btn');
    if (!authBtnContainer) return;

    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        authBtnContainer.innerHTML = session
            ? `
                <div class="flex items-center gap-3">
                    <a href="dashboard.html" class="px-4 py-2 glass-card text-white rounded-lg text-sm font-semibold smooth-transition hover:bg-darkHover">
                        My Dashboard
                    </a>
                    <button onclick="logout()" class="px-3 py-2 text-gray-400 hover:text-white smooth-transition">
                        Sign Out
                    </button>
                </div>
            `
            : `
                <button onclick="loginWithGoogle()" class="px-4 py-2 glass-card text-white rounded-lg text-sm font-semibold smooth-transition hover:bg-darkHover border border-darkBorder">
                    Sign in with Google
                </button>
            `;
    } catch (error) {
        console.error('Unable to check sign-in status:', error);
        showAuthMessage('Sign-in status is unavailable. Check the Supabase project URL and publishable key.');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
});
