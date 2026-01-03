const pool = require('../config/database');

// Get overall dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Users
        const usersRes = await pool.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(usersRes.rows[0].count);

        // 2. Total Trips
        const tripsRes = await pool.query('SELECT COUNT(*) FROM trips');
        const totalTrips = parseInt(tripsRes.rows[0].count);

        // 3. Active Trips (future or ongoing)
        const activeTripsRes = await pool.query('SELECT COUNT(*) FROM trips WHERE end_date >= CURRENT_DATE');
        const activeTrips = parseInt(activeTripsRes.rows[0].count);

        // 4. "Revenue" (Estimate based on budget/cost)
        // For now, let's sum up the 'budget' field in trip_stops and 'cost' in stop_activities
        // This is approximate but 'real' based on DB data
        const revenueRes = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(budget), 0) FROM trip_stops) +
        (SELECT COALESCE(SUM(cost), 0) FROM stop_activities) as total
    `);
        const revenue = parseFloat(revenueRes.rows[0].total || 0);

        res.json({
            totalUsers,
            totalTrips,
            activeTrips,
            revenue
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, first_name, last_name, city, country, created_at, is_admin FROM users ORDER BY created_at DESC'
        );
        res.json({ users: result.rows });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
};

// Get User Trends (Growth over last 6 months)
const getUserTrends = async (req, res) => {
    try {
        // Group users by month
        const result = await pool.query(`
      SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

        // Also get Trip trends
        const tripResult = await pool.query(`
      SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as trips
      FROM trips
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

        // Merge logic loosely (assuming months align, or just return distinct arrays)
        // For simplicity, let's just return the raw data and let backend merge or frontend handle
        // Actually, let's format it for Recharts [ { month: 'Jan', users: 10, trips: 5 } ]

        // Create a map
        const dataMap = {};
        result.rows.forEach(r => {
            dataMap[r.month] = { month: r.month, users: parseInt(r.users), trips: 0 };
        });
        tripResult.rows.forEach(r => {
            if (!dataMap[r.month]) dataMap[r.month] = { month: r.month, users: 0, trips: 0 };
            dataMap[r.month].trips = parseInt(r.trips);
        });

        const chartData = Object.values(dataMap);

        res.json({ trends: chartData });
    } catch (error) {
        console.error('Get trends error:', error);
        res.status(500).json({ error: 'Server error fetching trends' });
    }
};

// Get Popular Activities (Top 5)
const getPopularActivitiesAdmin = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT a.name, a.category, COUNT(sa.id)::int as value
      FROM stop_activities sa
      JOIN activities a ON sa.activity_id = a.id
      GROUP BY a.id, a.name, a.category
      ORDER BY value DESC
      LIMIT 5
    `);

        // Return formatted for Pie Chart (name, value)
        res.json({ activities: result.rows });
    } catch (error) {
        console.error('Get popular activities error:', error);
        res.status(500).json({ error: 'Server error fetching activities' });
    }
};

// Update user details (Admin only)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, city, country, is_admin } = req.body;

        // Construct dynamic query
        const query = `
            UPDATE users 
            SET first_name = $1, last_name = $2, email = $3, city = $4, country = $5, is_admin = $6
            WHERE id = $7
            RETURNING id, email, first_name, last_name, city, country, is_admin, created_at
        `;

        const result = await pool.query(query, [first_name, last_name, email, city, country, is_admin, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error updating user' });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getUserTrends,
    getPopularActivitiesAdmin,
    updateUser
};
