const mongoose = require('mongoose');

const siteReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true, trim: true, minlength: 10, maxlength: 600 },
    treatment: { type: String, trim: true, default: '' },
    isPublic: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteReview', siteReviewSchema);
