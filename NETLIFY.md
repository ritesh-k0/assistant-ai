# Deploying Lakshmi AI to Netlify

This project is pre-configured for **1-click / zero-config deployment on Netlify**.

---

## 🚀 Option 1: Deploy via GitHub (Recommended)

1. Push this repository to your **GitHub** account.
2. Go to [app.netlify.com](https://app.netlify.com) and click **"Add new site"** → **"Import an existing project"**.
3. Select **GitHub** and pick this repository.
4. Netlify will automatically detect `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. *(Optional)* Add your Gemini AI API key under **Site configuration** → **Environment variables**:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
   *(Supabase URL and Anon Key are already pre-configured in `netlify.toml` and client bundles).*
6. Click **"Deploy site"**. Your site is live!

---

## 📦 Option 2: Deploy via Netlify CLI

1. Install Netlify CLI globally if you haven't already:
   ```bash
   npm install -g netlify-cli
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy to Netlify:
   ```bash
   ntl deploy --prod
   ```
   Choose `dist` as the publish directory.

---

## 📁 Option 3: Deploy via Netlify Drop (Drag & Drop)

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the generated `dist` folder into the upload box.
4. Your static frontend will be deployed immediately!

---

## ⚙️ Pre-configured Netlify Features

- **`netlify.toml`**: Automatic configuration of build command (`npm run build`), publish directory (`dist`), and functions directory (`netlify/functions`).
- **`public/_redirects` & `netlify.toml` redirects**:
  - `/api/*` requests route directly to the Netlify Serverless Function (`/.netlify/functions/api/:splat`).
  - `/*` routes fallback to `/index.html` for single-page app (SPA) client-side navigation.
- **Serverless API (`netlify/functions/api.ts`)**:
  - Handles `/api/chat` with Gemini AI + offline fallback NLP.
  - Handles `/api/voice/tts` voice synthesis.
  - Handles `/api/social/generate`.
  - Handles `/api/telephony/*` and `/api/supabase/*`.
  - Health check endpoint at `/api/health`.
