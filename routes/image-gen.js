const express = require('express');
const router = express.Router();

// Render the image generation page
router.get('/', (req, res) => {
    res.render('image-gen', {
        title: 'Image Generation',
        layout: 'layouts/main'  // Assuming you're using a layout system
    });
});

module.exports = router;
