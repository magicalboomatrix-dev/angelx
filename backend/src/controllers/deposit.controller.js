const prisma = require('../config/database');
const { generateReferenceId } = require('../utils/helpers');

exports.createDeposit = async (req, res) => {
  try {
    const { amount, network, txHash, txid, depositId } = req.body;
    const finalTxHash = txHash || txid;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const parsedAmount = parseFloat(amount);

    // Check minimum deposit
    const minDepositSetting = await prisma.systemSetting.findUnique({
      where: { key: 'min_deposit' },
    });
    const minDeposit = minDepositSetting ? parseFloat(minDepositSetting.value) : 100;

    if (parsedAmount < minDeposit) {
      return res.status(400).json({ error: `Minimum deposit is ${minDeposit} USDT` });
    }

    const referenceId = generateReferenceId('DEP');

    const deposit = await prisma.deposit.create({
      data: {
        userId: req.user.id,
        amount: parsedAmount,
        network: network || 'TRC20',
        txHash: finalTxHash || null,
        depositId: depositId || null,
        referenceId,
        status: 'PENDING',
      },
    });

    return res.json({ message: 'Deposit submitted successfully', deposit });
  } catch (err) {
    console.error('Create deposit error:', err);
    return res.status(500).json({ error: 'Failed to submit deposit' });
  }
};

exports.getDepositHistory = async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        network: true,
        status: true,
        txHash: true,
        referenceId: true,
        adminRemark: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    return res.json({
      history: deposits.map((deposit) => ({
        ...deposit,
        currency: 'USDT',
      })),
    });
  } catch (err) {
    console.error('Get deposit history error:', err);
    return res.status(500).json({ error: 'Failed to fetch deposit history' });
  }
};

exports.getDepositInfo = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['trc20_wallet_address', 'trc20_qr_url', 'bep20_wallet_address', 'bep20_qr_url'],
        },
      },
    });

    const settingsMap = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    return res.json({
      TRC20: {
        address: settingsMap.trc20_wallet_address || 'TG25WAjnbAjdqCZrBtrAinU8EsQ6smu47L',
        qrUrl: settingsMap.trc20_qr_url || '/images/trc20.png',
      },
      BEP20: {
        address: settingsMap.bep20_wallet_address || '0xd7d565e4f58d832c07f0bf1d04290dff4104247a',
        qrUrl: settingsMap.bep20_qr_url || '/images/bep20.jpg',
      },
    });
  } catch (err) {
    console.error('Get deposit info error:', err);
    return res.status(500).json({ error: 'Failed to fetch deposit info' });
  }
};
