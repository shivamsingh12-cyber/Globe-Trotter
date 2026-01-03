const pool = require('../config/database');

// Get all activities with optional filters
const getActivities = async (req, res) => {
  try {
    const { search, city_id, category, min_cost, max_cost, sort_by } = req.query;
    
    let query = `
      SELECT a.*, c.name as city_name, c.country
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (a.name ILIKE $${paramCount} OR a.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (city_id) {
      paramCount++;
      query += ` AND a.city_id = $${paramCount}`;
      params.push(city_id);
    }
    
    if (category) {
      paramCount++;
      query += ` AND a.category = $${paramCount}`;
      params.push(category);
    }
    
    if (min_cost) {
      paramCount++;
      query += ` AND a.cost >= $${paramCount}`;
      params.push(min_cost);
    }
    
    if (max_cost) {
      paramCount++;
      query += ` AND a.cost <= $${paramCount}`;
      params.push(max_cost);
    }
    
    // Sorting
    if (sort_by === 'cost_low') {
      query += ' ORDER BY a.cost ASC';
    } else if (sort_by === 'cost_high') {
      query += ' ORDER BY a.cost DESC';
    } else if (sort_by === 'duration') {
      query += ' ORDER BY a.duration ASC';
    } else {
      query += ' ORDER BY a.name ASC';
    }
    
    const result = await pool.query(query, params);
    res.json({ activities: result.rows });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Server error fetching activities' });
  }
};

// Get single activity
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT a.*, c.name as city_name, c.country
       FROM activities a
       JOIN cities c ON a.city_id = c.id
       WHERE a.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ activity: result.rows[0] });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Server error fetching activity' });
  }
};

// Get activity categories
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM activities ORDER BY category'
    );
    
    res.json({ categories: result.rows.map(row => row.category) });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
};

// Get activities by city
const getActivitiesByCity = async (req, res) => {
  try {
    const { city_id } = req.params;
    const { category } = req.query;
    
    let query = 'SELECT * FROM activities WHERE city_id = $1';
    const params = [city_id];
    
    if (category) {
      query += ' AND category = $2';
      params.push(category);
    }
    
    query += ' ORDER BY category, name';
    
    const result = await pool.query(query, params);
    res.json({ activities: result.rows });
  } catch (error) {
    console.error('Get activities by city error:', error);
    res.status(500).json({ error: 'Server error fetching activities' });
  }
};

module.exports = {
  getActivities,
  getActivityById,
  getCategories,
  getActivitiesByCity
};
