import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    coupon: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size, color } = action.payload;
      const existingIdx = state.items.findIndex(
        item => item.product === product._id && item.size === size && item.color === color
      );
      if (existingIdx >= 0) {
        state.items[existingIdx].quantity += quantity;
      } else {
        state.items.push({
          product: product._id,
          name: product.name,
          thumbnail: product.thumbnail,
          slug: product.slug,
          price: product.salePrice || product.price,
          originalPrice: product.price,
          quantity,
          size,
          color,
          sku: product.sku,
          stock: product.stock,
        });
      }
    },
    removeFromCart: (state, action) => {
      const { productId, size, color } = action.payload;
      state.items = state.items.filter(
        item => !(item.product === productId && item.size === size && item.color === color)
      );
    },
    updateQuantity: (state, action) => {
      const { productId, size, color, quantity } = action.payload;
      const item = state.items.find(
        item => item.product === productId && item.size === size && item.color === color
      );
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i !== item);
        } else {
          item.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
    },
    removeCoupon: (state) => {
      state.coupon = null;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;

// Selectors
export const selectCartItems = state => state.cart.items;
export const selectCartCount = state => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = state =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCoupon = state => state.cart.coupon;
export const selectCartTotal = state => {
  const subtotal = selectCartSubtotal(state);
  const coupon = state.cart.coupon;
  const discount = coupon ? coupon.discount : 0;

  // Pull live commerce settings (set in Admin > Settings > Commerce) instead of
  // hardcoding USD-era values ($100 threshold / $9.99 shipping / 8% tax), which
  // is what caused free shipping to trigger incorrectly after switching to INR.
  const settings = state.settings?.data || {};
  const freeShippingThreshold = Number(settings.free_shipping_threshold ?? 100);
  const shippingCost = Number(settings.shipping_cost ?? 9.99);
  const taxRate = Number(settings.tax_rate ?? 8);

  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const tax = subtotal * (taxRate / 100);
  return { subtotal, discount, shipping, tax, total: subtotal - discount + shipping + tax };
};

export default cartSlice.reducer;