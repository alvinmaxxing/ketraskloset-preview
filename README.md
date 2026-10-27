# Ketras Kloset website
## Accounts, database and emails (Supabase)
Project: https://pdyqbeiicbnazqpynqbf.supabase.co (org "alvin technologies", free tier). Source of the database schema and the `shop-auth` Edge Function is in `supabase/` (private repo only).

| Feature | Status |
|---|---|
| Sign up / log in / log out (email + password), account panel in header | Live |
| Wishlist saved to the database when logged in (guests keep it on the device, merged at login) | Live |
| "Buy on WhatsApp" taps saved as enquiries in `orders` / `order_items` (guest or logged-in), shown in the account panel; contact form saved to `contact_messages` | Live |
| Wishlist page: shop.html?saved=1 (account panel -> View) | Live |
| Face ID / fingerprint (passkeys): "Enable Face ID" in the account panel, "Sign in with Face ID" on log in | Live on alvinmaxxing.github.io. Moving to a new domain: change `RP_ID`/`ORIGIN` in the function and re-enable on each device |
| Password reset (email link -> `reset.html`) | Built. Emails need RESEND_API_KEY |
| Welcome / order / waitlist emails | Built. Need RESEND_API_KEY + verified sender domain |
| Google sign-in | Button built. Needs a Google OAuth client, then set `google:true` in `js/auth-config.js` |

Only the publishable key is in `js/auth-config.js`. Secret keys live only in Supabase.

### Turning on emails (Resend)
1. Create a Resend account, add and verify the shop domain (DNS records Resend shows).
2. Supabase dashboard -> Edge Functions -> Secrets: add `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `Ketras Kloset <hello@yourdomain.com>`).
3. Optional: Authentication -> SMTP settings: use Resend SMTP (smtp.resend.com, port 465, user `resend`, password = API key) so Supabase's own auth emails also send.

### Turning on Google sign-in
1. Google Cloud Console -> APIs & Services -> OAuth consent screen: External, app name Ketras Kloset, support email.
2. Credentials -> Create credentials -> OAuth client ID -> Web application.
   - Authorised JavaScript origins: `https://alvinmaxxing.github.io`
   - Authorised redirect URI: `https://pdyqbeiicbnazqpynqbf.supabase.co/auth/v1/callback`
3. Supabase -> Authentication -> Sign In / Providers -> Google: enable, paste Client ID and Client Secret.
4. Supabase -> Authentication -> URL Configuration: Site URL `https://alvinmaxxing.github.io/ketraskloset-preview/`, Redirect URLs `https://alvinmaxxing.github.io/ketraskloset-preview/**`.
5. Set `google:true` in `js/auth-config.js` and push.
