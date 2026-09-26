const express = require('express');
const router = express.Router();
const {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  uploadMediaFile,
} = require('../controllers/mediaController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../config/storage');

router.get('/', getMedia);
router.get('/:id', getMediaById);
router.post('/upload', protectAdmin, upload.single('file'), uploadMediaFile);
router.post('/', protectAdmin, createMedia);
router.put('/:id', protectAdmin, updateMedia);
router.delete('/:id', protectAdmin, deleteMedia);

module.exports = router;
