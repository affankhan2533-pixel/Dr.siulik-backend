const Contact = require('../models/Contact');

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message content.',
      });
    }

    let contactRecord = {
      name,
      email,
      phone: phone || '',
      message,
      createdAt: new Date().toISOString(),
    };

    if (Contact.db && Contact.db.readyState === 1) {
      contactRecord = await Contact.create(contactRecord);
    }

    console.log('[Contact] Message Logged:', contactRecord);

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. Your message has been received.',
      data: contactRecord,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContact,
};
