const express = require('express');
const router = express.Router();
const {
  getActivities,
  getActivityById,
  getCategories,
  getActivitiesByCity
} = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getActivities);
router.get('/categories', getCategories);
router.get('/city/:city_id', getActivitiesByCity);
router.get('/:id', getActivityById);

module.exports = router;
