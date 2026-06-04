import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import {
  FaTractor, FaLeaf, FaShoppingCart, FaBug, FaHistory, FaFlask
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, CartesianGrid, PieChart, Pie, Legend
} from 'recharts';
import axios from 'axios';

/* Same color map as the dashboard bar chart */
const STAGE_COLORS = {
  Germination: '#52b788',
  Vegetative:  '#2d6a4f',
  Flowering:   '#f4a261',
  Harvest:     '#e76f51',
};

/* Pie chart colors for activity breakdown */
const PIE_COLORS = ['#2d6a4f', '#52b788', '#f4a261', '#e76f51', '#0ea5e9'];

const StatCard = ({ value, label, icon, variant = 'green' }) => (
  <Card className="dashboard-card" style={{ border: 'none' }}>
    <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
      <div className={`metric-icon ${variant}`}>{icon}</div>
      <div className="metric-value" style={{ fontSize: '1.6rem' }}>{value}</div>
      <div className="metric-label">{label}</div>
    </Card.Body>
  </Card>
);

/* Custom tooltip shared by both charts */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 10, padding: '.6rem .9rem',
      boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: 12
    }}>
      <div style={{ fontWeight: 700, marginBottom: '.25rem', color: 'var(--text-primary)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: 'var(--text-secondary)' }}>
          {p.name}: <strong style={{ color: 'var(--text-primary)' }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const statusClass = {
  Pending:   'status-pending',
  Shipped:   'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
};

const FarmerAnalytics = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    axios.get('/api/admin/farmer-analytics')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load analytics data.'); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <Spinner animation="border" style={{ color: 'var(--primary)' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>Loading analytics...</span>
    </div>
  );

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data)  return null;

  /* ── Chart data ── */
  const stageData    = Object.entries(data.stageCounts).map(([stage, count]) => ({ stage, count }));
  const activityData = Object.entries(data.activityTypeCounts).map(([type, count]) => ({ type, count }));

  return (
    <>
      <div className="page-header">
        <h2>My Analytics</h2>
        <p>Farm performance, crop progress, and resource overview.</p>
      </div>

      {/* KPI cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard value={data.totalFarms}      label="Total Farms"       icon={<FaTractor />}      variant="green"  /></Col>
        <Col xs={6} md={3}><StatCard value={data.activeCrops}     label="Active Crops"      icon={<FaLeaf />}         variant="green"  /></Col>
        <Col xs={6} md={3}><StatCard value={data.harvestedCrops}  label="Harvested Crops"   icon={<FaHistory />}      variant="orange" /></Col>
        <Col xs={6} md={3}><StatCard value={data.totalActivities} label="Total Activities"  icon={<FaTractor />}      variant="blue"   /></Col>
        <Col xs={6} md={3}><StatCard value={data.totalOrders}     label="Orders Placed"     icon={<FaShoppingCart />} variant="blue"   /></Col>
        <Col xs={6} md={3}><StatCard value={`₱${data.totalSpent.toFixed(2)}`} label="Total Spent" icon={<FaShoppingCart />} variant="orange" /></Col>
        <Col xs={6} md={3}><StatCard value={data.pendingAlerts}   label="Pending Alerts"    icon={<FaBug />}          variant="red"    /></Col>
      </Row>

      {/* Crops by Growth Stage + Activity Breakdown */}
      <Row className="g-3 mb-4">

        {/* ── Crops bar chart — same design as dashboard ── */}
        <Col lg={7}>
          <Card className="dashboard-card h-100" style={{ border: 'none' }}>
            <div className="card-header-clean"><h5>Crops by Growth Stage</h5></div>
            <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
              {stageData.every(d => d.count === 0) ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: '.83rem' }}>
                  No active crops to display.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={stageData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                  >
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="stage"
                      width={90}
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Crops">
                      {stageData.map((s, i) => (
                        <Cell key={i} fill={STAGE_COLORS[s.stage] || 'var(--primary)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Stage legend */}
              {!stageData.every(d => d.count === 0) && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '.75rem' }}>
                  {stageData.map(s => (
                    <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem', color: 'var(--text-secondary)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: STAGE_COLORS[s.stage] || 'var(--primary)', flexShrink: 0 }} />
                      {s.stage}: <strong>{s.count}</strong>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ── Activity pie chart ── */}
        <Col lg={5}>
          <Card className="dashboard-card h-100" style={{ border: 'none' }}>
            <div className="card-header-clean"><h5>Activity Breakdown</h5></div>
            <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
              {activityData.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: '.83rem' }}>
                  No activities logged yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {activityData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }}
                      formatter={(v, n) => [v, n]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: '.5rem' }}
                      formatter={name => name.charAt(0).toUpperCase() + name.slice(1)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Activity trend */}
      <Card className="dashboard-card mb-4" style={{ border: 'none' }}>
        <div className="card-header-clean"><h5>Farm Activity Trend — Last 6 Months</h5></div>
        <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
          {data.activityTrend.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '.83rem' }}>
              No activity data for the last 6 months.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.activityTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Activities"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card.Body>
      </Card>

      {/* Recent orders */}
      <Card className="dashboard-card mb-4" style={{ border: 'none' }}>
        <div className="card-header-clean"><h5>Recent Orders</h5></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.recentOrders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td style={{ fontSize: '.8rem' }}>{order.products?.length || 0} item(s)</td>
                  <td style={{ fontWeight: 700 }}>₱{order.totalAmount?.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${statusClass[order.status] || 'badge-neutral'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recentOrders.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent soil readings */}
      <Card className="dashboard-card" style={{ border: 'none' }}>
        <div className="card-header-clean">
          <h5><FaFlask className="me-2" style={{ color: 'var(--primary)' }} />Recent Soil Health Readings</h5>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr><th>Date</th><th>Moisture (%)</th><th>pH</th><th>Nitrogen</th><th>Phosphorus</th><th>Potassium</th></tr>
            </thead>
            <tbody>
              {data.recentSoilRecords.map(s => (
                <tr key={s._id}>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                    {s.date ? new Date(s.date).toLocaleDateString() : '—'}
                  </td>
                  <td>{s.moisture ?? '—'}</td>
                  <td>{s.ph ?? '—'}</td>
                  <td>{s.nitrogen ?? '—'}</td>
                  <td>{s.phosphorus ?? '—'}</td>
                  <td>{s.potassium ?? '—'}</td>
                </tr>
              ))}
              {data.recentSoilRecords.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No soil readings recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default FarmerAnalytics;
