const prisma = require('../config/database');

async function logAdminAction(req, action, entityType, entityId, details) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin?.id || 0,
        adminEmail: req.admin?.email || 'unknown',
        action,
        entityType,
        entityId: entityId || null,
        details: details || null,
        ipAddress: req.ip || req.connection?.remoteAddress || null,
      },
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { logAdminAction };
