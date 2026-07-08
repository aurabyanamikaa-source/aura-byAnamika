import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartItems, selectCartSubtotal, selectCartTotal,
  removeFromCart, updateQuantity
} from '../../store/slices/cartSlice';
import { selectSettings } from '../../store/slices/settingsSlice';

// Global cart drawer state
let setCartDrawerOpen = null;
export const openCartDrawer = () => setCartDrawerOpen?.(true);

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  setCartDrawerOpen = setOpen;

  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { currency_symbol = '$', free_shipping_threshold = 100 } = useSelector(selectSettings);
  const fmt = n => `${currency_symbol}${Number(n).toFixed(2)}`;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1999, transition: '0.3s',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: open ? 0 : '-420px', width: 420, maxWidth: '100vw',
        height: '100vh', background: '#fff', zIndex: 2000,
        transition: 'right 0.4s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>
            Shopping Cart ({items.length})
          </h3>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: 36, height: 36, borderRadius: '50%', background: '#f5f5f5',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#333',
            }}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <i className="bi bi-bag-x" style={{ fontSize: 56, display: 'block', marginBottom: 16 }}></i>
              <p style={{ fontSize: 15 }}>Your cart is empty</p>
              <button
                onClick={() => setOpen(false)}
                style={{
                  marginTop: 16, background: '#000', color: '#fff', borderRadius: 999,
                  padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={`${item.product}-${item.size}-${item.color}`}
                style={{
                  display: 'flex', gap: 14, marginBottom: 16,
                  paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <Link to={`/shop/${item.slug}`} onClick={() => setOpen(false)} style={{ flexShrink: 0 }}>
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    style={{ width: 76, height: 86, objectFit: 'cover', borderRadius: 10 }}
                  />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/shop/${item.slug}`}
                    onClick={() => setOpen(false)}
                    style={{ color: '#000', fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 4, lineHeight: 1.3 }}
                  >
                    {item.name}
                  </Link>
                  {(item.size || item.color) && (
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && '  ·  '}
                      {item.color && `Color: ${item.color}`}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Qty */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 0,
                      border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.product, size: item.size, color: item.color, quantity: item.quantity - 1 }))}
                        style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span style={{ padding: '4px 8px', fontSize: 13, fontWeight: 600 }}>{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.product, size: item.size, color: item.color, quantity: item.quantity + 1 }))}
                        style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                    <span style={{ fontWeight: 700, color: '#EF2853', fontSize: 15 }}>
                      {fmt(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(removeFromCart({ productId: item.product, size: item.size, color: item.color }))}
                  style={{ alignSelf: 'flex-start', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0 }}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13, color: '#666' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700, color: '#000', fontSize: 18 }}>{fmt(subtotal)}</span>
            </div>
            <p style={{ fontSize: 12, color: '#999', margin: '4px 0 16px' }}>
              {subtotal >= free_shipping_threshold ? '🎉 You qualify for free shipping!' : `Add ${fmt(free_shipping_threshold - subtotal)} more for free shipping`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  border: '2px solid #000', borderRadius: 999, color: '#000',
                  fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: '0.2s',
                }}
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  background: 'linear-gradient(90deg,#EF2853,#FFA31A)', borderRadius: 999,
                  color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                }}
              >
                Checkout <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}