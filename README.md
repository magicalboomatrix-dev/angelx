# AngelX - USDT Exchange Platform

A modern, full-stack cryptocurrency exchange platform built with Next.js 15, Prisma, and PostgreSQL.

## Features

### User Features
- ✅ Email OTP authentication
- ✅ Profile management
- ✅ Bank card binding
- ✅ USDT deposit (TRC20/ERC20)
- ✅ USDT withdrawal/selling
- ✅ Transaction history
- ✅ Wallet management
- ✅ Referral system
- ✅ Account statements

### Admin Features
- ✅ Secure admin dashboard
- ✅ User management
- ✅ Deposit approval system
- ✅ Withdrawal request management
- ✅ Transaction monitoring
- ✅ Platform settings configuration
- ✅ Wallet adjustments
- ✅ Real-time statistics

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens, HTTP-only cookies (admin)
- **Email**: Nodemailer
- **Styling**: CSS Modules

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Gmail account for email OTP (or other SMTP service)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd angelx
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/angelx?schema=public"

# JWT Secret (change this to a secure random string)
JWT_SECRET="your-secret-key-change-this-in-production-2026-angelx-super-secure"

# Email Configuration (Gmail)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular password) in EMAIL_PASS

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (creates admin user and default settings)
npm run seed
```

### 5. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Default Credentials

### Admin Login
- URL: http://localhost:3000/admin/login
- Email: admin@angelxsuper.com
- Password: Admin@123

### User Login
- Users can register by entering their email
- An OTP will be sent to their email for verification

## Database Schema

The application uses the following main models:

- **User**: User accounts with email-based authentication
- **BankCard**: User bank cards for withdrawals
- **Wallet**: User USDT wallet balances
- **Transaction**: Deposit/withdrawal transactions
- **Admin**: Admin accounts with password authentication
- **Settings**: Platform-wide settings (rates, limits, addresses)

## API Routes

### User APIs
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user
- `POST /api/update-profile` - Update user profile
- `GET /api/wallet` - Get wallet balance
- `POST /api/bank-card` - Add bank card
- `GET /api/bank-card` - Get user's bank cards
- `DELETE /api/bank-card` - Delete bank card
- `POST /api/select-bank` - Select default bank
- `POST /api/admin/deposit` - Submit deposit request
- `POST /api/admin/selling-request` - Submit withdrawal request
- `GET /api/history` - Get transaction history
- `GET /api/statements` - Get account statements
- `GET /api/settings` - Get platform settings
- `GET /api/deposit-info` - Get deposit addresses

### Admin APIs
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check-session` - Check admin session
- `GET /api/admin/me` - Get admin info
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/adjust-wallet` - Adjust user wallet
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/pending-deposits` - Get pending deposits
- `POST /api/admin/confirm-deposit` - Confirm deposit
- `POST /api/admin/reject-deposit` - Reject deposit
- `GET /api/admin/pending-selling-requests` - Get pending withdrawals
- `POST /api/admin/confirm-selling-request` - Confirm withdrawal
- `POST /api/admin/reject-selling-request` - Reject withdrawal
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin password

## Project Structure

```
angelx/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.js            # Database seeder
│   └── migrations/        # Migration files
├── public/
│   ├── images/            # Static images
│   └── css/               # Global styles
├── src/
│   └── app/
│       ├── lib/           # Utility functions
│       │   ├── prisma.js  # Prisma client
│       │   ├── auth.js    # User auth helpers
│       │   ├── adminAuth.js # Admin auth helpers
│       │   └── mailer.js  # Email service
│       ├── api/           # API routes
│       │   ├── auth/      # User authentication
│       │   ├── admin/     # Admin APIs
│       │   └── ...        # Other APIs
│       ├── admin/         # Admin dashboard pages
│       ├── home/          # User home page
│       ├── login/         # Login pages
│       └── ...            # Other user pages
├── .env                   # Environment variables
├── package.json
└── next.config.mjs
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma generate     # Generate Prisma Client
npx prisma migrate dev  # Create and apply migrations
npx prisma studio       # Open Prisma Studio (DB GUI)
npm run seed           # Seed the database

# Linting
npm run lint           # Run Next.js linter
```

## Troubleshooting

### Email OTP not sending
- Verify EMAIL_USER and EMAIL_PASS in .env
- For Gmail, ensure you're using an App Password, not your regular password
- Check that 2FA is enabled on your Gmail account

### Database connection errors
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check database credentials and database name

### Prisma errors
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations
- Try `npx prisma migrate reset` to reset the database (⚠️ deletes all data)

## Production Deployment

### Environment Variables
Update these for production:
- Change JWT_SECRET to a strong random string
- Update DATABASE_URL to production database
- Configure production email service
- Set NODE_ENV="production"

### Build and Deploy

```bash
npm run build
npm run start
```

Or deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## Security Notes

- Always use HTTPS in production
- Keep JWT_SECRET secure and random
- Use environment variables for sensitive data
- Enable CORS protection
- Implement rate limiting for APIs
- Regular security audits

## License

Private/Proprietary

## Support

For issues and questions, please contact the development team.

