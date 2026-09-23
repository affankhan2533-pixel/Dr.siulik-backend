const Appointment = require('../models/Appointment');

// @desc    Create new appointment preference request
// @route   POST /api/appointments
// @access  Public
const createAppointment = async (req, res, next) => {
  try {
    const { patientName, phone, email, treatment, preferredDate, preferredTime, contactMethod, notes } = req.body;

    if (!patientName || !phone || !treatment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patientName, phone, and treatment specialty.',
      });
    }

    let newAppointment = {
      patientName,
      phone,
      email: email || '',
      treatment,
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || 'Morning (10:00 AM - 1:00 PM)',
      contactMethod: contactMethod || 'WhatsApp',
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save to DB if connection active
    if (Appointment.db && Appointment.db.readyState === 1) {
      newAppointment = await Appointment.create(newAppointment);
    }

    console.log(`[Appointment] Preference Request Logged for treatment: ${newAppointment.treatment} (status: ${newAppointment.status})`);

    res.status(201).json({
      success: true,
      message: 'Appointment preference submitted successfully.',
      data: {
        treatment: newAppointment.treatment,
        preferredDate: newAppointment.preferredDate,
        preferredTime: newAppointment.preferredTime,
        status: newAppointment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
};
