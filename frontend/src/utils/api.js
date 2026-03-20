import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// Response interceptor for error normalisation
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const apodAPI = {
  getToday: () => api.get('/apod'),
  getByDate: (date) => api.get(`/apod?date=${date}`),
  getRandom: (count = 6) => api.get(`/apod?count=${count}`),
  getRange: (start_date, end_date) => api.get(`/apod?start_date=${start_date}&end_date=${end_date}`),
};

export const marsAPI = {
  getPhotos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/mars/photos?${query}`);
  },
  getRovers: () => api.get('/mars/rovers'),
};

export const neoAPI = {
  getFeed: (start_date, end_date) => {
    const params = new URLSearchParams();
    if (start_date) params.set('start_date', start_date);
    if (end_date) params.set('end_date', end_date);
    return api.get(`/neo/feed?${params.toString()}`);
  },
  getById: (id) => api.get(`/neo/${id}`),
};

export const epicAPI = {
  getLatest: (type = 'natural') => api.get(`/epic?type=${type}`),
  getByDate: (date, type = 'natural') => api.get(`/epic?date=${date}&type=${type}`),
  getDates: (type = 'natural') => api.get(`/epic/dates?type=${type}`),
};

export const searchAPI = {
  search: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/search?${query}`);
  },
};
