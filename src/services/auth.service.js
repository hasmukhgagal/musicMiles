import axios from './axios.service';

function setToken(response) {
  if (response) {
    const token = 'Bearer ' + response.token;

    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', token);
    axios.defaults.headers.Authorization = token;
  }
}

export default {
  async login(params) {
    const response = await axios.post('login?isCms=true', params);
    setToken(response);
    return response;
  },
  async logout() {
    const response = await axios.post('logout');
    if (response) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('vimeoToken');
    }

    return response;
  },
  async register(params) {
    const response = await axios.post('signup', params);
    setToken(response);
    return response;
  },
  verifyEmail(params) {
    return axios.post('verify-email', params);
  },
  forgotPassword(params) {
    return axios.post('forgot-password', params);
  },
  spotifyAuth(params) {
    return axios.post('auth/spotify', params)
  }
};
