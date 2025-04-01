const TeleSignSDK = require('telesignsdk');
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

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber, 'VN')) {
        return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const customerId = process.env.TELESIGN_CUSTOMER_ID;
    const apiKey = process.env.TELESIGN_API_KEY;
    const restEndpoint = process.env.TELESIGN_REST_ENDPOINT || "https://rest-api.telesign.com";

    if (!customerId || !apiKey) {
        return res.status(500).json({
            error: 'Server configuration error',
            details: 'Missing Telesign credentials'
        });
    }

    try {
        // Initialize properly according to TeleSign documentation
        const client = new TeleSignSDK(
            customerId,
            apiKey,
            restEndpoint
        );

        const otp = Math.floor(Math.pow(10, CONFIG.OTP_LENGTH - 1) +
            Math.random() * (Math.pow(10, CONFIG.OTP_LENGTH) - Math.pow(10, CONFIG.OTP_LENGTH - 1)))
            .toString();

        const message = CONFIG.MESSAGE_TEMPLATE.replace('$$CODE$$', otp);

        console.log('Sending SMS to:', phoneNumber);
        console.log('Message:', message);

        // Convert to promise-based approach
        const sendSMS = () => {
            return new Promise((resolve, reject) => {
                client.sms.message(
                    (err, responseBody) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(responseBody);
                    },
                    phoneNumber,
                    message,
                    'OTP'
                );
            });
        };

        try {
            const response = await sendSMS();

            console.log('SMS Response:', response);

            otpStore.set(phoneNumber, otp);

            return res.json({
                message: 'Verification code sent',
                referenceId: response.reference_id || 'N/A',
                statusCode: response.status?.code,
                statusDescription: response.status?.description
            });
        } catch (smsError) {
            console.error('SMS Send Error:', smsError);
            return res.status(500).json({
                error: 'Failed to send verification code',
                details: smsError.message
            });
        }

    } catch (error) {
        console.error('Comprehensive Telesign Error:', {
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            error: 'Failed to send verification code',
            details: error.message
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