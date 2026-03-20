const express = require('express');
const axios = require('axios');

const router = express.Router();

const NASA_IMAGES_BASE = 'https://images-api.nasa.gov';

// GET /api/search - NASA Image and Video Library
router.get('/', async (req, res, next) => {
  try {
    const { q, media_type = 'image', page = 1, year_start, year_end } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const params = {
      q: q.trim(),
      media_type,
      page: Math.min(parseInt(page), 10),
    };
    if (year_start) params.year_start = year_start;
    if (year_end) params.year_end = year_end;

    const { data } = await axios.get(`${NASA_IMAGES_BASE}/search`, {
      params,
      timeout: 15000,
    });

    const items = (data.collection?.items || []).slice(0, 20).map(item => ({
      nasa_id: item.data?.[0]?.nasa_id,
      title: item.data?.[0]?.title,
      description: item.data?.[0]?.description?.slice(0, 300),
      date_created: item.data?.[0]?.date_created,
      media_type: item.data?.[0]?.media_type,
      center: item.data?.[0]?.center,
      keywords: item.data?.[0]?.keywords,
      preview_url: item.links?.[0]?.href,
    }));

    res.json({
      total_hits: data.collection?.metadata?.total_hits || 0,
      page: parseInt(page),
      items,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
