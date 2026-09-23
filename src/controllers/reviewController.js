const SiteReview = require('../models/SiteReview');

// @desc    Submit an on-site patient review
// @route   POST /api/reviews/site
// @access  Public
const submitSiteReview = async (req, res, next) => {
  try {
    const { name, rating, reviewText, treatment } = req.body;

    if (!name || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'Name, rating, and review text are required.' });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a whole number between 1 and 5.' });
    }

    if (reviewText.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Review text must be at least 10 characters.' });
    }

    const review = await SiteReview.create({
      name: name.trim().substring(0, 80),
      rating: parsedRating,
      reviewText: reviewText.trim().substring(0, 600),
      treatment: (treatment || '').trim().substring(0, 80),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you. Your review has been received and will be reviewed shortly.',
      data: { id: review._id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Google reviews (placeholder)
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
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

module.exports = { getReviews, submitSiteReview };
