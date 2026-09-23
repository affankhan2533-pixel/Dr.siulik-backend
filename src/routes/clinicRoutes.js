const express = require('express');
const router = express.Router();
const { getClinicInfo } = require('../controllers/clinicController');

router.get('/', getClinicInfo);

module.exports = router;
