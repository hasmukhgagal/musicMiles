import axios from 'axios';
import AlertService from './alert.service';

const instance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  // timeout: 1000,
  headers: { Authorization: localStorage.getItem('token') },
});

// A request interceptor
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// A response interceptor
instance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.message) {
      AlertService.success(response.data.message);
    }

    return response.data;
  },
  ({ response }) => {
    if (response.data && response.data.error) {
      AlertService.error(response.data.error);
    }

    if (response.status === 401 && !String(response.config.url).includes('api.vimeo.com')) {
      window.location.href = '/login';
    }

    return Promise.reject(false);
  }
);

export default instance;
