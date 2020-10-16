import axios from './axios.service';
export default {
    getAppleToken() {
      const url = `apple/token`;
      return axios.get(url)
    },
    saveAppleAuth(data) {
      const url = `/auth/apple`;
      return axios.post(url, data)
    },
    checkAppleAuth(data) {
      const url = `/check/auth/apple`;
      return axios.post(url, data)
    },
}