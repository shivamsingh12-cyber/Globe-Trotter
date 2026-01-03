const pool = require('../config/database');

// Get all trips for a user
const getUserTrips = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT t.*, 
             (SELECT COUNT(*) FROM trip_stops WHERE trip_id = t.id) as stop_count,
             (
               COALESCE((SELECT SUM(CAST(budget AS DECIMAL)) FROM trip_stops WHERE trip_id = t.id), 0) +
               COALESCE((SELECT SUM(CAST(sa.cost AS DECIMAL)) FROM stop_activities sa JOIN trip_stops ts ON sa.stop_id = ts.id WHERE ts.trip_id = t.id), 0)
             ) as total_cost
      FROM trips t
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
    console.log(`Fetching trip ${id} details...`); // Debug log

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
    // using LEFT JOIN to ensure stops appear even if city_id is missing/invalid
    const stopsResult = await pool.query(
      `SELECT ts.*, c.name as city_name, c.country, c.image_url as city_image
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index`,
      [id]
    );

    console.log(`Found ${stopsResult.rows.length} stops for trip ${id}`); // Debug log

    // Get activities for each stop
    for (let stop of stopsResult.rows) {
      const activitiesResult = await pool.query(
        `SELECT sa.*, a.name, a.category, a.description, a.image_url, a.cost
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

// ...

const addTripStop = async (req, res) => {
  try {
    const { id: trip_id } = req.params;
    const { city_id, start_date, end_date, order_index, notes, name, budget } = req.body;

    // Ensure numeric/null values for optional fields
    const safeCityId = (city_id === '' || city_id === 'undefined') ? null : city_id;
    const safeBudget = (budget === '' || budget === null) ? 0 : budget;

    // Verify trip ownership
    const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [trip_id, req.user.id]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const result = await pool.query(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, notes, name, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [trip_id, safeCityId, start_date, end_date, order_index, notes, name, safeBudget]
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


// Update trip stop
const updateTripStop = async (req, res) => {
  try {
    const { id: trip_id, stopId: stop_id } = req.params;
    const { city_id, start_date, end_date, order_index, notes, name, budget } = req.body;

    // Verify trip ownership
    const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [trip_id, req.user.id]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE trip_stops 
       SET city_id = COALESCE($1, city_id),
           start_date = COALESCE($2, start_date),
           end_date = COALESCE($3, end_date),
           order_index = COALESCE($4, order_index),
           notes = COALESCE($5, notes),
           name = COALESCE($6, name),
           budget = COALESCE($7, budget)
       WHERE id = $8 AND trip_id = $9
       RETURNING *`,
      [city_id, start_date, end_date, order_index, notes, name, budget, stop_id, trip_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    res.json({
      message: 'Stop updated successfully',
      stop: result.rows[0]
    });
  } catch (error) {
    console.error('Update stop error:', error);
    res.status(500).json({ error: 'Server error updating stop' });
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

    // Get section budgets (trip_stops)
    const sectionsResult = await pool.query(
      `SELECT COALESCE(SUM(budget), 0) as total
         FROM trip_stops
         WHERE trip_id = $1`,
      [id]
    );

    const budget = {
      activities: {
        total: parseFloat(activitiesResult.rows[0].total),
        count: parseInt(activitiesResult.rows[0].count)
      },
      sections: {
        total: parseFloat(sectionsResult.rows[0].total)
      },
      expenses: expensesResult.rows,
      total: parseFloat(activitiesResult.rows[0].total) +
        parseFloat(sectionsResult.rows[0].total) +
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
  updateTripStop,
  deleteTripStop,
  addStopActivity,
  getTripBudget
};
