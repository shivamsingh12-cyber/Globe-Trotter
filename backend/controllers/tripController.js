const pool = require('../config/database');

// Get all trips for a user
const getUserTrips = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT t.*, 
             COUNT(DISTINCT ts.id) as stop_count,
             COALESCE(SUM(sa.cost), 0) as total_cost
      FROM trips t
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      LEFT JOIN stop_activities sa ON ts.id = sa.stop_id
      WHERE t.user_id = $1
    `;

    const params = [req.user.id];

    if (status) {
      query += ' AND t.status = $2';
      params.push(status);
    }

    query += ' GROUP BY t.id ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ trips: result.rows });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Server error fetching trips' });
  }
};

// Get single trip with details
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user ? req.user.id : -1;

    // Get trip details
    const tripResult = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND (user_id = $2 OR is_public = true)',
      [id, userId]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = tripResult.rows[0];

    // Get trip stops with city details
    const stopsResult = await pool.query(
      `SELECT ts.*, c.name as city_name, c.country, c.image_url as city_image
       FROM trip_stops ts
       JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index`,
      [id]
    );

    // Get activities for each stop
    for (let stop of stopsResult.rows) {
      const activitiesResult = await pool.query(
        `SELECT sa.*, a.name, a.category, a.description, a.image_url
         FROM stop_activities sa
         JOIN activities a ON sa.activity_id = a.id
         WHERE sa.stop_id = $1
         ORDER BY sa.scheduled_date, sa.scheduled_time`,
        [stop.id]
      );
      stop.activities = activitiesResult.rows;
    }

    trip.stops = stopsResult.rows;

    res.json({ trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Server error fetching trip' });
  }
};

// Create new trip
const createTrip = async (req, res) => {
  try {
    const { name, description, start_date, end_date, cover_photo, is_public } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Name, start date, and end date are required' });
    }

    const result = await pool.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo, is_public, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'planning')
       RETURNING *`,
      [req.user.id, name, description, start_date, end_date, cover_photo, is_public || false]
    );

    res.status(201).json({
      message: 'Trip created successfully',
      trip: result.rows[0]
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Server error creating trip' });
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, start_date, end_date, cover_photo, is_public, status } = req.body;

    // Verify ownership
    const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE trips 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           cover_photo = COALESCE($5, cover_photo),
           is_public = COALESCE($6, is_public),
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, start_date, end_date, cover_photo, is_public, status, id]
    );

    res.json({
      message: 'Trip updated successfully',
      trip: result.rows[0]
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Server error updating trip' });
  }
};

// Delete trip
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Server error deleting trip' });
  }
};

// Add stop to trip
const addTripStop = async (req, res) => {
  try {
    const { id: trip_id } = req.params;
    const { city_id, start_date, end_date, order_index, notes, name, budget } = req.body;

    // Verify trip ownership
    const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [trip_id, req.user.id]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const result = await pool.query(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, notes, name, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [trip_id, city_id, start_date, end_date, order_index, notes, name, budget || 0]
    );

    res.status(201).json({
      message: 'Stop added successfully',
      stop: result.rows[0]
    });
  } catch (error) {
    console.error('Add stop error:', error);
    res.status(500).json({ error: 'Server error adding stop' });
  }
};

// Delete stop from trip
const deleteTripStop = async (req, res) => {
  try {
    const { id: trip_id, stopId: stop_id } = req.params;

    // Verify trip ownership
    const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [trip_id, req.user.id]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const result = await pool.query(
      'DELETE FROM trip_stops WHERE id = $1 AND trip_id = $2 RETURNING id',
      [stop_id, trip_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    res.json({ message: 'Stop deleted successfully' });
  } catch (error) {
    console.error('Delete stop error:', error);
    res.status(500).json({ error: 'Server error deleting stop' });
  }
};

// Add activity to stop
const addStopActivity = async (req, res) => {
  try {
    const { stopId: stop_id } = req.params;
    const { activity_id, scheduled_date, scheduled_time, cost, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO stop_activities (stop_id, activity_id, scheduled_date, scheduled_time, cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [stop_id, activity_id, scheduled_date, scheduled_time, cost, notes]
    );

    res.status(201).json({
      message: 'Activity added successfully',
      activity: result.rows[0]
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ error: 'Server error adding activity' });
  }
};

// Get trip budget breakdown
const getTripBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user ? req.user.id : -1;

    // Verify access
    const tripCheck = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND (user_id = $2 OR is_public = true)',
      [id, userId]
    );
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Get activities cost
    const activitiesResult = await pool.query(
      `SELECT COALESCE(SUM(sa.cost), 0) as total, COUNT(*) as count
       FROM stop_activities sa
       JOIN trip_stops ts ON sa.stop_id = ts.id
       WHERE ts.trip_id = $1`,
      [id]
    );

    // Get expenses
    const expensesResult = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE trip_id = $1
       GROUP BY category`,
      [id]
    );

    const budget = {
      activities: {
        total: parseFloat(activitiesResult.rows[0].total),
        count: parseInt(activitiesResult.rows[0].count)
      },
      expenses: expensesResult.rows,
      total: parseFloat(activitiesResult.rows[0].total) +
        expensesResult.rows.reduce((sum, exp) => sum + parseFloat(exp.total), 0)
    };

    res.json({ budget });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ error: 'Server error fetching budget' });
  }
};

module.exports = {
  getUserTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  addTripStop,
  deleteTripStop,
  addStopActivity,
  getTripBudget
};
