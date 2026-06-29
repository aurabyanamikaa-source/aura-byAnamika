import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const adminLogin = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    if (!['admin', 'super_admin'].includes(data.data.role)) {
      return rejectWithValue('Access denied. Admin privileges required.');
    }
    localStorage.setItem('adminToken', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchAdminMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    if (!['admin', 'super_admin'].includes(data.data.role)) throw new Error('Not admin');
    return data.data;
  } catch (err) {
    localStorage.removeItem('adminToken');
    return rejectWithValue('Not authorized');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    admin: null,
    token: localStorage.getItem('adminToken'),
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.token = null;
      localStorage.removeItem('adminToken');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(adminLogin.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(adminLogin.fulfilled, (s, a) => { s.loading = false; s.admin = a.payload.data; s.token = a.payload.token; })
     .addCase(adminLogin.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(fetchAdminMe.fulfilled, (s, a) => { s.admin = a.payload; s.initialized = true; })
     .addCase(fetchAdminMe.rejected, (s) => { s.admin = null; s.token = null; s.initialized = true; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
