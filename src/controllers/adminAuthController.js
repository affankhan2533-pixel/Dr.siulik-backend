const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const getAdminEmail = () => process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || 'siulikbadajena35@gmail.com';
const getAdminPassword = () => process.env.ADMIN_PASSWORD || 'siulikbadajena@2026';

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const identifier = (req.body.email || req.body.username || '').trim();
    const password = req.body.password || '';

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.',
      });
    }

    const currentAdminEmail = getAdminEmail().trim().toLowerCase();
    const currentAdminPassword = getAdminPassword();

    const isUserValid = identifier.toLowerCase() === currentAdminEmail || identifier === (process.env.ADMIN_USERNAME || currentAdminEmail);
    const isPasswordValid = password === currentAdminPassword;

    if (!isUserValid || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.',
      });
    }

    // Sign JWT token valid for 7 days
    const token = jwt.sign(
      {
        username: currentAdminEmail,
        email: currentAdminEmail,
        role: 'admin',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        username: currentAdminEmail,
        email: currentAdminEmail,
        role: 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Admin Session
// @route   GET /api/admin/me
// @access  Protected
const getAdminProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        username: req.user.username || ADMIN_USERNAME,
        role: 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Logout
// @route   POST /api/admin/logout
// @access  Public
const logoutAdmin = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin session logged out successfully.',
  });
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
};
