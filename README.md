# Legitimate Collector

Static website for TTM collecting, signer lookup, and the collector community.

## Google sign-in

The site uses Supabase Auth for Google OAuth. Configure these exact URLs:

1. In `js/config.js`, set the Project URL and publishable key from Supabase **Project Settings → API**.
2. In Supabase **Authentication → Providers → Google**, enable Google and enter the OAuth client ID and secret from the intended Google Cloud project.
3. In Google Cloud **APIs & Services → Credentials**, add this exact URI to the OAuth web client’s **Authorized redirect URIs**: `https://blpptyfncuxyygmumvok.supabase.co/auth/v1/callback`. This is the URL Google redirects back to; it is not the GitHub Pages site URL.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to `https://ayoncamilo44-bit.github.io/Legendary-Collection/` and add `https://ayoncamilo44-bit.github.io/Legendary-Collection/**` to the allowed redirect URLs. These are where Supabase returns users after Google authentication.

The sign-in button returns users to the page where they started. A Google `redirect_uri_mismatch` means the callback in step 3 is missing or does not match exactly. Verify that the OAuth client ID and secret in Supabase belong to the same Google Cloud project/client where the callback is registered; if the consent screen shows an unexpected app name, check that you have not entered credentials for the wrong app. The publishable key is intended for browser use; never put a Supabase service-role key in this static site.

## Importing spreadsheet signers

The Excel-processing Python script runs on your computer and exports `master_data.csv`; it does not update the website or Supabase by itself. Run it where the Excel files are available, then sign in to the site, open **Dashboard**, and upload `master_data.csv` in the CSV import area. The importer handles quoted CSV fields such as addresses containing commas and maps the supported signer columns into the database.

## Add Signer and Community setup

Both pages write through Supabase and require Google sign-in. Before using them, open the Supabase **SQL Editor**, paste and run the contents of `supabase-setup.sql`, then refresh the site. This creates the community-post table, allows public reading of signers and community posts, and limits new signer records and community posts to authenticated users. Without this one-time database setup, Supabase rejects submissions and the community feed cannot load.

Community posts can include one optional photo (JPG, PNG, or WebP, up to 5 MB), stored in the `community-posts` Supabase Storage bucket created by `supabase-setup.sql`. The form does not collect mailing addresses.

## Affiliate partners

Affiliate placements appear on the main collecting pages and beginner guide, and are defined in `js/affiliates.js`. The eBay and Sportlots links reuse the tracking IDs already present in signer search links; the Amazon card-supplies link uses the Associates tag supplied for the site. Replace or update the URLs there with your active partner links. Affiliate links are marked as sponsored and accompanied by a disclosure, including Amazon's qualifying-purchases statement.

## Collector guides

`guides.html` contains original introductory guidance informed by the linked independent resources. It is linked from site navigation and the sitemap. Add future original guides as separate public pages and update the sitemap and navigation; attribute and link to source material rather than copying third-party article text or images.

## Site identity, search, and analytics

- The site currently uses the GitHub Pages address `https://ayoncamilo44-bit.github.io/Legendary-Collection/`. Canonical URLs, Open Graph tags, `robots.txt`, and `sitemap.xml` use this address. If you add a custom domain, configure it in GitHub Pages and your DNS provider, then update canonical/Open Graph URLs in the HTML pages and the sitemap and robots files. Also update Supabase **Authentication → URL Configuration** with the new site URL and allowed redirects, then add the new domain to Google Search Console and the GA4 web stream. The Supabase OAuth callback URI itself remains the same.
- `favicon.svg` and `assets/legitimate-collector-social.png` provide the browser icon and social-share preview.
- Public pages have page-specific titles and descriptions. The dashboard and signer-entry form are marked `noindex`; the sitemap includes public-facing pages only.
- To enable Google Analytics 4, create a GA4 property and web data stream for the site at [analytics.google.com](https://analytics.google.com/), then copy its Measurement ID (format `G-XXXXXXXXXX`) into `GA_MEASUREMENT_ID` in `js/site-config.js`. The integration does not load Google Analytics until a visitor opts in. It records page views, sign-in button clicks, directory search activity without search text, and affiliate destination hostnames. Visitors can change their choice using **Cookie settings** in the footer.
- To register the site with [Google Search Console](https://search.google.com/search-console), add the current full GitHub Pages URL as a URL-prefix property. Choose HTML-tag verification and add the `google-site-verification` meta tag Google provides to each page's `<head>` (or at minimum `index.html`), then submit `https://ayoncamilo44-bit.github.io/Legendary-Collection/sitemap.xml`. Search Console verification and indexing requests require signing in to the site owner's Google account and cannot be completed by this static repository alone.
- The dedicated public contact email is set in `SITE_CONTACT_EMAIL` in `js/site-config.js` and is used by the Contact, Privacy, and Terms pages.

Privacy and terms pages describe the current static site and its integrations in plain language. Review them against the site owner's location and the laws that apply before relying on them as legal documents.
