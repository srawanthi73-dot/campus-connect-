# Campus Connect - Production Setup Guide

Welcome to the **Campus Connect** administration and development guide. This document contains everything you need to take this application from local development to a live campus environment.

---

## 1. Prerequisites
- **Node.js** (v18+)
- **NPM** or **Yarn**
- **Supabase Account** (Free tier works perfectly)

---

## 2. Supabase Configuration (Backend)

### A. Database Setup
1. Create a new project on [Supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the side navigation.
3. Copy the entire contents of [supabase_schema.sql](./supabase_schema.sql) and run it.
4. This will create all tables (`users`, `events`, `registrations`, `faq`, `bookmarks`) and set up **Row Level Security (RLS)**.

### B. Authentication Setup
1. Go to **Authentication > Providers** and ensure **Email** is enabled.
2. Disable "Confirm Email" if you want students to log in instantly after enrollment.
3. Go to **Authentication > Templates** and customize the Password Reset email.

### C. Storage Setup
1. Go to **Storage > Buckets**.
2. Create a new **Public** bucket named `posters`.
3. Add a policy for the `posters` bucket:
   - **Insert/Update/Delete:** Only for users with `role = 'admin'`.
   - **Select:** Publicly readable.

---

## 3. Frontend Configuration

### A. Environment Variables
Local development requires your Supabase credentials. Update the `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh... (your anon key)
```

### B. Installing Dependencies
Run the following command in your terminal:
```bash
npm install
```

### C. Running Locally
Launch the high-performance development server:
```bash
npm run dev
```

---

## 4. Administration Features

### Bulk Student Enrollment
1. Log in as an **Admin** (requires manual role update in Supabase DB for first time).
2. Navigate to `/admin/users`.
3. Drag and drop an Excel file with `name` and `roll_number` columns.
4. The system automatically maps roll numbers to internal email identities.

### Dynamic Event Creation
- Use the **Event Forge** (`/admin/events`) to upload posters and set venue details.
- Real-time updates ensure students see new events the moment they are "Forged".

---

## 5. Deployment
We recommend **Vercel** or **Netlify** for one-click deployment.
1. Connect your GitHub repository.
2. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Environment Variables settings.
3. Deploy!

---

**Built with Precision for Campus Excellence.**
