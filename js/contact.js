import { SITE_CONTACT_EMAIL } from './site-config.js';

const email = SITE_CONTACT_EMAIL.trim();
if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const link = document.getElementById('contact-email-link');
    const emailSection = document.getElementById('email-contact');
    const pendingSection = document.getElementById('email-pending');

    if (link && emailSection && pendingSection) {
        link.href = `mailto:${email}`;
        link.textContent = email;
        emailSection.hidden = false;
        pendingSection.hidden = true;
    }

    document.querySelectorAll('[data-contact-email]').forEach(contactLink => {
        contactLink.href = `mailto:${email}`;
        contactLink.textContent = email;
    });
    document.querySelectorAll('[data-email-ready]').forEach(section => {
        section.hidden = false;
    });
    document.querySelectorAll('[data-email-pending]').forEach(section => {
        section.hidden = true;
    });
}
