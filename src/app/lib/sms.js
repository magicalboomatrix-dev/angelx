import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Send an SMS message using Twilio
 * @param {string} to - Phone number to send SMS to (10-digit Indian number without country code)
 * @param {string} message - Message content
 */
export const sendSms = async (to, message) => {
  // Format phone number for India (+91)
  const formattedNumber = to.startsWith('+') ? to : `+91${to}`;
  
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedNumber,
    });
    
    console.log(`✅ SMS sent successfully to ${formattedNumber}. SID: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
};
