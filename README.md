# Legendary Collection

Static website for TTM collecting, signer lookup, and the collector community.

## Google sign-in

The site uses Supabase Auth for Google OAuth. Configure these exact URLs:

1. In `js/config.js`, set the Project URL and publishable key from Supabase **Project Settings → API**.
2. In Supabase **Authentication → Providers → Google**, enable Google and enter the OAuth client ID and secret from the intended Google Cloud project.
3. In Google Cloud **APIs & Services → Credentials**, add this exact URI to the OAuth web client’s **Authorized redirect URIs**: `https://blpptyfncuxyygmumvok.supabase.co/auth/v1/callback`. This is the URL Google redirects back to; it is not the GitHub Pages site URL.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to `https://ayoncamilo44-bit.github.io/Legendary-Collection/` and add `https://ayoncamilo44-bit.github.io/Legendary-Collection/**` to the allowed redirect URLs. These are where Supabase returns users after Google authentication.

The sign-in button returns users to the page where they started. A Google `redirect_uri_mismatch` means the callback in step 3 is missing or does not match exactly. Verify that the OAuth client ID and secret in Supabase belong to the same Google Cloud project/client where the callback is registered; if the consent screen shows an unexpected app name, check that you have not entered credentials for the wrong app. The publishable key is intended for browser use; never put a Supabase service-role key in this static site.

## Owner access and moderation setup

The site source controls the layout and appearance. Keep GitHub write access limited to you. `.github/CODEOWNERS` names the owner as the reviewer; in GitHub repository settings, enable a ruleset for `main` that requires pull requests and code owner review before merging. The public repository lets people read and fork the code; it does not grant them write access to this site's deployment.

In Supabase, open **SQL Editor** and run `supabase-setup.sql`. This installs the row-level access rules, admin role table, signer suggestion queue, and tables used by the community and Showcase pages. Community posts and Showcase stories publish immediately. Authors can edit or delete their own entries; they cannot change site layout, feature a Showcase story, or manage the site. Signer suggestions go into a separate owner review queue and are copied to the public directory only when approved. CSV imports and signer review require the owner role. The database also limits each account to 10 submissions across all three forms per 24-hour period.

To assign the owner role:

1. Sign in to the published site with the Google account that should own the site.
2. In Supabase **Authentication → Users**, copy that account's user UUID.
3. In the Supabase SQL Editor, run `insert into public.site_admins (user_id) values ('YOUR-AUTH-USER-UUID');`, replacing the example with the UUID. This assignment is performed in the trusted SQL editor; site users cannot grant themselves the role.
4. Refresh the site while signed in. The **Site Admin** link opens `admin.html`, where pending signer suggestions can be approved or rejected and site owner tools are available.

To revoke owner access, delete that account's row from `public.site_admins` in the Supabase SQL Editor. Do not place a Supabase service-role or secret key in this static site.

## Importing spreadsheet signers

The Excel-processing Python script runs on your computer and exports `master_data.csv`; it does not update the website or Supabase. Run it where the Excel files are available, then sign in with the owner account, open **Dashboard**, and upload `master_data.csv` in the owner-only CSV import area. The importer handles quoted CSV fields such as addresses containing commas and maps the supported signer columns into the database.

Collectors can suggest individual signers while signed in. Those suggestions remain private in the review queue until approved. Community posts and stories can include one optional photo (JPG, PNG, or WebP, up to 5 MB), stored in the `community-posts` Supabase Storage bucket, and publish as soon as submitted. The community form asks contributors not to include private mailing addresses.

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
