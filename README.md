# ASUEdu Admission & Portal Application

A full-stack university portal built with React, TanStack Start, Vite, Tailwind CSS, and Supabase.

## 🚀 Deployment Guide

### Prerequisites

- Node.js 18+ or Node.js 20+
- GitHub Account
- Vercel Account
- Supabase Project

---

### 1. Environment Variables Configuration

Copy `.env.example` to `.env` for local development or set these variables in your Vercel Project Settings:

```env
# Required Client Variables (Vercel & Local)
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional Server-Side Secrets
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admissions@asu.edu.ng
SMTP_PASS=your-smtp-password
```

---

### 2. Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Test production build
npm run build
npm run preview
```

---

### 3. Deploying to Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Production ready commit"
   git push origin main
   ```

2. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New > Project** and select your GitHub repository.

3. **Configure Vercel Build Settings**:
   - **Framework Preset**: Vite or Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables on Vercel**:
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

5. **Deploy**:
   - Click **Deploy**. Vercel will automatically run `npm run build` and serve the application without any 404 errors on deep routes thanks to the single-page rewrite configuration in `vercel.json`.

---

### 📁 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── integrations/       # Supabase client & authentication helpers
│   ├── lib/                # Utility & server functions
│   └── routes/             # TanStack Start file-based routing
├── vercel.json             # Vercel deployment & rewrite configuration
├── .env.example            # Environment variables blueprint
└── package.json            # Dependencies & build scripts
```
