const Appointment = require('../models/Appointment');

const MAX_PATIENTS_PER_SLOT = 2;

// Standard defined slots
const DEFAULT_SLOTS = [
  '10:00 AM – 11:30 AM',
  '11:30 AM – 01:00 PM',
  '02:00 PM – 03:30 PM',
  '03:30 PM – 05:00 PM',
  '05:00 PM – 06:30 PM',
  '06:30 PM – 08:00 PM',
];

// In-memory fallback tracking for standalone API mode
const inMemoryAppointments = [];

const normalizeSlot = (str) => (str || '').replace(/\s+/g, ' ').replace(/[–—−]/g, '-').trim();

// @desc    Get real-time slot availability for a specific date
// @route   GET /api/appointments/availability?date=YYYY-MM-DD
// @access  Public
const getSlotAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date query parameter (e.g. ?date=2026-09-24).',
      });
    }

    let appointmentsForDate = [];

    if (Appointment.db && Appointment.db.readyState === 1) {
      appointmentsForDate = await Appointment.find({
        preferredDate: date,
        status: { $ne: 'cancelled' },
      }).select('preferredTime');
    } else {
      appointmentsForDate = inMemoryAppointments.filter(
        (a) => a.preferredDate === date && a.status !== 'cancelled'
      );
    }

// Tally counts per slot
const slotCounts = {};
DEFAULT_SLOTS.forEach((slot) => {
  slotCounts[normalizeSlot(slot)] = 0;
});

appointmentsForDate.forEach((app) => {
  const normTime = normalizeSlot(app.preferredTime);
  if (normTime) {
    slotCounts[normTime] = (slotCounts[normTime] || 0) + 1;
  }
});

const slotsAvailability = DEFAULT_SLOTS.map((slot) => {
  const norm = normalizeSlot(slot);
  const bookedCount = slotCounts[norm] || 0;
  const spotsRemaining = Math.max(0, MAX_PATIENTS_PER_SLOT - bookedCount);
  const isAvailable = bookedCount < MAX_PATIENTS_PER_SLOT;

  return {
    time: slot,
    booked: bookedCount,
    maxCapacity: MAX_PATIENTS_PER_SLOT,
    spotsRemaining,
    isAvailable,
  };
});

    res.status(200).json({
      success: true,
      date,
      maxPatientsPerSlot: MAX_PATIENTS_PER_SLOT,
      slots: slotsAvailability,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new appointment preference request (Max 2 patients per slot)
// @route   POST /api/appointments
// @access  Public
const createAppointment = async (req, res, next) => {
  try {
    const { patientName, phone, email, treatment, preferredDate, preferredTime, contactMethod, notes } = req.body;

    if (!patientName || !phone || !treatment || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patientName, phone, treatment, preferredDate, and preferredTime.',
      });
    }

    // 1. Check existing booking count for that specific date and time slot
    let existingCount = 0;

    if (Appointment.db && Appointment.db.readyState === 1) {
      const allForDate = await Appointment.find({
        preferredDate,
        status: { $ne: 'cancelled' },
      }).select('preferredTime');
      existingCount = allForDate.filter(
        (a) => normalizeSlot(a.preferredTime) === normalizeSlot(preferredTime)
      ).length;
    } else {
      existingCount = inMemoryAppointments.filter(
        (a) => a.preferredDate === preferredDate && normalizeSlot(a.preferredTime) === normalizeSlot(preferredTime) && a.status !== 'cancelled'
      ).length;
    }

    // 2. Enforce strict capacity limit (Max 2 patients per slot)
    if (existingCount >= MAX_PATIENTS_PER_SLOT) {
      return res.status(400).json({
        success: false,
        message: `The time slot "${preferredTime}" on ${preferredDate} is fully booked (${MAX_PATIENTS_PER_SLOT}/${MAX_PATIENTS_PER_SLOT} patients). Please choose another time slot.`,
        slotFull: true,
      });
    }

    let newAppointment = {
      patientName,
      phone,
      email: email || '',
      treatment,
      preferredDate,
      preferredTime,
      contactMethod: contactMethod || 'WhatsApp',
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save to DB if connection active
    if (Appointment.db && Appointment.db.readyState === 1) {
      newAppointment = await Appointment.create(newAppointment);
    } else {
      newAppointment.id = `mem_${Date.now()}`;
      inMemoryAppointments.push(newAppointment);
    }

    console.log(`[Appointment] Logged for ${newAppointment.patientName} at ${newAppointment.preferredTime} on ${newAppointment.preferredDate} (Slot capacity: ${existingCount + 1}/${MAX_PATIENTS_PER_SLOT})`);

    res.status(201).json({
      success: true,
      message: 'Appointment preference submitted successfully.',
      data: {
        id: newAppointment._id || newAppointment.id,
        patientName: newAppointment.patientName,
        treatment: newAppointment.treatment,
        preferredDate: newAppointment.preferredDate,
        preferredTime: newAppointment.preferredTime,
        status: newAppointment.status,
        slotCapacity: `${existingCount + 1}/${MAX_PATIENTS_PER_SLOT}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getSlotAvailability,
};
