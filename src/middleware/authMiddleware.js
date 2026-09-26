const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dr_siulik_dental_care_secure_jwt_secret_2025';

const protectAdmin = (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication token required.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired admin session token.',
    });
  }
};

module.exports = {
  protectAdmin,
  JWT_SECRET,
};
