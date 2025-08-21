# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

You need to add these environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard
- Visit [vercel.com](https://vercel.com)
- Go to your project dashboard
- Navigate to **Settings → Environment Variables**

### 2. Add These Variables

```
DATABASE_URL="libsql://database-emerald-kite-vercel-icfg-wmx55mzvnaswdow1eoopiza8.aws-ap-south-1.turso.io"
TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTU4MDQ2ODIsImlkIjoiN2VlODlkNjUtYzBjNS00MzgxLWFhZDItMTYwZGZlOTYwODIyIiwicmlkIjoiNDQyMTRjOGItNjBkMi00YTFjLWIxZjYtM2QwOWEwNDA0ZTRkIn0.llyzKHm-3YYBOtzOoFQASjvvfXuBZw2sbIKTpVToQaxn2m7SPG-Hg2Opw4OGA3z3krYxB_OG9uo5paticD9XDg"
TURSO_DATABASE_URL="libsql://database-emerald-kite-vercel-icfg-wmx55mzvnaswdow1eoopiza8.aws-ap-south-1.turso.io"
NEXTAUTH_SECRET="31a213a30435a8ca789aaeb9738504ef53a4781535a263e9c3bff2623581966e"
NEXTAUTH_URL="https://ecommerce-seven-peach-48.vercel.app"
```

### 3. Important Notes
- Make sure to set the environment for **Production** and **Preview**
- After adding variables, redeploy your application
- The `NEXTAUTH_URL` should match your actual Vercel deployment URL

### 4. After Setting Variables
1. Redeploy your application in Vercel
2. Run the database migration: `npm run db:deploy-turso-simple`
3. Test your application

## Troubleshooting

If you still get 500 errors:
1. Check Vercel logs for specific error messages
2. Verify all environment variables are set correctly
3. Make sure the Turso database is accessible
4. Check that the database schema is deployed
