const prisma = require('../config/database');

exports.getLimits = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ['usdt_rate', 'min_deposit', 'min_withdrawal', 'min_sell'] },
      },
    });

    const settingsMap = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    return res.json({
      rate: parseFloat(settingsMap.usdt_rate || '102'),
      depositMin: parseFloat(settingsMap.min_deposit || '100'),
      withdrawMin: parseFloat(settingsMap.min_withdrawal || '50'),
      sellMin: parseFloat(settingsMap.min_sell || '10'),
    });
  } catch (err) {
    console.error('Get limits error:', err);
    return res.status(500).json({ error: 'Failed to fetch limits' });
  }
};
