const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: [
        'Hero',
        'Doctor',
        'Mentor',
        'Clinic',
        'Technology',
        'Before & After',
        'Achievements',
        'Certificates',
        'Gallery',
        'Testimonials',
      ],
      index: true,
    },
    title: { type: String, default: '', trim: true },
    url: { type: String, default: '', trim: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    category: { type: String, default: '', trim: true }, // For gallery (Reception, Waiting, Treatment, Equipment, Interior, Branding)
    order: { type: Number, default: 0 },
    // Specialized fields for Before & After
    caseName: { type: String, default: '', trim: true },
    tag: { type: String, default: '', trim: true },
    beforeImage: { type: String, default: '', trim: true },
    afterImage: { type: String, default: '', trim: true },
    beforeLabel: { type: String, default: 'BEFORE', trim: true },
    afterLabel: { type: String, default: 'AFTER', trim: true },
    isActive: { type: Boolean, default: true },
    // Specialized fields for Achievements & Certificates
    name: { type: String, default: '', trim: true },
    year: { type: String, default: '', trim: true },
    issuer: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    isFeatured: { type: Boolean, default: false },
    // Specialized fields for Hero / Testimonials
    posterImage: { type: String, default: '', trim: true },
    label: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MediaItem', mediaItemSchema);
