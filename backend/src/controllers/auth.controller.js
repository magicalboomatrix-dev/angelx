const jwt = require('jsonwebtoken');
const { issueRefreshToken } = require('../utils/refreshToken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateReferralCode } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
const DEV_BYPASS = process.env.ALLOW_DEV_OTP_BYPASS === '"true"' || process.env.ALLOW_DEV_OTP_BYPASS === 'true';

let twilioClient = null;
if (TWILIO_SID && TWILIO_AUTH) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);
  } catch {
    console.warn('Twilio not available');
  }
}

// Generate 4-digit OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function readCookieValue(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((entry) => entry.trim());
  const matchingCookie = cookies.find((entry) => entry.startsWith(`${name}=`));

  if (!matchingCookie) {
    return null;
  }

  return decodeURIComponent(matchingCookie.slice(name.length + 1));
}

async function findValidReferrer(referralCode, currentUserId) {
  if (!referralCode) {
    return null;
  }

  const normalizedReferralCode = String(referralCode).trim();
  if (!normalizedReferralCode) {
    return null;
  }

  const referrer = await prisma.user.findUnique({
    where: { referralCode: normalizedReferralCode },
    select: { id: true, referralCode: true },
  });

  if (!referrer || referrer.id === currentUserId) {
    return null;
  }

  return referrer;
}

async function attachReferralIfEligible(user, referralCode) {
  if (!user || user.referredBy) {
    return user;
  }

  const referrer = await findValidReferrer(referralCode, user.id);
  if (!referrer) {
    return user;
  }

  const [depositCount, withdrawalCount, sellCount] = await prisma.$transaction([
    prisma.deposit.count({ where: { userId: user.id } }),
    prisma.withdrawal.count({ where: { userId: user.id } }),
    prisma.sell.count({ where: { userId: user.id } }),
  ]);

  if (depositCount || withdrawalCount || sellCount || user.walletBalance > 0) {
    return user;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { referredBy: referrer.referralCode },
  });
}

exports.sendOtp = async (req, res) => {
  try {
    const { phone, referralCode } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Ensure user exists (create if not)
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      let referralCode = generateReferralCode();
      // Ensure unique referral code
      while (await prisma.user.findUnique({ where: { referralCode } })) {
        referralCode = generateReferralCode();
      }

      const referrer = await findValidReferrer(req.body.referralCode);
      user = await prisma.user.create({
        data: {
          phone,
          referralCode,
          ...(referrer ? { referredBy: referrer.referralCode } : {}),
        },
      });
    } else if (referralCode) {
      user = await attachReferralIfEligible(user, referralCode);
    }

    // Mark old OTPs as used
    await prisma.otp.updateMany({
      where: { phone, used: false },
      data: { used: true },
    });

    // Create new OTP
    await prisma.otp.create({
      data: { phone, code: otpCode, expiresAt },
    });

    // Send via Twilio or bypass in dev
    if (DEV_BYPASS) {
      console.log(`[DEV] OTP for ${phone}: ${otpCode}`);
    } else if (twilioClient) {
      await twilioClient.messages.create({
        body: `Your AngelX verification code is: ${otpCode}`,
        from: TWILIO_PHONE,
        to: `+91${phone}`,
      });
    }

    return res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, referralCode } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    // Dev bypass: accept "1234" as valid OTP
    if (DEV_BYPASS && otp === '1234') {
      let user = await prisma.user.findUnique({ where: { phone } });
      if (!user) return res.status(400).json({ error: 'User not found' });
      user = await attachReferralIfEligible(user, referralCode);
      const token = jwt.sign({ id: user.id, phone: user.phone, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      issueRefreshToken(res, { id: user.id, phone: user.phone, role: 'user' });
      return res.json({ token, redirectTo: '/home' });
    }

    // Find valid OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone,
        code: otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    user = await attachReferralIfEligible(user, referralCode);

    const token = jwt.sign({ id: user.id, phone: user.phone, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    issueRefreshToken(res, { id: user.id, phone: user.phone, role: 'user' });
    return res.json({ token, redirectTo: '/home' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        phone: true,
        walletBalance: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate progressing amount (pending sells + pending withdrawals)
    const pendingSells = await prisma.sell.aggregate({
      where: { userId: user.id, status: 'PENDING' },
      _sum: { amount: true },
    });
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: { userId: user.id, status: 'PENDING' },
      _sum: { amount: true },
    });

    const progressing = (pendingSells._sum.amount || 0) + (pendingWithdrawals._sum.amount || 0);

    return res.json({
      user: {
        id: user.id,
        phone: user.phone,
        mobile: user.phone,
        referralCode: user.referralCode,
        wallet: {
          total: user.walletBalance,
          available: user.walletBalance - progressing,
          progressing,
        },
      },
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.getReferralRewards = async (req, res) => {
  try {
    const userId = req.user.id;
    const formatDateKey = (date) => {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Calcutta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(date);

      const year = parts.find((part) => part.type === 'year')?.value;
      const month = parts.find((part) => part.type === 'month')?.value;
      const day = parts.find((part) => part.type === 'day')?.value;

      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const startDate = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

    const credits = await prisma.walletHistory.findMany({
      where: {
        userId,
        type: 'CREDIT',
        source: { in: ['REFERRAL', 'REFERRAL_BONUS', 'ADJUSTMENT'] },
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const dailyTotals = new Map();
    credits.forEach((entry) => {
      const dateKey = formatDateKey(entry.createdAt);
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + Number(entry.amount || 0));
    });

    const rewards = [];
    for (let index = 0; index < 30; index += 1) {
      const date = new Date(today.getTime() - index * 24 * 60 * 60 * 1000);
      const dateKey = formatDateKey(date);

      rewards.push({
        date: dateKey,
        amount: Number((dailyTotals.get(dateKey) || 0).toFixed(2)),
      });
    }

    res.set('Cache-Control', 'no-store');
    return res.json({ rewards });
  } catch (err) {
    console.error('Get referral rewards error:', err);
    return res.status(500).json({ error: 'Failed to fetch referral rewards' });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = readCookieValue(req, 'refreshToken');
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    if (!payload || !payload.id) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const token = jwt.sign(
      { id: payload.id, phone: payload.phone, email: payload.email, role: payload.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    issueRefreshToken(res, { id: admin.id, email: admin.email, role: 'admin' });
    return res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};
