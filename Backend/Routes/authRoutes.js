const express = require('express');
const router = express.Router();
const authController = require('../Controller/authController');

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

router.get('/check-session', (req, res) => {
    console.log("Session:", req.session, "UserId:", req.session.userId);
    if (req.session && req.session.userId) {
        res.status(200).json({
            success: true,
            message: 'Session is valid',
            userId: req.session.userId, // Now a string
            userEmail: req.session.userEmail,
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'No valid session found',
        });
    }
});

module.exports = router;
