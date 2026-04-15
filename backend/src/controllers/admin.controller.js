const prisma = require('../config/database');
const { logAdminAction } = require('../utils/auditLog');

// Helper: build date/amount where clause
function buildFilters(query) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const to = new Date(query.dateTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }
  if (query.amountMin || query.amountMax) {
    where.amount = {};
    if (query.amountMin) where.amount.gte = parseFloat(query.amountMin);
    if (query.amountMax) where.amount.lte = parseFloat(query.amountMax);
  }
  if (query.search) {
    where.user = {
      phone: { contains: query.search, mode: 'insensitive' },
    };
  }
  return where;
}

// Helper: build orderBy from query
function buildOrderBy(query, defaultField = 'createdAt') {
  const sortBy = query.sortBy || defaultField;
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  return { [sortBy]: sortOrder };
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function applyWalletChange(tx, { userId, amount, type, source, remarks, referenceId, admin, enforceNonNegative = false }) {
  const numericAmount = Number.parseFloat(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw createHttpError(400, 'Valid amount is required');
  }

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, walletBalance: true },
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const normalizedType = type === 'DEBIT' ? 'DEBIT' : 'CREDIT';
  const balanceBefore = Number(user.walletBalance || 0);
  const balanceAfter = normalizedType === 'DEBIT'
    ? balanceBefore - numericAmount
    : balanceBefore + numericAmount;

  if (enforceNonNegative && balanceAfter < 0) {
    throw createHttpError(400, 'Insufficient wallet balance');
  }

  await tx.user.update({
    where: { id: userId },
    data: { walletBalance: balanceAfter },
  });

  await tx.walletHistory.create({
    data: {
      userId,
      type: normalizedType,
      source,
      amount: numericAmount,
      balanceBefore,
      balanceAfter,
      remarks: remarks || null,
      referenceId: referenceId || null,
      adminId: admin?.id || null,
      adminEmail: admin?.email || null,
    },
  });

  return { amount: numericAmount, balanceBefore, balanceAfter };
}

// Dashboard Stats
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDeposits,
      pendingDeposits,
      approvedDeposits,
      totalWithdrawals,
      pendingWithdrawals,
      totalSells,
      pendingSells,
      totalReferrals,
      depositSum,
      withdrawalSum,
      sellSum,
      referralRewardSum,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.count(),
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      prisma.deposit.count({ where: { status: 'APPROVED' } }),
      prisma.withdrawal.count(),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.sell.count(),
      prisma.sell.count({ where: { status: 'PENDING' } }),
      prisma.referral.count(),
      prisma.deposit.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.withdrawal.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.sell.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.referral.aggregate({ _sum: { rewardAmount: true } }),
    ]);

    return res.json({
      totalUsers,
      totalDeposits,
      pendingDeposits,
      approvedDeposits,
      totalWithdrawals,
      pendingWithdrawals,
      totalSells,
      pendingSells,
      totalReferrals,
      totalDepositAmount: depositSum._sum.amount || 0,
      totalWithdrawalAmount: withdrawalSum._sum.amount || 0,
      totalSellAmount: sellSum._sum.amount || 0,
      totalReferralRewards: referralRewardSum._sum.rewardAmount || 0,
    });
  } catch (err) {
    console.error('Get stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Chart Data — daily aggregation for last 30 days
exports.getChartData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [deposits, withdrawals, sells, users] = await Promise.all([
      prisma.deposit.findMany({
        where: { createdAt: { gte: startDate }, status: 'APPROVED' },
        select: { amount: true, createdAt: true },
      }),
      prisma.withdrawal.findMany({
        where: { createdAt: { gte: startDate }, status: 'APPROVED' },
        select: { amount: true, createdAt: true },
      }),
      prisma.sell.findMany({
        where: { createdAt: { gte: startDate }, status: 'APPROVED' },
        select: { amount: true, createdAt: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    // Group by date
    const dailyMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { date: key, deposits: 0, withdrawals: 0, sells: 0, users: 0 };
    }

    deposits.forEach((d) => {
      const key = d.createdAt.toISOString().split('T')[0];
      if (dailyMap[key]) dailyMap[key].deposits += d.amount;
    });
    withdrawals.forEach((w) => {
      const key = w.createdAt.toISOString().split('T')[0];
      if (dailyMap[key]) dailyMap[key].withdrawals += w.amount;
    });
    sells.forEach((s) => {
      const key = s.createdAt.toISOString().split('T')[0];
      if (dailyMap[key]) dailyMap[key].sells += s.amount;
    });
    users.forEach((u) => {
      const key = u.createdAt.toISOString().split('T')[0];
      if (dailyMap[key]) dailyMap[key].users += 1;
    });

    return res.json({ chartData: Object.values(dailyMap) });
  } catch (err) {
    console.error('Get chart data error:', err);
    return res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};

// Users
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const orderBy = buildOrderBy(req.query);

    const where = {};
    if (req.query.search) {
      where.phone = { contains: req.query.search, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          phone: true,
          walletBalance: true,
          referralCode: true,
          referredBy: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({ users, total, page, limit });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        deposits: { orderBy: { createdAt: 'desc' } },
        sells: { orderBy: { createdAt: 'desc' } },
        withdrawals: { orderBy: { createdAt: 'desc' } },
        bankCards: { orderBy: { createdAt: 'desc' } },
        cryptoWallets: { orderBy: { createdAt: 'desc' } },
        walletHistories: { orderBy: { createdAt: 'desc' } },
        referralsGiven: {
          orderBy: { createdAt: 'desc' },
          include: {
            referredUser: { select: { phone: true } },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const walletHistoryKeys = new Set(
      user.walletHistories.map((entry) => `${entry.source}:${entry.referenceId || ''}`)
    );

    const legacyWalletHistory = [
      ...user.deposits
        .filter((deposit) => deposit.status === 'APPROVED' && !walletHistoryKeys.has(`DEPOSIT:${deposit.referenceId}`))
        .map((deposit) => ({
          id: `legacy-deposit-${deposit.id}`,
          type: 'CREDIT',
          source: 'DEPOSIT',
          amount: deposit.amount,
          balanceBefore: null,
          balanceAfter: null,
          remarks: deposit.adminRemark || 'Deposit approved',
          referenceId: deposit.referenceId,
          adminId: null,
          adminEmail: null,
          createdAt: deposit.reviewedAt || deposit.updatedAt || deposit.createdAt,
        })),
      ...user.sells
        .filter((sell) => sell.status === 'APPROVED' && !walletHistoryKeys.has(`SELL:${sell.referenceId}`))
        .map((sell) => ({
          id: `legacy-sell-${sell.id}`,
          type: 'DEBIT',
          source: 'SELL',
          amount: sell.amount,
          balanceBefore: null,
          balanceAfter: null,
          remarks: sell.adminRemark || 'Sell request approved',
          referenceId: sell.referenceId,
          adminId: null,
          adminEmail: null,
          createdAt: sell.reviewedAt || sell.updatedAt || sell.createdAt,
        })),
      ...user.withdrawals
        .filter((withdrawal) => withdrawal.status === 'APPROVED' && !walletHistoryKeys.has(`WITHDRAWAL:${withdrawal.referenceId}`))
        .map((withdrawal) => ({
          id: `legacy-withdrawal-${withdrawal.id}`,
          type: 'DEBIT',
          source: 'WITHDRAWAL',
          amount: withdrawal.amount,
          balanceBefore: null,
          balanceAfter: null,
          remarks: withdrawal.adminRemark || 'Withdrawal approved',
          referenceId: withdrawal.referenceId,
          adminId: null,
          adminEmail: null,
          createdAt: withdrawal.reviewedAt || withdrawal.updatedAt || withdrawal.createdAt,
        })),
      ...user.referralsGiven
        .filter((referral) => !walletHistoryKeys.has(`REFERRAL:REF-${referral.id}`))
        .map((referral) => ({
          id: `legacy-referral-${referral.id}`,
          type: 'CREDIT',
          source: 'REFERRAL',
          amount: referral.rewardAmount,
          balanceBefore: null,
          balanceAfter: null,
          remarks: `Referral reward for ${referral.referredUser?.phone || 'user'}`,
          referenceId: `REF-${referral.id}`,
          adminId: null,
          adminEmail: null,
          createdAt: referral.createdAt,
        })),
    ].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    // Remove password from response
    const { password, referralsGiven, ...userData } = user;
    userData.walletHistories = [...user.walletHistories, ...legacyWalletHistory]
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    return res.json({ user: userData });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Deposits
exports.getDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const where = buildFilters(req.query);
    const orderBy = buildOrderBy(req.query);

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, phone: true } },
        },
      }),
      prisma.deposit.count({ where }),
    ]);

    return res.json({ deposits, total, page, limit });
  } catch (err) {
    console.error('Get deposits error:', err);
    return res.status(500).json({ error: 'Failed to fetch deposits' });
  }
};

exports.getDepositById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: { user: { select: { id: true, phone: true } } },
    });
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
    return res.json({ deposit });
  } catch (err) {
    console.error('Get deposit error:', err);
    return res.status(500).json({ error: 'Failed to fetch deposit' });
  }
};

exports.approveDeposit = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { remark } = req.body;

    const deposit = await prisma.deposit.findUnique({ where: { id } });
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
    if (deposit.status !== 'PENDING') {
      return res.status(400).json({ error: 'Deposit already processed' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.deposit.update({
        where: { id },
        data: {
          status: 'APPROVED',
          adminRemark: remark || 'Approved',
          reviewedAt: new Date(),
        },
      });

      await applyWalletChange(tx, {
        userId: deposit.userId,
        amount: deposit.amount,
        type: 'CREDIT',
        source: 'DEPOSIT',
        remarks: remark || 'Deposit approved',
        referenceId: deposit.referenceId,
        admin: req.admin,
      });
    });

    // Handle referral reward
    const user = await prisma.user.findUnique({ where: { id: deposit.userId } });
    if (user?.referredBy) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: user.referredBy } });
      if (referrer) {
        const rewardSetting = await prisma.systemSetting.findUnique({
          where: { key: 'referral_reward_amount' },
        });
        const rewardAmount = rewardSetting ? parseFloat(rewardSetting.value) : 5;

        // Check if referral reward already given for this pair
        const existingReferral = await prisma.referral.findFirst({
          where: { referrerId: referrer.id, referredUserId: user.id },
        });

        if (!existingReferral) {
          await prisma.$transaction(async (tx) => {
            const referral = await tx.referral.create({
              data: {
                referrerId: referrer.id,
                referredUserId: user.id,
                rewardAmount,
              },
            });

            await applyWalletChange(tx, {
              userId: referrer.id,
              amount: rewardAmount,
              type: 'CREDIT',
              source: 'REFERRAL',
              remarks: `Referral reward for ${user.phone}`,
              referenceId: `REF-${referral.id}`,
              admin: req.admin,
            });
          });
        }
      }
    }

    await logAdminAction(req, 'APPROVE_DEPOSIT', 'deposit', id, `Amount: ${deposit.amount}`);
    return res.json({ message: 'Deposit approved successfully' });
  } catch (err) {
    console.error('Approve deposit error:', err);
    return res.status(500).json({ error: 'Failed to approve deposit' });
  }
};

exports.rejectDeposit = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { remark } = req.body;

    if (!remark) {
      return res.status(400).json({ error: 'Remark is required for rejection' });
    }

    const deposit = await prisma.deposit.findUnique({ where: { id } });
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
    if (deposit.status !== 'PENDING') {
      return res.status(400).json({ error: 'Deposit already processed' });
    }

    await prisma.deposit.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminRemark: remark,
        reviewedAt: new Date(),
      },
    });

    await logAdminAction(req, 'REJECT_DEPOSIT', 'deposit', id, `Amount: ${deposit.amount}, Remark: ${remark}`);
    return res.json({ message: 'Deposit rejected' });
  } catch (err) {
    console.error('Reject deposit error:', err);
    return res.status(500).json({ error: 'Failed to reject deposit' });
  }
};

// Sells
exports.getSells = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const where = buildFilters(req.query);
    const orderBy = buildOrderBy(req.query);

    const [sells, total] = await Promise.all([
      prisma.sell.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, phone: true } },
        },
      }),
      prisma.sell.count({ where }),
    ]);

    return res.json({ sells, total, page, limit });
  } catch (err) {
    console.error('Get sells error:', err);
    return res.status(500).json({ error: 'Failed to fetch sells' });
  }
};

exports.getSellById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sell = await prisma.sell.findUnique({
      where: { id },
      include: { user: { select: { id: true, phone: true } } },
    });
    if (!sell) return res.status(404).json({ error: 'Sell request not found' });
    return res.json({ sell });
  } catch (err) {
    console.error('Get sell error:', err);
    return res.status(500).json({ error: 'Failed to fetch sell' });
  }
};

exports.approveSell = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { remark } = req.body;

    const sell = await prisma.sell.findUnique({ where: { id } });
    if (!sell) return res.status(404).json({ error: 'Sell request not found' });
    if (sell.status !== 'PENDING') {
      return res.status(400).json({ error: 'Sell request already processed' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.sell.update({
        where: { id },
        data: {
          status: 'APPROVED',
          adminRemark: remark || 'Approved',
          reviewedAt: new Date(),
        },
      });

      await applyWalletChange(tx, {
        userId: sell.userId,
        amount: sell.amount,
        type: 'DEBIT',
        source: 'SELL',
        remarks: remark || 'Sell request approved',
        referenceId: sell.referenceId,
        admin: req.admin,
      });
    });

    await logAdminAction(req, 'APPROVE_SELL', 'sell', id, `Amount: ${sell.amount}`);
    return res.json({ message: 'Sell request approved' });
  } catch (err) {
    console.error('Approve sell error:', err);
    return res.status(500).json({ error: 'Failed to approve sell' });
  }
};

exports.rejectSell = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { remark } = req.body;

    if (!remark) {
      return res.status(400).json({ error: 'Remark is required for rejection' });
    }

    const sell = await prisma.sell.findUnique({ where: { id } });
    if (!sell) return res.status(404).json({ error: 'Sell request not found' });
    if (sell.status !== 'PENDING') {
      return res.status(400).json({ error: 'Sell request already processed' });
    }

    await prisma.sell.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminRemark: remark,
        reviewedAt: new Date(),
      },
    });

    await logAdminAction(req, 'REJECT_SELL', 'sell', id, `Amount: ${sell.amount}, Remark: ${remark}`);
    return res.json({ message: 'Sell request rejected' });
  } catch (err) {
    console.error('Reject sell error:', err);
    return res.status(500).json({ error: 'Failed to reject sell' });
  }
};

// Withdrawals
exports.getWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const where = buildFilters(req.query);
    const orderBy = buildOrderBy(req.query);

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, phone: true } },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return res.json({ withdrawals, total, page, limit });
  } catch (err) {
    console.error('Get withdrawals error:', err);
    return res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
};

exports.getWithdrawalById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: { user: { select: { id: true, phone: true } } },
    });
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    return res.json({ withdrawal });
  } catch (err) {
    console.error('Get withdrawal error:', err);
    return res.status(500).json({ error: 'Failed to fetch withdrawal' });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { remark } = req.body;

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id },
        data: {
          status: 'APPROVED',
          adminRemark: remark || 'Approved',
          reviewedAt: new Date(),
        },
      });

      await applyWalletChange(tx, {
        userId: withdrawal.userId,
        amount: withdrawal.amount,
        type: 'DEBIT',
        source: 'WITHDRAWAL',
        remarks: remark || 'Withdrawal approved',
        referenceId: withdrawal.referenceId,
        admin: req.admin,
      });
    });

    await logAdminAction(req, 'APPROVE_WITHDRAWAL', 'withdrawal', id, `Amount: ${withdrawal.amount}`);
    return res.json({ message: 'Withdrawal approved' });
  } catch (err) {
    console.error('Approve withdrawal error:', err);
    return res.status(500).json({ error: 'Failed to approve withdrawal' });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { remark } = req.body;

    if (!remark) {
      return res.status(400).json({ error: 'Remark is required for rejection' });
    }

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    await prisma.withdrawal.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminRemark: remark,
        reviewedAt: new Date(),
      },
    });

    await logAdminAction(req, 'REJECT_WITHDRAWAL', 'withdrawal', id, `Amount: ${withdrawal.amount}, Remark: ${remark}`);
    return res.json({ message: 'Withdrawal rejected' });
  } catch (err) {
    console.error('Reject withdrawal error:', err);
    return res.status(500).json({ error: 'Failed to reject withdrawal' });
  }
};

exports.adjustUserWallet = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const normalizedType = String(req.body.type || '').toUpperCase();
    const remarks = String(req.body.remarks || '').trim();

    if (!['CREDIT', 'DEBIT'].includes(normalizedType)) {
      return res.status(400).json({ error: 'Type must be CREDIT or DEBIT' });
    }

    if (!remarks) {
      return res.status(400).json({ error: 'Remarks are required' });
    }

    const result = await prisma.$transaction(async (tx) =>
      applyWalletChange(tx, {
        userId: id,
        amount: req.body.amount,
        type: normalizedType,
        source: 'ADJUSTMENT',
        remarks,
        admin: req.admin,
        enforceNonNegative: normalizedType === 'DEBIT',
      })
    );

    await logAdminAction(
      req,
      'ADJUST_USER_WALLET',
      'user',
      id,
      `Type: ${normalizedType}, Amount: ${result.amount}, Balance: ${result.balanceBefore} -> ${result.balanceAfter}, Remarks: ${remarks}`
    );

    return res.json({
      message: `Wallet ${normalizedType === 'CREDIT' ? 'credited' : 'debited'} successfully`,
      walletBalance: result.balanceAfter,
    });
  } catch (err) {
    console.error('Adjust user wallet error:', err);
    return res.status(err.statusCode || 500).json({ error: err.message || 'Failed to adjust wallet' });
  }
};

// Referrals
exports.getReferrals = async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        referrer: { select: { id: true, phone: true } },
        referredUser: { select: { id: true, phone: true } },
      },
    });

    return res.json({ referrals });
  } catch (err) {
    console.error('Get referrals error:', err);
    return res.status(500).json({ error: 'Failed to fetch referrals' });
  }
};

// Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });
    return res.json({ settings: settingsMap });
  } catch (err) {
    console.error('Get settings error:', err);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await prisma.$transaction(updates);
await logAdminAction(req, 'UPDATE_SETTINGS', 'settings', null, `Keys: ${Object.keys(settings).join(', ')}`);
    
    return res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.action) where.action = req.query.action;
    if (req.query.entityType) where.entityType = req.query.entityType;
    if (req.query.dateFrom || req.query.dateTo) {
      where.createdAt = {};
      if (req.query.dateFrom) where.createdAt.gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) {
        const to = new Date(req.query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return res.json({ logs, total, page, limit });
  } catch (err) {
    console.error('Get audit logs error:', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
