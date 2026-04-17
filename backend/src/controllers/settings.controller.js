const prisma = require('../config/database');

exports.getLimits = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ['usdt_rate', 'cmd_rate', 'imps_rate', 'min_deposit', 'min_withdrawal', 'min_sell', 'min_cmd', 'min_imps'] },
      },
    });

    const settingsMap = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    return res.json({
      rate: parseFloat(settingsMap.usdt_rate || '102'),
      cmdRate: parseFloat(settingsMap.cmd_rate || settingsMap.usdt_rate || '102'),
      impsRate: parseFloat(settingsMap.imps_rate || settingsMap.usdt_rate || '102'),
      depositMin: parseFloat(settingsMap.min_deposit || '100'),
      withdrawMin: parseFloat(settingsMap.min_withdrawal || '50'),
      sellMin: parseFloat(settingsMap.min_sell || '10'),
      cmdMin: parseFloat(settingsMap.min_cmd || '500'),
      impsMin: parseFloat(settingsMap.min_imps || '100'),
    });
  } catch (err) {
    console.error('Get limits error:', err);
    return res.status(500).json({ error: 'Failed to fetch limits' });
  }
};
