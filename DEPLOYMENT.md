# Vercel Deployment Instructions

## Prerequisites
1. A PostgreSQL database (recommended: Vercel Postgres, Neon, or Supabase)
2. A Vercel account

## Step-by-Step Deployment

### 1. Set up your database
- Create a PostgreSQL database on your preferred provider
- Copy the connection string (DATABASE_URL)

### 2. Configure Environment Variables in Vercel
Go to your Vercel project settings and add these environment variables:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A strong random string (min 32 characters)
- `EMAIL_USER`: Your email for sending OTPs (optional)
- `EMAIL_PASS`: Your email app password (optional)

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Using Git Integration
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on push

### 4. Run Database Migrations (if not done automatically)

If the build process doesn't automatically run migrations, you can run them manually:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migrations in production
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

### 5. Verify Deployment

Visit your deployment URL and check:
- [ ] `/api/limits` returns data (not 500 error)
- [ ] Settings are properly initialized
- [ ] App loads without React errors

## Troubleshooting

### "500 Internal Server Error" on /api/limits
This usually means the database is not properly seeded. Run:
```bash
vercel env pull .env.production
node prisma/seed.js
```

### "Minified React error #130"
This error occurs when trying to render objects as React children. The code fixes have been applied, but make sure you redeploy after the latest changes.

### Database connection issues
- Verify DATABASE_URL is correct in Vercel environment variables
- Check if your database allows connections from Vercel's IP ranges
- Ensure the connection string includes SSL parameters if required

## Build Configuration

The project is configured to automatically:
1. Generate Prisma Client
2. Run database migrations
3. Seed the database with default settings
4. Build the Next.js application

This is handled in `package.json`:
```json
"vercel-build": "prisma generate && prisma migrate deploy && prisma db seed && next build"
```

## Post-Deployment

After successful deployment:
1. Test all API endpoints
2. Verify the Settings table has default values
3. Test user registration and login flows
4. Check deposit and withdrawal functionalities
