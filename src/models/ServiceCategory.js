const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    desc: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const serviceCategorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    shortName: { type: String, default: '', trim: true },
    num: { type: String, default: '', trim: true },
    tagline: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
    treatments: [treatmentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
