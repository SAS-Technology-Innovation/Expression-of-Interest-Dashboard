# Firebase Hosting Setup for Expression of Interest Dashboard

This guide will help you set up a custom, user-friendly URL for your Apps Script web application using Firebase Hosting.

## Quick Setup Guide

### Step 1: Install Firebase CLI

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to your Google account
firebase login
```

### Step 2: Initialize Firebase Project

```bash
# Navigate to the firebase-hosting directory
cd firebase-hosting

# Initialize Firebase (if not already done)
firebase init hosting
```

During initialization:
- Select **"Use an existing project"** or **"Create a new project"**
- Choose `public` as your public directory
- Configure as single-page app: **Yes** (this enables the rewrite rules)
- Don't overwrite index.html (we already have a custom one)

### Step 3: Deploy to Firebase

```bash
# Deploy your redirect page
firebase deploy

# You'll get output like:
# ✔ Deploy complete!
# Project Console: https://console.firebase.google.com/project/your-project-id/overview
# Hosting URL: https://your-project-id.web.app
```

## Your Custom URLs

After deployment, your dashboard will be accessible via multiple friendly URLs:

### Primary URLs:
- `https://your-project-id.web.app` (main redirect page)
- `https://your-project-id.firebaseapp.com` (alternative)

### Direct Access URLs:
- `https://your-project-id.web.app/app`
- `https://your-project-id.web.app/dashboard` 
- `https://your-project-id.web.app/eoi`

All of these will redirect to your Apps Script deployment.

## Features Included

✅ **Professional Loading Screen**: Matches your dashboard's SAS branding  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Multiple Redirect Routes**: `/app`, `/dashboard`, `/eoi` all work  
✅ **Manual Fallback**: Click-through option if auto-redirect fails  
✅ **Security Headers**: Basic security configuration  
✅ **Current Deployment**: Points to your latest deployment (@12)  

## Updating the Apps Script URL

When you create new deployments, update the URL in two places:

### 1. Update `public/index.html`:
```javascript
// Line ~97 in index.html
const appScriptUrl = "https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec";
```

### 2. Update `firebase.json`:
```json
// Update all redirect destinations to your new deployment ID
"destination": "https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec"
```

### 3. Redeploy:
```bash
firebase deploy
```

## Optional: Custom Domain Setup

For a completely custom domain (e.g., `eoi.sas.edu.sg`):

1. In Firebase Console, go to **Hosting**
2. Click **"Add custom domain"**
3. Enter your domain
4. Follow DNS setup instructions
5. Firebase will provision SSL certificate automatically

## Project Structure

```
firebase-hosting/
├── firebase.json          # Firebase configuration
├── public/
│   └── index.html         # Custom redirect page
└── FIREBASE_SETUP.md      # This guide
```

## Suggested Project Names

When creating your Firebase project, consider names like:
- `sas-expression-of-interest`
- `sas-eoi-dashboard`
- `sas-faculty-transfers`

This will give you URLs like:
- `https://sas-expression-of-interest.web.app`
- `https://sas-eoi-dashboard.web.app`

## Benefits

🚀 **Professional URL**: Clean, branded URL instead of long Google script URL  
⚡ **Fast Loading**: Global CDN with instant redirects  
🔒 **Secure**: Automatic HTTPS and security headers  
📱 **Mobile Friendly**: Responsive design that works everywhere  
🎨 **Branded**: Matches your dashboard's SAS styling  
📊 **Trackable**: Easy to add analytics later  

## Maintenance

- **Automatic**: Once set up, it works automatically
- **Updates**: Only update URLs when you create new major deployments
- **Free**: Firebase hosting free tier is very generous
- **Reliable**: Google's infrastructure ensures high uptime

## Need Help?

Technical issues with Firebase setup? Email [edtech@sas.edu.sg](mailto:edtech@sas.edu.sg)

---

*Created by the Technology & Innovation Team*
