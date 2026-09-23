const express = require('express');
const router = express.Router();
const { getReviews, submitSiteReview } = require('../controllers/reviewController');

router.get('/', getReviews);
router.post('/site', submitSiteReview);

module.exports = router;
