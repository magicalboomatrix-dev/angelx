const prisma = require('../config/database');

exports.getBankCards = async (req, res) => {
  try {
    const banks = await prisma.bankCard.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.json({ banks });
  } catch (err) {
    console.error('Get bank cards error:', err);
    return res.status(500).json({ error: 'Failed to fetch bank cards' });
  }
};

exports.addBankCard = async (req, res) => {
  try {
    const { accountNo, ifsc, payeeName, bankName } = req.body;

    if (!accountNo || !ifsc || !payeeName) {
      return res.status(400).json({ error: 'Account number, IFSC/SWIFT and payee name are required' });
    }

    const bank = await prisma.bankCard.create({
      data: {
        userId: req.user.id,
        accountNo,
        ifsc: ifsc.toUpperCase(),
        payeeName,
        bankName: bankName || '',
      },
    });

    return res.json({ message: 'Bank card added successfully', bank });
  } catch (err) {
    console.error('Add bank card error:', err);
    return res.status(500).json({ error: 'Failed to add bank card' });
  }
};

exports.deleteBankCard = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Bank card ID is required' });
    }

    const bank = await prisma.bankCard.findFirst({
      where: { id: parseInt(id), userId: req.user.id },
    });

    if (!bank) {
      return res.status(404).json({ error: 'Bank card not found' });
    }

    await prisma.bankCard.delete({ where: { id: parseInt(id) } });

    return res.json({ message: 'Bank card deleted successfully' });
  } catch (err) {
    console.error('Delete bank card error:', err);
    return res.status(500).json({ error: 'Failed to delete bank card' });
  }
};

exports.selectBank = async (req, res) => {
  try {
    const { bankId } = req.body;
    const userId = req.user?.id;

    if (!userId || !bankId) {
      return res.status(400).json({ error: 'Bank ID is required' });
    }

    const uid = parseInt(userId);
    const bid = parseInt(bankId);

    const bank = await prisma.bankCard.findFirst({
      where: { id: bid, userId: uid },
    });

    if (!bank) {
      return res.status(404).json({ error: 'Bank card not found' });
    }

    // Deselect all banks for this user
    await prisma.bankCard.updateMany({
      where: { userId: uid },
      data: { isSelected: false },
    });

    // Select the specified bank
    await prisma.bankCard.update({
      where: { id: bid },
      data: { isSelected: true },
    });

    return res.json({ message: 'Bank selected successfully' });
  } catch (err) {
    console.error('Select bank error:', err);
    return res.status(500).json({ error: 'Failed to select bank' });
  }
};
