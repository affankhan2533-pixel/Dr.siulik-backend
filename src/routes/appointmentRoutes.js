const express = require('express');
const router = express.Router();
const { createAppointment, getSlotAvailability } = require('../controllers/appointmentController');

// Public route: Check real-time slot availability for a date (?date=YYYY-MM-DD)
router.get('/availability', getSlotAvailability);

// Public route: Patients submit appointment preference requests (Max 2 per slot)
router.post('/', createAppointment);

module.exports = router;
