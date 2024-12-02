const Client = require('../Models/clientModel'); // User model

// Login Controller
exports.login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // Validate input
        if (!Email || !Password) {
            return res.status(400).json({ message: 'Email and Password are required' });
        }

        // Find the user
        const user = await Client.findOne({ Email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password (implement bcrypt for better security)
        if (Password !== user.Password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Save user details in session
        req.session.userId = user._id; // Set userId in session
        req.session.userEmail = user.Email; // Optional: Save other user details
console.log(req.session)
        // Respond with success
        res.status(200).json({
            success: true,
            message: 'Login successful',
            redirect: 'http://127.0.0.1:3000/Admin_dashboard/Frontend/index.html', // Specify the redirect URL
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout Controller
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Unable to log out' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).json({ success: true, message: 'Logout successful' });
    });
};
