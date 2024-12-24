const express = require('express');
const router = express.Router();

// Render the text chat page
router.get('/', (req, res) => {
    res.render('text-chat', {
        title: 'Text Chat',
        layout: 'layouts/main'  // Assuming you're using a layout system
    });
});

module.exports = router; 