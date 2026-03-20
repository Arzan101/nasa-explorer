const express = require('express');
const axios = require('axios');

const router = express.Router();

// EPIC has its own host and does NOT use the standard NASA api_key param
const epicClient = axios.create({
  baseURL: 'https://epic.gsfc.nasa.gov',
  timeout: 15000,
});

// GET /api/epic - Earth EPIC images
router.get('/', async (req, res, next) => {
  try {
    const { date, type = 'natural' } = req.query;
    const validTypes = ['natural', 'enhanced'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Valid: ${validTypes.join(', ')}` });
    }

    const endpoint = date
      ? `/api/${type}/date/${date}`
      : `/api/${type}`;

    const { data } = await epicClient.get(endpoint);

    // Enrich each image with its full URL
    const images = (data || []).slice(0, 12).map(img => {
      const [year, month, day] = img.date.split(' ')[0].split('-');
      return {
        ...img,
        image_url: `https://epic.gsfc.nasa.gov/archive/${type}/${year}/${month}/${day}/png/${img.image}.png`,
        thumb_url: `https://epic.gsfc.nasa.gov/archive/${type}/${year}/${month}/${day}/thumbs/${img.image}.jpg`,
      };
    });

    res.json(images);
  } catch (err) {
    next(err);
  }
});

// GET /api/epic/dates - Available dates
router.get('/dates', async (req, res, next) => {
  try {
    const { type = 'natural' } = req.query;
    const { data } = await epicClient.get(`/api/${type}/available`);
    res.json((data || []).slice(0, 30));
  } catch (err) {
    next(err);
  }
});

module.exports = router;