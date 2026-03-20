const express = require('express');
const nasaClient = require('../utils/nasaClient');

const router = express.Router();

const VALID_ROVERS = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
const VALID_CAMERAS = {
  curiosity: ['fhaz', 'rhaz', 'mast', 'chemcam', 'mahli', 'mardi', 'navcam'],
  opportunity: ['fhaz', 'rhaz', 'navcam', 'pancam', 'minites'],
  spirit: ['fhaz', 'rhaz', 'navcam', 'pancam', 'minites'],
  perseverance: ['edl_rucam', 'edl_rdcam', 'edl_ddcam', 'edl_pucam1', 'edl_pucam2', 'navcam_left', 'navcam_right', 'mcz_right', 'mcz_left', 'front_hazcam_left_a', 'front_hazcam_right_a', 'rear_hazcam_left', 'rear_hazcam_right', 'skycam', 'sherloc_watson'],
};

// Known-good default sols for each rover
const DEFAULT_SOLS = {
  curiosity: 1000,
  perseverance: 200,
  opportunity: 100,
  spirit: 100,
};

// GET /api/mars/photos - Mars rover photos
router.get('/photos', async (req, res, next) => {
  try {
    const { rover = 'curiosity', sol, earth_date, camera, page = 1 } = req.query;
    const roverName = rover.toLowerCase();

    if (!VALID_ROVERS.includes(roverName)) {
      return res.status(400).json({ error: `Invalid rover. Valid options: ${VALID_ROVERS.join(', ')}` });
    }

    const params = { page };
    if (sol !== undefined && sol !== '') params.sol = parseInt(sol, 10);
    else if (earth_date) params.earth_date = earth_date;
    else params.sol = DEFAULT_SOLS[roverName] || 100;

    if (camera) params.camera = camera;

    const { data } = await nasaClient.get(`/mars-photos/api/v1/rovers/${roverName}/photos`, { params });

    const photos = (data.photos || []).slice(0, 24);
    res.json({ photos, total: data.photos?.length || 0 });
  } catch (err) {
    next(err);
  }
});

// GET /api/mars/rovers - Get rover manifests
// Uses Promise.allSettled so one failed rover never breaks the whole response
router.get('/rovers', async (req, res, next) => {
  try {
    const results = await Promise.allSettled(
      VALID_ROVERS.map(name => nasaClient.get(`/mars-photos/api/v1/manifests/${name}`))
    );

    const manifests = results.map((r, i) => {
      if (r.status === 'fulfilled') {
        return { name: VALID_ROVERS[i], ...r.value.data.photo_manifest };
      }
      // Return a safe fallback so the frontend doesn't crash
      return {
        name: VALID_ROVERS[i],
        status: 'unknown',
        landing_date: null,
        max_sol: null,
        total_photos: null,
        error: 'Manifest unavailable',
      };
    });

    res.json(manifests);
  } catch (err) {
    next(err);
  }
});

module.exports = router;