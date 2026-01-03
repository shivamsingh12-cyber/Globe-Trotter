const pool = require('../config/database');

// Get all cities with optional filters
const getCities = async (req, res) => {
  try {
    const { search, country, region, sort_by } = req.query;
    
    let query = 'SELECT * FROM cities WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR country ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (country) {
      paramCount++;
      query += ` AND country = $${paramCount}`;
      params.push(country);
    }
    
    if (region) {
      paramCount++;
      query += ` AND region = $${paramCount}`;
      params.push(region);
    }
    
    // Sorting
    if (sort_by === 'popularity') {
      query += ' ORDER BY popularity_score DESC';
    } else if (sort_by === 'cost_low') {
      query += ' ORDER BY cost_index ASC';
    } else if (sort_by === 'cost_high') {
      query += ' ORDER BY cost_index DESC';
    } else {
      query += ' ORDER BY name ASC';
    }
    
    const result = await pool.query(query, params);
    res.json({ cities: result.rows });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ error: 'Server error fetching cities' });
  }
};

// Get single city with details
const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cityResult = await pool.query('SELECT * FROM cities WHERE id = $1', [id]);
    
    if (cityResult.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const city = cityResult.rows[0];
    
    // Get activities for this city
    const activitiesResult = await pool.query(
      'SELECT * FROM activities WHERE city_id = $1 ORDER BY category, name',
      [id]
    );
    
    city.activities = activitiesResult.rows;
    
    res.json({ city });
  } catch (error) {
    console.error('Get city error:', error);
    res.status(500).json({ error: 'Server error fetching city' });
  }
};

// Get popular cities
const getPopularCities = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    
    const result = await pool.query(
      'SELECT * FROM cities ORDER BY popularity_score DESC LIMIT $1',
      [limit]
    );
    
    res.json({ cities: result.rows });
  } catch (error) {
    console.error('Get popular cities error:', error);
    res.status(500).json({ error: 'Server error fetching popular cities' });
  }
};

// Get countries list
const getCountries = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT country FROM cities ORDER BY country'
    );
    
    res.json({ countries: result.rows.map(row => row.country) });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Server error fetching countries' });
  }
};

module.exports = {
  getCities,
  getCityById,
  getPopularCities,
  getCountries
};
