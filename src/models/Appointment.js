const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    treatment: { type: String, required: true, trim: true },
    preferredDate: { type: String, default: '' },
    preferredTime: { type: String, default: 'Morning (10:00 AM - 1:00 PM)' },
    contactMethod: { type: String, enum: ['WhatsApp', 'Call', 'Email'], default: 'WhatsApp' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
