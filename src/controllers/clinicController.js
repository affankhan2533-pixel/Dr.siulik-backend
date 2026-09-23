// @desc    Get clinic metadata & contact details
// @route   GET /api/clinic
// @access  Public
const getClinicInfo = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        name: "Dr. Siulik's Dental Care",
        doctorName: "Dr. Siulik Bandyopadhyay",
        title: "Chief Dental Surgeon",
        tagline: "A Healthier Smile. A More Confident You.",
        status: "Development Config Mode",
        message: "Contact details driven by environment config once confirmed by client.",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClinicInfo,
};
