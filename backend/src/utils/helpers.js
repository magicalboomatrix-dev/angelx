const { v4: uuidv4 } = require('uuid');

// Generate a unique reference ID for transactions
function generateReferenceId(prefix = 'TXN') {
  const id = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
  return `${prefix}-${id}`;
}

// Generate a unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = { generateReferenceId, generateReferralCode };
