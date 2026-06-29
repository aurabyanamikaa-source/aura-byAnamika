import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ---- Wishlist Slice ----
export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/wishlist/toggle', { productId });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {
    setWishlist: (state, action) => { state.items = action.payload; },
    localToggleWishlist: (state, action) => {
      const idx = state.items.indexOf(action.payload);
      if (idx >= 0) state.items.splice(idx, 1);
      else state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(toggleWishlist.fulfilled, (state, action) => {
      state.items = action.payload.wishlist;
    });
  },
});

export const { setWishlist, localToggleWishlist } = wishlistSlice.actions;
export const selectWishlistItems = state => state.wishlist.items;
export const selectWishlistCount = state => state.wishlist.items.length;
export const isInWishlist = (productId) => state => state.wishlist.items.includes(productId);
export const wishlistReducer = wishlistSlice.reducer;
export default wishlistSlice.reducer;
