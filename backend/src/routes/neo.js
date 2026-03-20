const express = require('express');
const nasaClient = require('../utils/nasaClient');

const router = express.Router();

// GET /api/neo/feed - Near Earth Objects feed
router.get('/feed', async (req, res, next) => {
  try {
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const start_date = req.query.start_date || today.toISOString().split('T')[0];
    const end_date = req.query.end_date || sevenDaysLater.toISOString().split('T')[0];

    // Validate date range (max 7 days per NASA API limit)
    const startMs = new Date(start_date).getTime();
    const endMs = new Date(end_date).getTime();
    const diffDays = (endMs - startMs) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      return res.status(400).json({ error: 'Date range cannot exceed 7 days' });
    }

    const { data } = await nasaClient.get('/neo/rest/v1/feed', {
      params: { start_date, end_date },
    });

    // Flatten and enrich the NEO data
    const allNeos = Object.entries(data.near_earth_objects).flatMap(([date, neos]) =>
      neos.map(neo => ({
        id: neo.id,
        name: neo.name,
        date,
        is_potentially_hazardous: neo.is_potentially_hazardous_asteroid,
        estimated_diameter_km: {
          min: neo.estimated_diameter.kilometers.estimated_diameter_min,
          max: neo.estimated_diameter.kilometers.estimated_diameter_max,
        },
        close_approach: neo.close_approach_data[0] ? {
          date: neo.close_approach_data[0].close_approach_date,
          velocity_kph: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour),
          miss_distance_km: parseFloat(neo.close_approach_data[0].miss_distance.kilometers),
          miss_distance_lunar: parseFloat(neo.close_approach_data[0].miss_distance.lunar),
          orbiting_body: neo.close_approach_data[0].orbiting_body,
        } : null,
        nasa_url: neo.nasa_jpl_url,
      }))
    );

    // Sort by miss distance (closest first)
    allNeos.sort((a, b) => 
      (a.close_approach?.miss_distance_km || Infinity) - (b.close_approach?.miss_distance_km || Infinity)
    );

    res.json({
      element_count: data.element_count,
      start_date,
      end_date,
      neos: allNeos,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/neo/:id - Single NEO detail
router.get('/:id', async (req, res, next) => {
  try {
    const { data } = await nasaClient.get(`/neo/rest/v1/neo/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
