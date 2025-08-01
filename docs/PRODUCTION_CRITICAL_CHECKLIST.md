# 🚨 Critical Production Checklist - Veloz

_Quick Reference for Launch Day_

## 🔥 **CRITICAL - Must Complete Before Launch**

### Architecture Rules (Non-Negotiable)

- [ ] **NO real-time Firestore listeners** - Only use `getDocs`, `getDoc`
- [ ] **Static generation only** - No client-side dynamic content
- [ ] **Single theme** - No dark mode toggle
- [ ] **Admin panel in Spanish only**
- [ ] **Build-time content generation** - `npm run build:data`

### Security (Critical)

- [ ] Firebase security rules deployed and tested
- [ ] **Firebase rules reviewed and approved by security team**
- [ ] **Firestore rules tested with production data patterns**
- [ ] **Storage rules restrict access to authorized users only**
- [ ] All environment variables set in production
- [ ] No secrets in code or version control
- [ ] Admin authentication working
- [ ] Content Security Policy configured

### Performance (Critical)

- [ ] Lighthouse score >90
- [ ] Page load times <3 seconds
- [ ] All images optimized (WebP/AVIF)
- [ ] No layout shifts during loading
- [ ] Gallery loads smoothly on all devices

### Testing (Critical)

- [ ] All tests passing (`npm run test:ci`)
- [ ] Admin panel fully tested
- [ ] Contact form working
- [ ] Multi-language content verified
- [ ] Mobile responsiveness confirmed

### Deployment (Critical)

- [ ] Production build successful (`npm run build`)
- [ ] Netlify deployment working
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Build trigger API working

## ⚠️ **HIGH PRIORITY - Complete Before Launch**

### Code Quality

- [ ] TypeScript errors resolved (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Theme compliance (`npm run theme:check`)
- [ ] No hardcoded colors
- [ ] REDJOLA font never bold

### Content & SEO

- [ ] All content in 3 languages (es, en, pt)
- [ ] SEO metadata configured
- [ ] Open Graph tags implemented
- [ ] Favicon configured
- [ ] Legal pages complete

### Monitoring

- [ ] Google Analytics configured
- [ ] Error tracking set up
- [ ] Uptime monitoring active
- [ ] Performance monitoring enabled
- [ ] Backup systems tested

## 📋 **Quick Commands for Verification**

```bash
# Code Quality
npm run type-check
npm run lint
npm run test:ci
npm run theme:check

# Build & Deploy
npm run build
npm run build:data

# Performance
npm run test:coverage

# Firebase Rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 🎯 **Launch Day Sequence**

1. **Pre-Launch (1 hour)**
   - [ ] Final build deployed
   - [ ] All tests passing
   - [ ] Monitoring active
   - [ ] Team notified

2. **Launch**
   - [ ] DNS propagated
   - [ ] SSL active
   - [ ] All pages loading
   - [ ] Contact form tested

3. **Post-Launch (24 hours)**
   - [ ] Monitor errors
   - [ ] Check performance
   - [ ] Verify analytics
   - [ ] Gather feedback

## 🚨 **Emergency Contacts**

- **Technical Lead**: ********\_********
- **Product Owner**: ********\_********
- **DevOps**: ********\_********
- **Client**: ********\_********

## ✅ **Final Approval**

**Ready for Launch**: [ ] YES | [ ] NO

**Approved By**: ********\_******** Date: ******\_\_\_******

**Launch Time**: ******\_\_\_******
