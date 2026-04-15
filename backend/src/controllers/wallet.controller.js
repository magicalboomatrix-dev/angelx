const prisma = require('../config/database');

exports.getWallet = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { walletBalance: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate progressing (pending sells + withdrawals)
    const pendingSells = await prisma.sell.aggregate({
      where: { userId: req.user.id, status: 'PENDING' },
      _sum: { amount: true },
    });
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: { userId: req.user.id, status: 'PENDING' },
      _sum: { amount: true },
    });

    const progressing = (pendingSells._sum.amount || 0) + (pendingWithdrawals._sum.amount || 0);
    const available = Math.max(0, user.walletBalance - progressing);

    return res.json({
      usdtAvailable: available,
      payzAvailable: 0,
      total: user.walletBalance,
      progressing,
    });
  } catch (err) {
    console.error('Get wallet error:', err);
    return res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};

exports.getCryptoWallets = async (req, res) => {
  try {
    const wallets = await prisma.cryptoWallet.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ wallets });
  } catch (err) {
    console.error('Get crypto wallets error:', err);
    return res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

exports.addCryptoWallet = async (req, res) => {
  try {
    const { address, network, currency } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate TRC20 address
    if ((network === 'TRC20' || !network) && !/^T[A-Za-z0-9]{33}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid TRC20 address format' });
    }

    const wallet = await prisma.cryptoWallet.create({
      data: {
        userId: req.user.id,
        address,
        network: network || 'TRC20',
        currency: currency || 'USDT',
      },
    });

    return res.json({ message: 'Wallet added successfully', wallet });
  } catch (err) {
    console.error('Add crypto wallet error:', err);
    return res.status(500).json({ error: 'Failed to add wallet' });
  }
};

exports.deleteCryptoWallet = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const wallet = await prisma.cryptoWallet.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    await prisma.cryptoWallet.delete({ where: { id } });

    return res.json({ message: 'Wallet deleted successfully' });
  } catch (err) {
    console.error('Delete crypto wallet error:', err);
    return res.status(500).json({ error: 'Failed to delete wallet' });
  }
};
