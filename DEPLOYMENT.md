# 🚀 Deployment Configuration

## ⚠️ CRITICAL - READ THIS FIRST

This project MUST ONLY be deployed to:

### ✅ CORRECT Configuration
- **Vercel Project ID:** `prj_NKoHfOelIq1p7RtbeEwYkWaxED3Q`
- **Vercel Project Name:** `nextbase-claude`
- **GitHub Repository:** `comaeclipse/nextbase-claude`
- **Production URL:** https://nextbase-claude.vercel.app

### ❌ WRONG Configuration (DO NOT USE)
- **Old Project ID:** `prj_sAkvxSt9gIlnPE4EjF42nmPUvCUk`
- **Old Project Name:** `nextbase`

---

## Deployment Methods

### Method 1: Git Push (Recommended - Automatic)
```bash
git add .
git commit -m "Your commit message"
git push origin main
```
Vercel will automatically deploy via Git integration.

### Method 2: Manual Vercel CLI
```bash
npx vercel --prod
```
**IMPORTANT:** The `.vercel/project.json` is configured to deploy to the correct project.

---

## Verification Checklist

Before deploying, verify:
- [ ] `.vercel/project.json` contains `prj_NKoHfOelIq1p7RtbeEwYkWaxED3Q`
- [ ] Git remote is `https://github.com/comaeclipse/nextbase-claude.git`
- [ ] Deploying to production URL: `nextbase-claude.vercel.app`

---

## Configuration Files

### .vercel/project.json
```json
{
  "projectId": "prj_NKoHfOelIq1p7RtbeEwYkWaxED3Q",
  "orgId": "team_pC6a0An6oM9kzA0RFUbSo4ia"
}
```

### Git Remote
```bash
git remote -v
# Should show:
# origin  https://github.com/comaeclipse/nextbase-claude.git (fetch)
# origin  https://github.com/comaeclipse/nextbase-claude.git (push)
```

---

## Environment Variables (Vercel Dashboard)

Must be set in Vercel project settings:
- `DATABASE_URL` - PostgreSQL connection string (Neon)

---

## Troubleshooting

### Wrong Project Deployed?
1. Check `.vercel/project.json` contains correct project ID
2. Delete `.vercel` folder and run `npx vercel link` to re-link
3. Select the `nextbase-claude` project when prompted

### Deployment Failed?
1. Check Vercel dashboard logs
2. Verify environment variables are set
3. Ensure `DATABASE_URL` is configured

---

**Last Updated:** October 9, 2025  
**Framework:** Next.js 14 with App Router  
**Database:** PostgreSQL (Neon)

