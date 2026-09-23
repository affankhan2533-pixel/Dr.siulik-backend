const express = require('express');
const router = express.Router();
const { createAppointment } = require('../controllers/appointmentController');

// Public route: Patients submit appointment preference requests
router.post('/', createAppointment);

// GET /api/appointments is intentionally disabled for patient privacy.

module.exports = router;
