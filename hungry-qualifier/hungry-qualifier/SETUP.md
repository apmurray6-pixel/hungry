# HUNGRY Account Qualifier — Deployment Guide

## What You Need (free, takes ~10 min total)
- A GitHub account → github.com
- A Vercel account → vercel.com (sign up with GitHub)
- An Anthropic API key → console.anthropic.com

---

## Step 1 — Get Your Anthropic API Key
1. Go to console.anthropic.com and sign up / log in
2. Click "API Keys" in the left sidebar
3. Click "Create Key", give it a name like "hungry-qualifier"
4. Copy the key (starts with sk-ant-...) — save it somewhere, you only see it once

---

## Step 2 — Upload to GitHub
1. Go to github.com and click the "+" icon → "New repository"
2. Name it "hungry-qualifier", set it to Private, click "Create repository"
3. On your computer, open the hungry-qualifier folder
4. Drag the entire folder into the GitHub page where it says "uploading an existing file"
5. Click "Commit changes"

---

## Step 3 — Deploy on Vercel
1. Go to vercel.com and click "Add New Project"
2. Click "Import" next to your hungry-qualifier repository
3. Leave all settings as default — just click "Deploy"
4. Wait ~60 seconds for it to build

---

## Step 4 — Add Your API Key (important)
1. In Vercel, go to your project → Settings → Environment Variables
2. Add a new variable:
   - Name:  VITE_ANTHROPIC_API_KEY
   - Value: (paste your key from Step 1)
3. Click Save
4. Go to Deployments → click the three dots on your latest deployment → "Redeploy"

---

## Step 5 — Get Your Link
1. Go to your project overview in Vercel
2. Click "Visit" — your app is live!
3. The URL (something like hungry-qualifier.vercel.app) is what you send in the email

---

## Notes
- The API key is stored securely in Vercel — it never appears in any file you share
- Each qualification run costs a fraction of a cent in API usage
- You can update the qualification logic anytime by editing src/App.jsx and re-uploading to GitHub
