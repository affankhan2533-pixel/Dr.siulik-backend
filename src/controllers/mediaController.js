const mongoose = require('mongoose');
const MediaItem = require('../models/MediaItem');
const { DEFAULT_MEDIA_ITEMS } = require('../data/defaultData');
const { uploadToPersistentStorage } = require('../config/storage');

// In-memory fallback if MongoDB is not connected
let inMemoryMedia = [...DEFAULT_MEDIA_ITEMS.map((item, idx) => ({ ...item, _id: `mem-media-${idx + 1}` }))];

const isDBConnected = () => mongoose.connection.readyState === 1;

// Helper to seed media if DB is empty
const ensureMediaSeeded = async () => {
  if (!isDBConnected()) return;
  const count = await MediaItem.countDocuments();
  if (count === 0) {
    await MediaItem.insertMany(DEFAULT_MEDIA_ITEMS);
    console.log('[Media] Initial media items seeded into MongoDB.');
  }
};

// @desc    Get media items (all or filtered by section)
// @route   GET /api/media
// @access  Public
const getMedia = async (req, res, next) => {
  try {
    const { section } = req.query;

    if (isDBConnected()) {
      await ensureMediaSeeded();
      const filter = section ? { section } : {};
      const media = await MediaItem.find(filter).sort({ order: 1, createdAt: 1 });
      return res.status(200).json({
        success: true,
        count: media.length,
        data: media,
      });
    }

    // In-memory fallback
    const filtered = section ? inMemoryMedia.filter((m) => m.section === section) : inMemoryMedia;
    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single media item
// @route   GET /api/media/:id
// @access  Public
const getMediaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const item = await MediaItem.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Media item not found.' });
      }
      return res.status(200).json({ success: true, data: item });
    }

    const item = inMemoryMedia.find((m) => String(m._id) === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new media item
// @route   POST /api/media
// @access  Protected (Admin)
const createMedia = async (req, res, next) => {
  try {
    const payload = req.body;

    if (!payload.section) {
      return res.status(400).json({
        success: false,
        message: 'Section is required.',
      });
    }

    if (isDBConnected()) {
      const newItem = await MediaItem.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Media item added successfully.',
        data: newItem,
      });
    }

    // In-memory fallback
    const memItem = {
      ...payload,
      _id: `mem-media-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryMedia.push(memItem);

    res.status(201).json({
      success: true,
      message: 'Media item added successfully.',
      data: memItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update / Replace media item
// @route   PUT /api/media/:id
// @access  Protected (Admin)
const updateMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await MediaItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Media item not found.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Media item updated successfully.',
        data: updated,
      });
    }

    // In-memory fallback
    const index = inMemoryMedia.findIndex((m) => String(m._id) === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }

    inMemoryMedia[index] = {
      ...inMemoryMedia[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Media item updated successfully.',
      data: inMemoryMedia[index],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media item
// @route   DELETE /api/media/:id
// @access  Protected (Admin)
const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const deleted = await MediaItem.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Media item not found.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Media item removed successfully.',
      });
    }

    // In-memory fallback
    const index = inMemoryMedia.findIndex((m) => String(m._id) === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }

    inMemoryMedia.splice(index, 1);
    res.status(200).json({
      success: true,
      message: 'Media item removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload media file
// @route   POST /api/media/upload
// @access  Protected (Admin)
const uploadMediaFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a file to upload.',
      });
    }

    const uploadResult = await uploadToPersistentStorage(req.file, 'dr_siulik_dental');

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully.',
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        storageProvider: uploadResult.storageProvider,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  uploadMediaFile,
};
