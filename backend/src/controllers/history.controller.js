const prisma = require('../config/database');

exports.getAllHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all transaction types
    const [deposits, sells, withdrawals] = await Promise.all([
      prisma.deposit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sell.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Get rate
    const rateSetting = await prisma.systemSetting.findUnique({
      where: { key: 'usdt_rate' },
    });
    const rate = rateSetting ? parseFloat(rateSetting.value) : 102;

    // Map to unified format
    const history = [
      ...deposits.map((d) => ({
        id: d.id,
        type: 'DEPOSIT',
        amount: d.amount,
        rate,
        status: d.status === 'APPROVED' ? 'SUCCESS' : d.status === 'REJECTED' ? 'FAILED' : d.status,
        currency: 'USDT',
        network: d.network,
        referenceId: d.referenceId,
        createdAt: d.createdAt,
        reviewedAt: d.reviewedAt,
        address: '',
        adminRemark: d.adminRemark,
      })),
      ...sells.map((s) => ({
        id: s.id,
        type: 'SELL',
        amount: s.amount,
        rate,
        status: s.status === 'APPROVED' ? 'SUCCESS' : s.status === 'REJECTED' ? 'FAILED' : s.status,
        paymentMethod: s.paymentMethod,
        network: s.network || 'BANK',
        referenceId: s.referenceId,
        createdAt: s.createdAt,
        reviewedAt: s.reviewedAt,
        address: s.accountNo || '',
        accountNo: s.accountNo || '',
        ifsc: s.ifsc || '',
        payeeName: s.payeeName || '',
        bankName: s.bankName || '',
        adminRemark: s.adminRemark,
      })),
      ...withdrawals.map((w) => ({
        id: w.id,
        type: 'WITHDRAW',
        amount: w.amount,
        rate,
        status: w.status === 'APPROVED' ? 'SUCCESS' : w.status === 'REJECTED' ? 'FAILED' : w.status,
        currency: w.currency,
        network: w.network,
        referenceId: w.referenceId,
        createdAt: w.createdAt,
        reviewedAt: w.reviewedAt,
        address: w.walletAddress || '',
        adminRemark: w.adminRemark,
      })),
    ];

    // Sort by createdAt desc
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ history });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
};

exports.getStatements = async (req, res) => {
  try {
    const userId = req.user.id;

    const [deposits, sells, withdrawals] = await Promise.all([
      prisma.deposit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sell.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const statements = [
      ...deposits.map((d) => ({
        id: d.id,
        type: 'DEPOSIT',
        amount: d.amount,
        currency: 'USDT',
        status: d.status === 'APPROVED' ? 'SUCCESS' : d.status === 'REJECTED' ? 'FAILED' : d.status,
        createdAt: d.createdAt,
        referenceId: d.referenceId,
      })),
      ...sells.map((s) => ({
        id: s.id,
        type: 'SELL',
        amount: s.amount,
        paymentMethod: s.paymentMethod,
        status: s.status === 'APPROVED' ? 'SUCCESS' : s.status === 'REJECTED' ? 'FAILED' : s.status,
        createdAt: s.createdAt,
        referenceId: s.referenceId,
      })),
      ...withdrawals.map((w) => ({
        id: w.id,
        type: 'WITHDRAW',
        amount: w.amount,
        currency: w.currency,
        status: w.status === 'APPROVED' ? 'SUCCESS' : w.status === 'REJECTED' ? 'FAILED' : w.status,
        createdAt: w.createdAt,
        referenceId: w.referenceId,
      })),
    ];

    statements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ statements });
  } catch (err) {
    console.error('Get statements error:', err);
    return res.status(500).json({ error: 'Failed to fetch statements' });
  }
};
