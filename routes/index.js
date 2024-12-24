const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home'
    });
});

// You can add more routes here
router.get('/about', (req, res) => {
    res.render('about');
});

// Export the router directly
module.exports = router;
