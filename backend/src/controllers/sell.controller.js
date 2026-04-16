const prisma = require('../config/database');
const { generateReferenceId } = require('../utils/helpers');

// POST /api/admin/selling-request — sell USDT for INR via bank
exports.createSellRequest = async (req, res) => {
  try {
    const { bank, amount, paymentMethod } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const normalizedPaymentMethod = paymentMethod === 'CMD' ? 'CMD' : 'IMPS';

    const parsedAmount = parseFloat(amount);

    // Check minimum sell
    const minSellSetting = await prisma.systemSetting.findUnique({
      where: { key: 'min_sell' },
    });
    const minSell = minSellSetting ? parseFloat(minSellSetting.value) : 10;

    if (parsedAmount < minSell) {
      return res.status(400).json({ error: `Minimum sell amount is ${minSell} USDT` });
    }

    // Check balance
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate available balance (total - pending)
    const pendingSells = await prisma.sell.aggregate({
      where: { userId: req.user.id, status: 'PENDING' },
      _sum: { amount: true },
    });
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: { userId: req.user.id, status: 'PENDING' },
      _sum: { amount: true },
    });
    const progressing = (pendingSells._sum.amount || 0) + (pendingWithdrawals._sum.amount || 0);
    const available = user.walletBalance - progressing;

    if (parsedAmount > available) {
      return res.status(400).json({ error: `Insufficient balance. Available: ${available.toFixed(2)} USDT` });
    }

    const referenceId = generateReferenceId('SELL');

    const sell = await prisma.sell.create({
      data: {
        userId: req.user.id,
        amount: parsedAmount,
        bankId: bank?.id ? parseInt(bank.id) : null,
        paymentMethod: normalizedPaymentMethod,
        accountNo: bank?.accountNo || null,
        ifsc: bank?.ifsc || null,
        payeeName: bank?.payeeName || null,
        bankName: bank?.bankName || null,
        referenceId,
        status: 'PENDING',
        network: 'BANK',
      },
    });

    return res.json({ message: 'Selling request submitted successfully', id: sell.id, sell });
  } catch (err) {
    console.error('Create sell request error:', err);
    return res.status(500).json({ error: 'Failed to submit selling request' });
  }
};

// POST /api/sell-usdt — crypto withdrawal
exports.sellUsdt = async (req, res) => {
  try {
    const { amount, walletId } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const parsedAmount = parseFloat(amount);

    // Check minimum withdrawal
    const minWithdrawSetting = await prisma.systemSetting.findUnique({
      where: { key: 'min_withdrawal' },
    });
    const minWithdraw = minWithdrawSetting ? parseFloat(minWithdrawSetting.value) : 50;

    if (parsedAmount < minWithdraw) {
      return res.status(400).json({ error: `Minimum withdrawal is ${minWithdraw} USDT` });
    }

    // Check balance
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const pendingSells = await prisma.sell.aggregate({
      where: { userId: req.user.id, status: 'PENDING' },
      _sum: { amount: true },
    });
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: { userId: req.user.id, status: 'PENDING' },
      _sum: { amount: true },
    });
    const progressing = (pendingSells._sum.amount || 0) + (pendingWithdrawals._sum.amount || 0);
    const available = user.walletBalance - progressing;

    if (parsedAmount > available) {
      return res.status(400).json({ error: `Insufficient balance. Available: ${available.toFixed(2)} USDT` });
    }

    // Get wallet address if walletId provided
    let walletAddress = null;
    let currency = 'USDT';
    let network = 'TRC20';

    if (walletId) {
      const wallet = await prisma.cryptoWallet.findFirst({
        where: { id: parseInt(walletId), userId: req.user.id },
      });
      if (wallet) {
        walletAddress = wallet.address;
        currency = wallet.currency;
        network = wallet.network;
      }
    }

    const referenceId = generateReferenceId('WDR');

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: req.user.id,
        amount: parsedAmount,
        walletAddress,
        walletId: walletId ? parseInt(walletId) : null,
        currency,
        network,
        referenceId,
        status: 'PENDING',
      },
    });

    return res.json({ message: 'Withdrawal request submitted successfully', withdrawal });
  } catch (err) {
    console.error('Sell USDT error:', err);
    return res.status(500).json({ error: 'Failed to submit withdrawal request' });
  }
};
