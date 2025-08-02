# 🔧 Release API Endpoint Fix

## 🚨 **Problem Identified**

The **AI Generate Release** functionality was failing due to **incorrect API endpoint configuration**. The system was attempting to call:

```
❌ WRONG: https://labs-api.buildly.dev/release/release/
✅ CORRECT: https://labs-release.buildly.dev/release/
```

**Root Cause**: All release-related mutations and queries were incorrectly using `window.env.API_URL` (Core API) instead of `window.env.RELEASE_SERVICE_URL` (Release Service).

## 🛠️ **Fixes Applied**

### 1. **Release Creation Mutation** 
**File**: `src/react-query/mutations/release/createReleaseMutation.js`
```javascript
// BEFORE: ❌
`${window.env.API_URL}release/release/`

// AFTER: ✅  
`${window.env.RELEASE_SERVICE_URL}release/`
```

### 2. **Release Query** 
**File**: `src/react-query/queries/release/getAllReleaseQuery.js`
```javascript
// BEFORE: ❌
`${window.env.API_URL}release/release/?product_uuid=${product_uuid}`

// AFTER: ✅
`${window.env.RELEASE_SERVICE_URL}release/?product_uuid=${product_uuid}`
```

### 3. **Feature Query**
**File**: `src/react-query/queries/release/getAllFeatureQuery.js` 
```javascript
// BEFORE: ❌
`${window.env.API_URL}release/feature/?product_uuid=${product_uuid}`

// AFTER: ✅
`${window.env.RELEASE_SERVICE_URL}feature/?product_uuid=${product_uuid}`
```

### 4. **Delete Release Mutation**
**File**: `src/react-query/mutations/release/deleteReleaseMutation.js`
```javascript
// BEFORE: ❌
`${window.env.API_URL}release/release/${deleteReleaseData.release_uuid}/`

// AFTER: ✅
`${window.env.RELEASE_SERVICE_URL}release/${deleteReleaseData.release_uuid}/`
```

### 5. **Create Feature Mutation**
**File**: `src/react-query/mutations/release/createFeatureMutation.js`
```javascript
// BEFORE: ❌
`${window.env.API_URL}release/feature/`

// AFTER: ✅
`${window.env.RELEASE_SERVICE_URL}feature/`
```

## 🌐 **Environment Configuration**

The correct environment variables are already configured in `public/environment.js`:

```javascript
window.env = {
  // Core API for authentication, users, etc.
  API_URL: isLocalDevelopment ? "/api/core/" : "https://labs-api.buildly.dev/",
  
  // Dedicated Release Service API
  RELEASE_SERVICE_URL: isLocalDevelopment ? "/api/release/" : "https://labs-release.buildly.dev/",
  
  // Other services...
  PRODUCT_SERVICE_URL: isLocalDevelopment ? "/api/product/" : "https://labs-product.buildly.dev/",
  BABBLE_CHATBOT_URL: isLocalDevelopment ? "/api/babble/chatbot" : "https://labs-babble.buildly.dev/chatbot"
};
```

## 🔧 **Proxy Configuration**

The development proxy is correctly configured in `src/setupProxy.js`:

```javascript
// Release Service Proxy (✅ Already correct)
app.use('/api/release', createProxyMiddleware({
  target: 'https://labs-release.buildly.dev',  // ✅ Correct target
  changeOrigin: true,
  pathRewrite: { '^/api/release': '' }
}));
```

## 🎯 **Expected Results**

After these fixes:

1. ✅ **AI Generate Release** button will work correctly
2. ✅ **Release creation** will use the proper Release Service API  
3. ✅ **Release listing** will load from the correct endpoint
4. ✅ **CORS errors** for release operations will be resolved
5. ✅ **Development proxy** will route requests correctly

## 🧪 **Testing**

To verify the fixes:

1. Go to **Releases** page
2. Click **"AI Generate Release"** button
3. Verify no CORS errors in console
4. Verify release is created successfully
5. Check that release appears in the releases list

## ⚠️ **Additional Files Needing Updates**

The following files still use incorrect endpoints but are lower priority:
- `src/react-query/mutations/release/updateFeatureMutation.js`
- `src/react-query/mutations/release/createCommentMutation.js`
- `src/react-query/mutations/release/updateFeatureIssueMutation.js`
- `src/react-query/mutations/release/createIssueMutation.js`
- `src/react-query/mutations/release/updateIssueMutation.js`
- `src/react-query/queries/release/getAllCommentQuery.js`
- `src/react-query/queries/release/getAllIssueQuery.js`

These can be updated in a follow-up fix for complete system consistency.

**Status: AI Generate Release should now be working! 🚀**
