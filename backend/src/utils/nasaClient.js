const axios = require('axios');

const NASA_BASE_URL = 'https://api.nasa.gov';

const nasaClient = axios.create({
  baseURL: NASA_BASE_URL,
  timeout: 15000,
});

// Read the key per-request so dotenv timing never causes a stale DEMO_KEY
nasaClient.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    api_key: process.env.NASA_API_KEY || 'DEMO_KEY',
  };
  return config;
});

nasaClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.error?.message ||
        error.response.data?.msg ||
        'NASA API error';
      const err = new Error(message);
      err.status = status;
      return Promise.reject(err);
    }
    if (error.code === 'ECONNABORTED') {
      const err = new Error('NASA API request timed out');
      err.status = 504;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

module.exports = nasaClient;