const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
} = require('../controllers/adminAuthController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/me', protectAdmin, getAdminProfile);
router.post('/logout', logoutAdmin);

module.exports = router;
