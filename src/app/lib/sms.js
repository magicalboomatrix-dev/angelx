import twilio from 'twilio';

const makeError = (code, message, status = 503) => {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
};

let _client = null;
const getClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw makeError('SMS_NOT_CONFIGURED', 'Twilio credentials are not configured');
  }

  if (!_client) {
    _client = twilio(accountSid, authToken);
  }
  return _client;
};

/**
 * Send an SMS message using Twilio.
 * @param {string} to - 10-digit Indian number without country code (or E.164)
 * @param {string} message - Message content
 */
export const sendSms = async (to, message) => {
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!twilioPhoneNumber) {
    throw makeError('SMS_NOT_CONFIGURED', 'Twilio sender number is not configured');
  }

  const formattedNumber = to.startsWith('+') ? to : `+91${to}`;

  try {
    const client = getClient();
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedNumber,
    });

    console.log(`SMS sent to ${formattedNumber}. SID: ${result.sid}`);
    return result;
  } catch (error) {
    // Re-throw structured errors from getClient()
    if (error.code && ['SMS_NOT_CONFIGURED'].includes(error.code)) throw error;

    const status = error.status || error.code;

    // Twilio auth errors (20xxx)
    if (typeof status === 'number' ? status === 20003 : String(status).startsWith('20')) {
      throw makeError('SMS_AUTH_FAILED', `Twilio auth failed: ${error.message}`);
    }

    // Network / connectivity
    if (error.cause?.code === 'ECONNREFUSED' || error.cause?.code === 'ETIMEDOUT') {
      throw makeError('SMS_NETWORK_ERROR', `SMS network error: ${error.message}`);
    }

    console.error('Twilio send error:', error);
    throw makeError('SMS_SEND_FAILED', `Failed to send SMS: ${error.message}`);
  }
};
