const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateReferralCode } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET;
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

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

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
      user = await prisma.user.create({
        data: { phone, referralCode },
      });
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
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    // Dev bypass: accept "1234" as valid OTP
    if (DEV_BYPASS && otp === '1234') {
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) return res.status(400).json({ error: 'User not found' });

      const token = jwt.sign({ id: user.id, phone: user.phone, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
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

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const token = jwt.sign({ id: user.id, phone: user.phone, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
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

    return res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};
