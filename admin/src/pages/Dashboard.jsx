import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';

const COLORS = ['#EF2853', '#FFA31A', '#3b82f6', '#22c55e', '#8b5cf6'];

function StatCard({ icon, label, value, change, color, bg }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change && <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
          <i className={`bi bi-arrow-${change >= 0 ? 'up' : 'down'}-short`}></i>
          {Math.abs(change)}% vs last month
        </div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders/admin/stats'),
          api.get('/products/admin/stats'),
          api.get('/users/admin/stats'),
        ]);
        const orderData = ordersRes.data.data;
        setStats({
          revenue: orderData.totalRevenue || 0,
          orders: orderData.totalOrders || 0,
          pending: orderData.pendingOrders || 0,
          products: productsRes.data.data.total || 0,
          customers: usersRes.data.data.total || 0,
          thisMonth: usersRes.data.data.thisMonth || 0,
        });
        // Build revenue chart data (last 30 days)
        const days = orderData.revenueByDay || [];
        const chartData = days.map(d => ({
          date: d._id.slice(5), // MM-DD
          revenue: Math.round(d.revenue),
          orders: d.orders,
        }));
        setRevenueData(chartData);
        // Recent orders
        const ordersListRes = await api.get('/orders/admin/all?limit=5');
        setRecentOrders(ordersListRes.data.data || []);
        // Top products
        const productsListRes = await api.get('/products?sort=popular&limit=5');
        setTopProducts(productsListRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusColor = { pending: 'warning', processing: 'info', shipped: 'purple', delivered: 'success', cancelled: 'danger' };
  const fmt = n => `₹${Number(n || 0).toFixed(2)}`;

  const pieData = [
    { name: 'Delivered', value: recentOrders.filter(o => o.status === 'delivered').length },
    { name: 'Processing', value: recentOrders.filter(o => o.status === 'processing').length },
    { name: 'Pending', value: recentOrders.filter(o => o.status === 'pending').length },
    { name: 'Shipped', value: recentOrders.filter(o => o.status === 'shipped').length },
    { name: 'Cancelled', value: recentOrders.filter(o => o.status === 'cancelled').length },
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Welcome back! Here's what's happening in your store.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/products/new" className="btn btn-primary">
            <i className="bi bi-plus-lg"></i> Add Product
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon="bi-currency-rupee" label="Total Revenue" value={fmt(stats.revenue)} change={12} color="#EF2853" bg="rgba(239,40,83,0.1)" />
        <StatCard icon="bi-bag-check" label="Total Orders" value={stats.orders || 0} change={8} color="#3b82f6" bg="rgba(59,130,246,0.1)" />
        <StatCard icon="bi-clock-history" label="Pending Orders" value={stats.pending || 0} color="#f97316" bg="rgba(249,115,22,0.1)" />
        <StatCard icon="bi-box-seam" label="Total Products" value={stats.products || 0} color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
        <StatCard icon="bi-people" label="Total Customers" value={stats.customers || 0} change={stats.thisMonth} color="#22c55e" bg="rgba(34,197,94,0.1)" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue (Last 30 Days)</span>
          </div>
          <div style={{ padding: '20px 10px 10px' }}>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#EF2853" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14 }}>
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* Order Status Pie */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Order Status</span>
          </div>
          <div style={{ padding: 20 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14 }}>
                No order data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Orders</span>
            <Link to="/orders" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No orders yet</td></tr>
                ) : recentOrders.map(order => (
                  <tr key={order._id}>
                    <td><Link to={`/orders/${order._id}`} style={{ color: '#EF2853', fontWeight: 600 }}>#{order.orderNumber}</Link></td>
                    <td style={{ fontSize: 13 }}>{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</td>
                    <td><span className={`badge badge-${statusColor[order.status] || 'gray'}`}>{order.status}</span></td>
                    <td style={{ fontWeight: 600 }}>{fmt(order.total)}</td>
                    <td style={{ fontSize: 12, color: '#999' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Products</span>
            <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div style={{ padding: '0 16px' }}>
            {topProducts.map((product, i) => (
              <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i < topProducts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <img src={product.thumbnail} alt={product.name} style={{ width: 44, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{product.soldCount || 0} sold</div>
                </div>
                <div style={{ fontWeight: 700, color: '#EF2853', fontSize: 14 }}>₹{(product.salePrice || product.price)?.toFixed(2)}</div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: '#999', fontSize: 14 }}>No products yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}