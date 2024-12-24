const CryptoJS = require('crypto-js');

let aipptAuthInstance = null;

class AipptAuth {
    constructor() {
        if (!process.env.AIPPT_API_KEY || !process.env.AIPPT_SECRET_KEY) {
            console.warn('AIPPT credentials not found');
            return;
        }
        this.API_KEY = process.env.AIPPT_API_KEY;
        this.API_SECRET = process.env.AIPPT_SECRET_KEY;
        this.BASE_URL = 'https://api.aippt.cn';
    }

    generateSignature(method, uri, timestamp) {
        // Create the string to sign: method@uri@timestamp
        const stringToSign = `${method}@${uri}@${timestamp}`;
        
        // Generate HMAC-SHA1 signature and convert to Base64
        const hash = CryptoJS.HmacSHA1(stringToSign, this.API_SECRET);
        return CryptoJS.enc.Base64.stringify(hash);
    }

    async getCode(userId, channel) {
        const timestamp = Math.floor(Date.now() / 1000);
        const uri = '/api/grant/code/';
        const signature = this.generateSignature('GET', uri, timestamp);

        try {
            const response = await fetch(`${this.BASE_URL}/api/grant/code?uid=${userId}&channel=${channel}`, {
                method: 'GET',
                headers: {
                    'x-api-key': this.API_KEY,
                    'x-timestamp': timestamp.toString(),
                    'x-signature': signature
                }
            });

            const data = await response.json();
            if (data.code === 0) {
                return data.data;
            } else {
                throw new Error(data.msg || 'Failed to get authentication code');
            }
        } catch (error) {
            console.error('AIPPT Auth Error:', error);
            throw error;
        }
    }
}

module.exports = {
    getInstance: () => {
        if (!aipptAuthInstance) {
            aipptAuthInstance = new AipptAuth();
        }
        return aipptAuthInstance;
    }
}; 