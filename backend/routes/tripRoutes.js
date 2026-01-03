const express = require('express');
const router = express.Router();
const {
  getUserTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  addTripStop,
  updateTripStop,
  deleteTripStop,
  addStopActivity,
  getTripBudget
} = require('../controllers/tripController');
const { authenticateToken, authenticateTokenOptional } = require('../middleware/auth');

// Public/Optional Auth routes (must be before global auth)
router.get('/:id', authenticateTokenOptional, getTripById);
router.get('/:id/budget', authenticateTokenOptional, getTripBudget);

// All other routes require authentication
router.use(authenticateToken);

// Trip routes
router.get('/', getUserTrips);
router.post('/', createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Trip stops and activities
router.post('/:id/stops', addTripStop);
router.put('/:id/stops/:stopId', updateTripStop);
router.delete('/:id/stops/:stopId', deleteTripStop);
router.post('/:id/stops/:stopId/activities', addStopActivity);

module.exports = router;
