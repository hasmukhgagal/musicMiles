import axios from './axios.service';
export default {
    getFanSummery(artistId, query) {
        let url = `artist/fan-summery?artist=${artistId}`;
        if(query) {
          url = `${url}&city=${query}`;
        }
        return axios.get(url)
    },
    getCitySummery(artistId) {
      const url = `artist/city-summery?artist=${artistId}`;
      return axios.get(url)
    },
    getHeatMapDate(artistId) {
      const url = `artist/heat-map?artist=${artistId}`;
      return axios.get(url)
    },
    getCityList(artistId) {
      const url = `artist/city-list?artist=${artistId}`;
      return axios.get(url);
    },
    getTopFanAtist(artistId) {
      const url =`artist/top-fan?artist=${artistId}`;
      return axios.get(url);
    },
    getTopSongArtist(artistId) {
      const url = `song/top?artist=${artistId}`;
      return axios.get(url);
    }
}