import axios from 'axios';

const api = axios.create({
  baseURL: 'https://687319aac75558e273535336.mockapi.io/api',
  timeout: 5000,
});

export default api;
