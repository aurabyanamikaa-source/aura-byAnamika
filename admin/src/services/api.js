import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // File uploads (FormData) can legitimately take much longer than the 15s
  // default meant for normal JSON calls — especially on Render's free tier,
  // where a cold-started server plus sequential Cloudinary processing of
  // several images easily blows past 15s even though the upload eventually
  // succeeds. When that timeout fires, axios aborts the request client-side:
  // on localhost the file has usually already fully reached the server (fast
  // local transfer) so it finishes saving in the background and shows up on
  // refresh; on a slow/cold Render instance the transfer itself is often
  // still in flight when the abort happens, so nothing was saved at all.
  // Give any FormData request more headroom, without lowering timeouts a
  // caller has already raised on purpose (e.g. the video upload's 180s).
  if (config.data instanceof FormData) {
    config.timeout = Math.max(config.timeout || 0, 60000);
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;