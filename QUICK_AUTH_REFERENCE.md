# Quick Auth System Reference

## How the Fixed System Works

### Login Flow
1. User submits login form on `/auth/login`
2. Backend validates credentials
3. Token & session saved via `saveSession()`:
   - Stored in 3 localStorage keys for redundancy
   - Stored in DOM attributes
   - Custom event `AUTH_CHANGED_EVENT` fires
4. User redirected to appropriate dashboard

### Protected Page Access
1. User navigates to `/tenant/dashboard` (or landlord/admin)
2. Page wrapped in `<ProtectedPage requiredRole="tenant">`
3. ProtectedPage component:
   - Calls `useAuth()` hook
   - Waits for session to load (`isLoading` && `isChecking`)
   - Shows loading state while checking
   - Validates user has correct role
   - Allows access or redirects
4. Dashboard content renders only if authorized

### Session Recovery
If localStorage is cleared or unavailable:
1. User refreshes page or navigates
2. `getSession()` tries to read from multiple sources:
   - Primary: `tyrent_auth_session_v1`
   - Secondary: `tyrent_auth_token_v1`
   - Legacy: `token`
   - Fallback: DOM attributes
3. Session restored from whichever source has data
4. User stays logged in

### Token Sending to Backend
Every API request:
1. `apiRequest()` calls `getAuthToken()`
2. Token retrieved from available storage
3. Authorization header set: `"Token {token}"`
4. Sent with all authenticated API calls

## Using the System

### For New Protected Routes
```typescript
import { ProtectedPage } from "@/components/protected-page"

function MyDashboardContent() {
  // Your dashboard code here
  return <div>Protected content</div>
}

export default function MyDashboard() {
  return (
    <ProtectedPage requiredRole="tenant">
      <MyDashboardContent />
    </ProtectedPage>
  )
}
```

### In Components that Need Auth Info
```typescript
import { useAuth } from "@/lib/hooks/use-auth"

export function MyComponent() {
  const { session, user, token, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) return <div>Not logged in</div>
  
  return <div>Hello, {user?.fullName}</div>
}
```

### In useEffect/Old-Style Auth Check
```typescript
import { requireAuth } from "@/lib/route-guards"

useEffect(() => {
  const auth = requireAuth({ role: "landlord" })
  if (!auth.ok) {
    router.replace(auth.redirectTo)
    return
  }
  // Safe to use auth.session here
  console.log("Landlord user:", auth.session.user)
}, [])
```

## Key Components

### `src/lib/auth.ts`
- `getSession()` - Read current session
- `saveSession(session)` - Save user session
- `signOut()` - Clear all session data
- `getSession()` returns: `{ user, token, createdAt }`

### `src/lib/hooks/use-auth.ts`
- React hook for session management
- Returns: `{ session, user, token, isAuthenticated, isLoading, isChecking }`
- Auto-syncs across tabs
- Use this in client components

### `src/components/protected-page.tsx`
- Wrapper for protecting routes
- Props: `requiredRole`, `children`, `fallback`
- Handles all auth logic internally
- Use this to wrap dashboard pages

### `src/lib/route-guards.ts`
- `requireAuth(options)` - Check if user is authenticated
- `dashboardRouteForRole(role)` - Get correct dashboard URL for role
- Mostly for backward compatibility with existing code

## Troubleshooting

### User redirected to login even though they're logged in
1. Check browser localStorage in DevTools
2. Should have keys: `tyrent_auth_session_v1`, `tyrent_auth_token_v1`, `token`
3. Verify token is present and valid
4. Check console for errors
5. Try logging in again

### Session lost after page refresh
1. Check all 3 localStorage keys are present
2. Verify JSON in localStorage is valid
3. Check browser privacy settings aren't blocking storage
4. Try disabling browser extensions
5. Clear site cache and log in again

### Wrong dashboard shown after login
1. Check user role in localStorage (user.role field)
2. Verify role is one of: "tenant", "landlord", "admin"
3. Ensure role matches `requiredRole` in ProtectedPage
4. Check database for correct role assignment

### API requests unauthorized (401/403)
1. Verify token in localStorage
2. Check Authorization header in Network tab
3. Ensure token format is "Token {token}"
4. Verify backend accepts this token format
5. Check token hasn't expired

## Storage Keys Reference

```
localStorage keys used:
├─ "tyrent_auth_session_v1"  (full session: user + token)
├─ "tyrent_auth_token_v1"    (token only, new format)
├─ "token"                   (legacy support)
├─ "tyrent_auth_users_v1"    (local user database)
└─ "tyrent-theme"            (theme preference)

HTML attributes:
├─ data-auth-token           (token in DOM)
└─ data-auth-user            (user role in DOM)
```

## Session Flow Diagram

```
┌─────────────────┐
│  Login Page     │
│  User enters    │
│  credentials    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Backend validates credentials      │
│  Returns: { token, user, role }     │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  saveSession() called                │
│  Saves to:                           │
│  ├─ localStorage (3 keys)            │
│  ├─ DOM attributes                   │
│  └─ Fires AUTH_CHANGED_EVENT         │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Router.push(dashboard)              │
│  Navigate to /tenant/dashboard       │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  ProtectedPage component             │
│  ├─ useAuth() loads session          │
│  ├─ Shows loading state              │
│  ├─ Validates role match             │
│  └─ Renders dashboard content        │
└─────────────────────────────────────┘
```
