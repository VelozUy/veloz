# 🚀 Netlify Deployment Checklist

Your Veloz project is now ready for deployment! Follow this checklist to get your site live on Netlify.

## ✅ Pre-Deployment Checklist

- [x] **Build Test Passed** - `npm run build` runs successfully
- [x] **Linting Clean** - No ESLint errors
- [x] **TypeScript Clean** - No type errors
- [x] **Netlify Configuration** - `netlify.toml` created
- [x] **Environment Documentation** - `ENVIRONMENT.md` created
- [x] **README Updated** - Deployment instructions added

## 🚀 Deployment Steps

### 1. Create Netlify Account

- Go to [netlify.com](https://netlify.com)
- Sign up with GitHub account (recommended)

### 2. Connect Repository

- Click "New site from Git"
- Choose GitHub and authorize Netlify
- Select your `veloz` repository

### 3. Configure Build Settings

Netlify should auto-detect Next.js, but verify these settings:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 4. Add Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Deploy

- Click "Deploy site"
- Wait for build to complete (2-5 minutes)
- Your site will be live at `https://random-name-123.netlify.app`

### 6. Custom Domain (Optional)

- In Site settings → Domain management
- Add custom domain: `veloz.com.uy`
- Configure DNS records as instructed
- SSL certificate will be automatically provisioned

## 🔧 Build Configuration

The project includes optimized Netlify configuration:

### `netlify.toml` Features:

- ✅ Next.js plugin for proper routing
- ✅ Security headers (XSS protection, frame options)
- ✅ Static asset caching (1 year cache)
- ✅ Redirect rules for SPA routing
- ✅ Performance optimizations

### Build Optimizations:

- ✅ Static page generation
- ✅ Image optimization
- ✅ Bundle splitting
- ✅ Tree shaking

## 🐛 Troubleshooting

### Build Fails with "Host key verification failed"?

**SSH Authentication Issue**

1. Go to Netlify dashboard → **Site settings** → **Build & deploy**
2. Click **"Unlink repository"** and re-authorize Netlify
3. Re-select your repository and trigger a new deploy

**Deploy Key Issue**

1. Check your Git repository → **Settings** → **Deploy keys**
2. Ensure Netlify deploy key has read access
3. If missing, re-link repository in Netlify to recreate it

### Build Fails with "Plugin missing manifest.yml"?

**Custom Plugin Configuration**

- Ensure all custom Netlify plugins have a `manifest.yml` file
- Required structure:

```yml
name: plugin-name
description: Plugin description
author: Your Name
version: 1.0.0
inputs: []
```

- Location: `netlify/plugins/[plugin-name]/manifest.yml`

### Build Fails?

1. Check environment variables are set correctly
2. Verify Firebase project is active
3. Check build logs for specific errors
4. Ensure all custom plugins have manifest files

### Site Not Loading?

1. Verify `netlify.toml` is in root directory
2. Check redirect rules in Netlify dashboard
3. Ensure environment variables have correct names

### Firebase Not Working?

1. Confirm all `NEXT_PUBLIC_` prefixes are correct
2. Check Firebase project settings
3. Verify Firebase security rules allow read access

## 📊 Post-Deployment

### Performance Check

- [ ] Run Lighthouse audit
- [ ] Test mobile responsiveness
- [ ] Verify all pages load correctly
- [ ] Test contact form functionality

### SEO Setup

- [ ] Submit sitemap to Google Search Console
- [ ] Configure Google Analytics (if needed)
- [ ] Set up monitoring/uptime checks

## 🎉 Success!

Once deployed, your site will feature:

- ⚡ **Fast Loading** - Optimized Next.js build
- 📱 **Mobile Responsive** - Works on all devices
- 🔒 **Secure** - HTTPS by default
- 🌐 **Global CDN** - Fast worldwide access
- 🔄 **Auto Deploy** - Updates on git push

Your Veloz website is now live and ready to capture the unrepeatable! 📸
