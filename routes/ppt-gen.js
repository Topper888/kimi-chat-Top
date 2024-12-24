const express = require('express');
const router = express.Router();
const aipptAuth = require('../utils/aipptAuth');

// Render the PPT generation page
router.get('/', (req, res) => {
    res.render('ppt-gen', {
        title: 'PPT Generation',
        layout: 'layouts/main'
    });
});

// Get AIPPT authentication code
router.post('/auth', async (req, res) => {
    try {
        const auth = aipptAuth.getInstance();
        if (!auth.API_KEY || !auth.API_SECRET) {
            throw new Error('AIPPT credentials not configured');
        }
        
        const userId = req.body.userId || '1';
        const channel = 'web';
        
        const authData = await auth.getCode(userId, channel);
        res.json({
            appkey: authData.api_key,
            code: authData.code,
            channel: channel
        });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 