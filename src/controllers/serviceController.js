const mongoose = require('mongoose');
const ServiceCategory = require('../models/ServiceCategory');
const { DEFAULT_SERVICES_DATA } = require('../data/defaultData');

let inMemoryServices = JSON.parse(JSON.stringify(DEFAULT_SERVICES_DATA)).map((s, idx) => ({
  ...s,
  _id: `mem-svc-${idx + 1}`,
  treatments: s.treatments.map((t, tIdx) => ({ ...t, _id: `mem-trt-${idx + 1}-${tIdx + 1}` })),
}));

const isDBConnected = () => mongoose.connection.readyState === 1;

// Helper to seed services if DB is empty
const ensureServicesSeeded = async () => {
  if (!isDBConnected()) return;
  const count = await ServiceCategory.countDocuments();
  if (count === 0) {
    await ServiceCategory.insertMany(DEFAULT_SERVICES_DATA);
    console.log('[Services] Initial services seeded into MongoDB.');
  }
};

// @desc    Get all dental services and treatments
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      await ensureServicesSeeded();
      const services = await ServiceCategory.find().sort({ order: 1, createdAt: 1 });
      return res.status(200).json({
        success: true,
        count: services.length,
        data: services,
      });
    }

    // In-memory fallback
    res.status(200).json({
      success: true,
      count: inMemoryServices.length,
      data: inMemoryServices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service category
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const service = await ServiceCategory.findById(id);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service category not found.' });
      }
      return res.status(200).json({ success: true, data: service });
    }

    const service = inMemoryServices.find((s) => String(s._id) === id || s.categoryId === id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service category
// @route   POST /api/services
// @access  Protected (Admin)
const createServiceCategory = async (req, res, next) => {
  try {
    const { title, description, tagline, shortName } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category Name (title) is required.',
      });
    }

    const categoryId = req.body.categoryId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const count = isDBConnected() ? await ServiceCategory.countDocuments() : inMemoryServices.length;
    const num = String(count + 1).padStart(2, '0');

    const newCategoryPayload = {
      categoryId,
      title: title.trim(),
      shortName: shortName ? shortName.trim().toUpperCase() : title.trim().toUpperCase(),
      num,
      tagline: tagline ? tagline.trim() : '',
      description: description ? description.trim() : '',
      order: count + 1,
      treatments: req.body.treatments || [],
    };

    if (isDBConnected()) {
      const created = await ServiceCategory.create(newCategoryPayload);
      return res.status(201).json({
        success: true,
        message: 'Service category created successfully.',
        data: created,
      });
    }

    // In-memory fallback
    const memCategory = {
      ...newCategoryPayload,
      _id: `mem-svc-${Date.now()}`,
      treatments: newCategoryPayload.treatments.map((t, idx) => ({
        ...t,
        _id: `mem-trt-${Date.now()}-${idx}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryServices.push(memCategory);

    res.status(201).json({
      success: true,
      message: 'Service category created successfully.',
      data: memCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service category
// @route   PUT /api/services/:id
// @access  Protected (Admin)
const updateServiceCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, tagline, shortName, order, treatments } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (tagline !== undefined) updateFields.tagline = tagline.trim();
    if (shortName !== undefined) updateFields.shortName = shortName.trim();
    if (order !== undefined) updateFields.order = order;
    if (treatments !== undefined) updateFields.treatments = treatments;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await ServiceCategory.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Service category not found.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Service category updated successfully.',
        data: updated,
      });
    }

    // In-memory fallback
    const index = inMemoryServices.findIndex((s) => String(s._id) === id || s.categoryId === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }

    inMemoryServices[index] = {
      ...inMemoryServices[index],
      ...updateFields,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Service category updated successfully.',
      data: inMemoryServices[index],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service category
// @route   DELETE /api/services/:id
// @access  Protected (Admin)
const deleteServiceCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const deleted = await ServiceCategory.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Service category not found.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Service category deleted successfully.',
      });
    }

    // In-memory fallback
    const index = inMemoryServices.findIndex((s) => String(s._id) === id || s.categoryId === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }

    inMemoryServices.splice(index, 1);
    res.status(200).json({
      success: true,
      message: 'Service category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add treatment to category
// @route   POST /api/services/:id/treatments
// @access  Protected (Admin)
const addTreatment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, desc, isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Treatment Name is required.',
      });
    }

    const newTreatment = {
      name: name.trim(),
      desc: desc ? desc.trim() : '',
      isActive: Boolean(isActive),
    };

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const category = await ServiceCategory.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Service category not found.' });
      }
      category.treatments.push(newTreatment);
      await category.save();

      return res.status(201).json({
        success: true,
        message: 'Treatment added successfully.',
        data: category,
      });
    }

    // In-memory fallback
    const category = inMemoryServices.find((s) => String(s._id) === id || s.categoryId === id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }

    const treatmentWithId = {
      ...newTreatment,
      _id: `mem-trt-${Date.now()}`,
    };
    category.treatments.push(treatmentWithId);

    res.status(201).json({
      success: true,
      message: 'Treatment added successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update treatment in category
// @route   PUT /api/services/:id/treatments/:treatmentId
// @access  Protected (Admin)
const updateTreatment = async (req, res, next) => {
  try {
    const { id, treatmentId } = req.params;
    const { name, desc, isActive } = req.body;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const category = await ServiceCategory.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Service category not found.' });
      }

      const treatment = category.treatments.id(treatmentId);
      if (!treatment) {
        return res.status(404).json({ success: false, message: 'Treatment not found.' });
      }

      if (name !== undefined) treatment.name = name.trim();
      if (desc !== undefined) treatment.desc = desc.trim();
      if (isActive !== undefined) treatment.isActive = Boolean(isActive);

      await category.save();

      return res.status(200).json({
        success: true,
        message: 'Treatment updated successfully.',
        data: category,
      });
    }

    // In-memory fallback
    const category = inMemoryServices.find((s) => String(s._id) === id || s.categoryId === id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }

    const treatmentIndex = category.treatments.findIndex((t) => String(t._id) === treatmentId);
    if (treatmentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Treatment not found.' });
    }

    if (name !== undefined) category.treatments[treatmentIndex].name = name.trim();
    if (desc !== undefined) category.treatments[treatmentIndex].desc = desc.trim();
    if (isActive !== undefined) category.treatments[treatmentIndex].isActive = Boolean(isActive);

    res.status(200).json({
      success: true,
      message: 'Treatment updated successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete treatment from category
// @route   DELETE /api/services/:id/treatments/:treatmentId
// @access  Protected (Admin)
const deleteTreatment = async (req, res, next) => {
  try {
    const { id, treatmentId } = req.params;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const category = await ServiceCategory.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Service category not found.' });
      }

      category.treatments = category.treatments.filter((t) => String(t._id) !== treatmentId);
      await category.save();

      return res.status(200).json({
        success: true,
        message: 'Treatment removed successfully.',
        data: category,
      });
    }

    // In-memory fallback
    const category = inMemoryServices.find((s) => String(s._id) === id || s.categoryId === id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }

    category.treatments = category.treatments.filter((t) => String(t._id) !== treatmentId);

    res.status(200).json({
      success: true,
      message: 'Treatment removed successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  addTreatment,
  updateTreatment,
  deleteTreatment,
};
