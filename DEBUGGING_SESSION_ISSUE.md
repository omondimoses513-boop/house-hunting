# Session/Redirect Debugging Guide

## Current Status
You mentioned:
- Login shows "Login successful! Redirecting..." but doesn't actually redirect
- When you click dashboard while logged in, you're immediately redirected back to login
- CORS is properly configured on Django (allows all origins)

**This is NOT a CORS issue** - your Django config shows `CORS_ALLOW_ALL_ORIGINS = True` which is correct.

## The Real Problem
The session is not persisting between page loads. This could be:

1. **localStorage scope issue** - The domain/subdomain might have changed between login and dashboard navigation
2. **Browser storage limitations** - Some browsers block localStorage under certain conditions
3. **Timing race condition** - Session write not complete before redirect

## How to Debug

### Step 1: Check Browser Console (F12)
After deploying these changes, login again and **immediately** open your browser's Developer Tools (F12 → Console tab).

You should see these logs:
```
[v0] Saving session: {userRole: "TENANT", hasToken: true, ...}
[v0] Session saved. Verifying storage: {sessionStored: true, tokenStored: true, legacyTokenStored: true}
[v0] Redirect timeout executed
```

### Step 2: Check localStorage in DevTools
1. Go to DevTools → Application → Storage → Local Storage
2. Select your production domain (tyrenthomes.com)
3. Look for these keys:
   - `tyrent_auth_session_v1` - Should contain the full session object as JSON
   - `tyrent_auth_token_v1` - Should contain just the token
   - `token` - Legacy token key (for backward compatibility)

If these keys are **empty or missing**, localStorage writes are failing. This could be due to:
- Private browsing mode
- Browser privacy settings
- Domain restrictions
- Cross-domain issues

### Step 3: Check localStorage Scope
The **critical issue** might be that login happens on one domain and dashboard on another:
- Login: `tyrenthomes.com/auth/login`
- Dashboard: `tyrenthomes.com/tenant/dashboard`

If they're on **different subdomains** (e.g., `auth.tyrenthomes.com` vs `app.tyrenthomes.com`), localStorage won't share between them.

**Check your deployment:**
1. Are both frontend and backend on the same domain?
2. Is the frontend deployed to: `tyrenthomes.com`
3. Is the backend API at: `api.tyrenthomes.com` or `tyrenthomes.com/api`?

### Step 4: Monitor Network
1. DevTools → Network tab
2. Click login button
3. Look for the POST to `/api/auth/login` - it should return 200 with token
4. After the 300ms delay, the page should navigate (you'll see a document request)

If the navigation doesn't happen, the `router.push()` in setTimeout might be failing.

## Possible Solutions

### If localStorage is not persisting:
The DOM attribute fallback should reconstruct the session, but it needs the full session data. Check if the fallback is working by looking for:
```
[v0] Session reconstructed from DOM/legacy storage
```

### If domain/subdomain is the issue:
You need to set a cookie-based session instead of localStorage. This requires backend changes.

### If timing is the issue:
The increased delays (300ms for login, 100ms for ProtectedPage) should fix this.

## Next Steps
1. Deploy these changes to production
2. Clear your browser cache (Ctrl+Shift+Del or Cmd+Shift+Delete)
3. Try logging in again
4. Check the browser console for `[v0]` logs
5. Check localStorage for the session keys
6. Share what you see in console with the session storage info

This will help us understand exactly where the session is getting lost.
