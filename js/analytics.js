import { GA_MEASUREMENT_ID } from './site-config.js';

const consentKey = 'lc-analytics-consent';
const measurementId = GA_MEASUREMENT_ID.trim();

if (/^G-[A-Z0-9]+$/i.test(measurementId)) {
    let analyticsEnabled = false;
    let searchTimer;

    function startAnalytics() {
        if (analyticsEnabled) return;
        analyticsEnabled = true;

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        script.onerror = () => {
            console.error('Google Analytics could not be loaded.');
            analyticsEnabled = false;
        };
        document.head.append(script);

        const pageLocation = new URL(window.location.href);
        pageLocation.search = '';
        pageLocation.hash = '';
        window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: pageLocation.toString()
        });
    }

    function sendEvent(name, parameters = {}) {
        if (analyticsEnabled && typeof window.gtag === 'function') {
            window.gtag('event', name, parameters);
        }
    }

    function showConsentPanel() {
        document.querySelector('.analytics-consent')?.remove();
        const panel = document.createElement('aside');
        panel.className = 'analytics-consent';
        panel.setAttribute('aria-label', 'Optional analytics choices');
        panel.innerHTML = `
            <p><strong>Help improve Legitimate Collector?</strong> Optional Google Analytics measures page visits and a few general actions. It stays off unless you allow it. Read our <a href="./privacy.html">Privacy notice</a>.</p>
            <div class="analytics-consent-actions">
                <button type="button" data-consent="accepted">Allow analytics</button>
                <button type="button" data-consent="rejected">Reject optional analytics</button>
            </div>
            <p class="analytics-consent-status" role="status" aria-live="polite" hidden></p>
        `;
        panel.addEventListener('click', event => {
            const choice = event.target.closest('[data-consent]')?.dataset.consent;
            if (!choice) return;

            const status = panel.querySelector('.analytics-consent-status');
            try {
                window.localStorage.setItem(consentKey, choice);
            } catch (error) {
                console.error('Could not save your analytics preference:', error);
                status.textContent = choice === 'accepted'
                    ? 'Your choice could not be saved. Analytics will only run for this visit.'
                    : 'Your choice could not be saved. Analytics will remain off for this visit.';
                status.hidden = false;
                if (choice === 'accepted') startAnalytics();
                return;
            }

            panel.remove();
            if (choice === 'accepted') startAnalytics();
        });
        document.body.append(panel);
    }

    function setupAnalytics() {
        const settingsLink = document.querySelector('[data-analytics-settings]');
        if (settingsLink) {
            settingsLink.hidden = false;
            settingsLink.addEventListener('click', event => {
                event.preventDefault();
                showConsentPanel();
            });
        }

        let consent;
        try {
            consent = window.localStorage.getItem(consentKey);
        } catch (error) {
            console.error('Could not read your analytics preference:', error);
        }

        if (consent === 'accepted') startAnalytics();
        else if (consent !== 'rejected') showConsentPanel();

        document.addEventListener('click', event => {
            const target = event.target instanceof Element ? event.target : null;
            if (!target) return;

            if (target.closest('#auth-nav-btn button[onclick*="loginWithGoogle"]')) {
                sendEvent('sign_in_click', { method: 'google' });
            }

            const sponsoredLink = target.closest('a[rel~="sponsored"]');
            if (sponsoredLink) {
                let partner = 'other';
                try {
                    partner = new URL(sponsoredLink.href).hostname;
                } catch (error) {
                    console.error('Could not identify affiliate link destination:', error);
                }
                sendEvent('affiliate_click', { partner });
            }
        });

        const searchInput = document.getElementById('searchInput');
        searchInput?.addEventListener('input', () => {
            window.clearTimeout(searchTimer);
            if (searchInput.value.trim().length < 2) return;
            searchTimer = window.setTimeout(() => {
                sendEvent('directory_search', {
                    query_length_bucket: searchInput.value.trim().length < 5 ? '2-4' : '5-plus'
                });
            }, 700);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAnalytics, { once: true });
    } else {
        setupAnalytics();
    }
}
