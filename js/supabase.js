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
-- 1. PUBLIC USER PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. MASTER DIRECTORY OF SIGNERS
create table if not exists signers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport_team text,
  active_address text,
  success_rate numeric default 0,
  avg_days_return integer default 0
);

-- 3. USER TTM LOGS
create table if not exists ttm_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  signer_id uuid references signers(id) on delete cascade,
  sent_date date not null,
  returned_date date,
  status text check (status in ('Pending', 'Success', 'RTS', 'Fee Required')),
  is_public boolean default true,
  notes text
);

-- 4. VAULT ITEMS & MARKETPLACE LISTINGS
create table if not exists vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  category text,
  grade text,
  is_for_sale boolean default false,
  is_for_trade boolean default false,
  price numeric,
  image_url text
);

-- 5. AUTOMATIC PROFILE CREATION TRIGGER ON OAUTH SIGN-UP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. ENABLE ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table signers enable row level security;
alter table ttm_logs enable row level security;
alter table vault_items enable row level security;

-- PROFILES POLICIES
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- SIGNERS POLICIES
create policy "Signers are viewable by everyone" on signers for select using (true);
create policy "Authenticated users can add signers" on signers for insert with check (auth.role() = 'authenticated');

-- TTM LOGS POLICIES
create policy "Public TTM entries are viewable by everyone" on ttm_logs for select using (is_public = true or auth.uid() = user_id);
create policy "Users can insert their own TTM logs" on ttm_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own TTM logs" on ttm_logs for update using (auth.uid() = user_id);
create policy "Users can delete their own TTM logs" on ttm_logs for delete using (auth.uid() = user_id);

-- VAULT ITEMS POLICIES
create policy "Marketplace items are viewable by everyone" on vault_items for select using (is_for_sale = true or is_for_trade = true or auth.uid() = user_id);
create policy "Users can manage their own vault items" on vault_items for all using (auth.uid() = user_id);
