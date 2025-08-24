# Next.js Proxy Configuration for CORS Issues

## 🚀 Problem Solved

This configuration solves CORS (Cross-Origin Resource Sharing) issues when calling Firebase Cloud Functions from your local development environment.

## 🔧 How It Works

### 1. **Next.js Rewrites Proxy**
The `next.config.ts` file now includes a rewrites configuration that creates a local proxy:

```typescript
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "https://us-central1-eezyhealth-2025.cloudfunctions.net/:path*",
    },
  ];
}
```

### 2. **API Store Configuration**
The API store automatically switches between local proxy and direct Cloud Functions based on environment:

```typescript
baseUrl: process.env.NODE_ENV === 'development' 
  ? '/api'  // Use local proxy in development
  : (process.env.NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL || "https://us-central1-eezyhealth-2025.cloudfunctions.net")
```

## 📍 URL Mapping

| Development | Production |
|-------------|------------|
| `/api/getUsers` → `https://us-central1-eezyhealth-2025.cloudfunctions.net/getUsers` | Direct to Cloud Functions |

## 🎯 Benefits

1. **No CORS Issues** - All requests go through your Next.js server
2. **Environment Aware** - Automatically switches based on NODE_ENV
3. **No Code Changes** - Your existing API calls work unchanged
4. **Secure** - Only active during development

## 🧪 Testing

### Check Proxy Status
Click the "Test API" button on the admin users page to see:
- Environment (development/production)
- Base URL being used
- Whether proxy is active
- Full API endpoint URL

### Console Output Example
```
Testing API connection...
Environment: development
Base URL: /api
Full URL: /api/getUsers
Using proxy: Yes
```

## 🔍 How to Verify

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Check Network Tab**
   - Open browser DevTools
   - Go to Network tab
   - Make an API call
   - You should see requests to `/api/*` instead of direct Cloud Functions

3. **Check Server Logs**
   - Next.js will show the proxy requests in the terminal

## 🚨 Important Notes

- **Development Only** - Proxy only works in development mode
- **Production** - Automatically uses direct Cloud Functions
- **No Authentication Changes** - Headers and tokens work the same
- **Performance** - Minimal overhead, requests still go to Firebase

## 🔧 Troubleshooting

### If Proxy Isn't Working

1. **Restart Dev Server**
   ```bash
   npm run dev
   ```

2. **Check next.config.ts**
   - Ensure rewrites are properly configured
   - Verify destination URL is correct

3. **Check Environment**
   - Ensure NODE_ENV is 'development'
   - Check browser console for errors

4. **Verify Network Requests**
   - Look for requests to `/api/*` in Network tab
   - Should not see direct Cloud Functions calls

## 📚 Related Files

- `next.config.ts` - Proxy configuration
- `src/store/api.ts` - API store with environment-aware baseUrl
- `src/app/admin/users/page.tsx` - Example usage and testing
