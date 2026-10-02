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

Community posts are text-only; the form does not collect autograph photos or mailing addresses.

## Affiliate partners

Affiliate placements appear on each page and are defined in `js/affiliates.js`. The current eBay and Sportlots tracking links reuse the affiliate IDs already present in the signer search links. Replace or update the URLs there with your active partner links. Affiliate links are marked as sponsored and accompanied by a disclosure.
