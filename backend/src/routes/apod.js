const express = require('express');
const nasaClient = require('../utils/nasaClient');

const router = express.Router();

// GET /api/apod - Astronomy Picture of the Day
router.get('/', async (req, res, next) => {
  try {
    const { date, start_date, end_date, count, thumbs = true } = req.query;
    const params = { thumbs };

    if (count) params.count = Math.min(parseInt(count), 10);
    else if (start_date && end_date) {
      params.start_date = start_date;
      params.end_date = end_date;
    } else if (date) {
      params.date = date;
    }

    const { data } = await nasaClient.get('/planetary/apod', { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
