const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;

// Issue refresh token as httpOnly cookie
exports.issueRefreshToken = (res, user) => {
  const refreshToken = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    REFRESH_SECRET,
    { expiresIn: '30d' }
  );
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

// Add to login/verifyOtp endpoints:
//   issueRefreshToken(res, user)
