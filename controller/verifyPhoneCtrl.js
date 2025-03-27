const telesign = require('telesignsdk');
const { isValidPhoneNumber } = require('libphonenumber-js');

// Configuration constants
const CONFIG = {
    OTP_LENGTH: 6,
    OTP_EXPIRATION_MINUTES: 5,
    MESSAGE_TEMPLATE: 'Your verification code is $$CODE$$'
};

// OTP Store with expiration
class OTPStore {
    constructor() {
        this.store = new Map();
    }

    set(phoneNumber, otp) {
        this.store.set(phoneNumber, {
            code: otp,
            expires: Date.now() + (CONFIG.OTP_EXPIRATION_MINUTES * 60 * 1000)
        });
    }

    get(phoneNumber) {
        const data = this.store.get(phoneNumber);
        if (!data || Date.now() > data.expires) {
            this.delete(phoneNumber);
            return null;
        }
        return data.code;
    }

    delete(phoneNumber) {
        this.store.delete(phoneNumber);
    }
}

const otpStore = new OTPStore();

const sendVerification = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const customerId = process.env.TELESIGN_CUSTOMER_ID;
    const apiKey = process.env.TELESIGN_API_KEY;

    if (!customerId || !apiKey) {
        return res.status(500).json({
            error: 'Server configuration error',
            details: 'Missing Telesign credentials'
        });
    }

    try {
        const client = new telesign(
            customerId,
            apiKey,
            'https://rest-api.telesign.com',
            10000
        );

        const otp = Math.floor(Math.pow(10, CONFIG.OTP_LENGTH - 1) +
            Math.random() * (Math.pow(10, CONFIG.OTP_LENGTH) - Math.pow(10, CONFIG.OTP_LENGTH - 1)))
            .toString();

        const message = CONFIG.MESSAGE_TEMPLATE.replace('$$CODE$$', otp);

        console.log('Attempting to send SMS to:', phoneNumber); // Log the exact number

        const response = await new Promise((resolve, reject) => {
            client.sms.message(
                (error, responseBody) => {
                    if (error) {
                        console.error('SMS Error:', error);
                        reject(error);
                    } else {
                        console.log('SMS Response:', responseBody);
                        resolve(responseBody);
                    }
                },
                phoneNumber,
                message,
                'OTP'
            );
        });

        if (response.status && response.status.code !== 290) {
            let errorMessage = response.status.description;
            if (errorMessage.includes('trial account')) {
                errorMessage += ' Please ensure this number is verified in your TeleSign trial account or upgrade to a paid plan.';
            }
            throw new Error(`Message not successfully queued. Status: ${errorMessage}`);
        }

        otpStore.set(phoneNumber, otp);

        return res.json({
            message: 'Verification code sent',
            referenceId: response.reference_id || 'N/A',
            statusCode: response.status?.code,
            statusDescription: response.status?.description
        });
    } catch (error) {
        console.error('Telesign Verification Error:', error);
        return res.status(500).json({
            error: 'Failed to send verification code',
            details: error.message,
            code: error.code,
            telesignResponse: error.responseBody
        });
    }
};

const verifyCode = async (req, res) => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code || !isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({
            error: 'Valid phone number and verification code are required'
        });
    }

    try {
        const storedCode = otpStore.get(phoneNumber);

        if (!storedCode) {
            return res.status(400).json({
                error: 'No active verification code found or code expired'
            });
        }

        if (storedCode === code) {
            otpStore.delete(phoneNumber);
            return res.json({ message: 'Phone number verified successfully' });
        }

        return res.status(400).json({ error: 'Invalid verification code' });
    } catch (error) {
        console.error('Verification Error:', error);
        return res.status(500).json({
            error: 'Failed to verify code',
            details: error.message
        });
    }
};

module.exports = {
    sendVerification,
    verifyCode
};