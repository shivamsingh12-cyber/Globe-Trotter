const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    getUserTrends,
    getPopularActivitiesAdmin,
    updateUser
} = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All routes require authentication AND admin privileges
router.use(authenticateToken);
router.use(isAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.get('/trends', getUserTrends);
router.get('/activities/popular', getPopularActivitiesAdmin);

module.exports = router;
