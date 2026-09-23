// @desc    Get Google reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    // Official client verified reviews will be loaded here once confirmed.
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'Official verified Google Reviews endpoint. Awaiting client dataset integration.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
};
