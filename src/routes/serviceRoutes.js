const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  addTreatment,
  updateTreatment,
  deleteTreatment,
} = require('../controllers/serviceController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected Admin Actions
router.post('/', protectAdmin, createServiceCategory);
router.put('/:id', protectAdmin, updateServiceCategory);
router.delete('/:id', protectAdmin, deleteServiceCategory);

router.post('/:id/treatments', protectAdmin, addTreatment);
router.put('/:id/treatments/:treatmentId', protectAdmin, updateTreatment);
router.delete('/:id/treatments/:treatmentId', protectAdmin, deleteTreatment);

module.exports = router;
