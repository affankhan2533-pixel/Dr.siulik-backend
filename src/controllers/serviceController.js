// @desc    Get dental service categories
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Service categories endpoint ready for database sync.',
      data: [
        'Preventive Dentistry',
        'Restorative Dentistry',
        'Surgical Dentistry',
        'Smile & Cosmetic Dentistry',
        'Orthodontics',
        'Implant Dentistry',
        'Child Dentistry',
      ],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
};
