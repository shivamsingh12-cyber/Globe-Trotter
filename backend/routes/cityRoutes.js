const express = require('express');
const router = express.Router();
const {
  getCities,
  getCityById,
  getPopularCities,
  getCountries
} = require('../controllers/cityController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getCities);
router.get('/popular', getPopularCities);
router.get('/countries', getCountries);
router.get('/:id', getCityById);

module.exports = router;
