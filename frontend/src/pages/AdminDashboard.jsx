import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Tabs, Tab, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaLeaf, FaBox, FaCalendarAlt, FaChartLine, FaTools, FaTicketAlt } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [crops, setCrops] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/users')) return 'users';
    if (path.includes('/products')) return 'products';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/crops')) return 'crops';
    if (path.includes('/support')) return 'support';
    if (path.includes('/maintenance')) return 'maintenance';
    if (path.includes('/analytics')) return 'analytics';
    return 'users';
  };

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const endpoints = [
        '/api/admin/users',
        '/api/admin/products',
        '/api/admin/bookings',
        '/api/admin/crops',
        '/api/admin/tickets',
        '/api/admin/analytics',
        '/api/admin/logs'
      ];
      const results = await Promise.allSettled(
        endpoints.map(url => axios.get(url, { signal: controller.signal }))
      );
      clearTimeout(timeoutId);

      const [usersRes, productsRes, bookingsRes, cropsRes, ticketsRes, analyticsRes, logsRes] = results;
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
      if (cropsRes.status === 'fulfilled') setCrops(cropsRes.value.data);
      if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value.data);
    } catch (err) {
      setError('Failed to load admin data. Check backend and token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const approveUser = async (userId) => {
    await axios.put(`/api/admin/approve/${userId}`);
    fetchAllData();
    setMessage('User approved');
    setTimeout(() => setMessage(''), 2000);
  };

  const banUser = async (userId) => {
    await axios.put(`/api/admin/ban/${userId}`);
    fetchAllData();
    setMessage('User banned');
  };

  const unbanUser = async (userId) => {
    await axios.put(`/api/admin/unban/${userId}`);
    fetchAllData();
    setMessage('User unbanned');
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Delete user permanently?')) {
      await axios.delete(`/api/admin/user/${userId}`);
      fetchAllData();
      setMessage('User deleted');
    }
  };

  const saveProduct = async () => {
    if (editingProduct._id) {
      await axios.put(`/api/admin/products/${editingProduct._id}`, editingProduct);
    } else {
      await axios.post('/api/admin/products', editingProduct);
    }
    setShowProductModal(false);
    setEditingProduct(null);
    fetchAllData();
    setMessage('Product saved');
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete product?')) {
      await axios.delete(`/api/admin/products/${id}`);
      fetchAllData();
      setMessage('Product deleted');
    }
  };

  const updateBookingStatus = async (id, status) => {
    await axios.put(`/api/admin/booking/${id}`, { status });
    fetchAllData();
    setMessage('Booking updated');
  };

  const respondToTicket = async (id, response) => {
    await axios.post(`/api/admin/ticket/${id}/respond`, { response });
    fetchAllData();
    setMessage('Response sent');
  };

  const runMaintenance = async () => {
    await axios.post('/api/admin/maintenance');
    fetchAllData();
    setMessage('Maintenance run: old alerts cleared');
  };

  const deleteCropAdmin = async (cropId) => {
    if (window.confirm('Delete this crop?')) {
      await axios.delete(`/api/admin/crop/${cropId}`);
      fetchAllData();
      setMessage('Crop deleted');
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="brown" /></div>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container fluid className="py-4">
      {message && <Alert variant="success">{message}</Alert>}
      <h2 className="mb-4">Admin Dashboard</h2>

      <Row className="g-3 mb-4">
        <Col md={2}><Card className="dashboard-card text-center"><Card.Body><h3>{analytics.totalUsers || 0}</h3><small>Total Users</small></Card.Body></Card></Col>
        <Col md={2}><Card className="dashboard-card text-center"><Card.Body><h3>{analytics.approvedUsers || 0}</h3><small>Approved</small></Card.Body></Card></Col>
        <Col md={2}><Card className="dashboard-card text-center"><Card.Body><h3>{analytics.totalOrders || 0}</h3><small>Orders</small></Card.Body></Card></Col>
        <Col md={2}><Card className="dashboard-card text-center"><Card.Body><h3>${analytics.totalRevenue || 0}</h3><small>Revenue</small></Card.Body></Card></Col>
        <Col md={2}><Card className="dashboard-card text-center"><Card.Body><h3>{analytics.pendingBookings || 0}</h3><small>Pending Bookings</small></Card.Body></Card></Col>
        <Col md={2}><Card className="dashboard-card text-center"><Card.Body><h3>{analytics.alertsCount || 0}</h3><small>Active Alerts</small></Card.Body></Card></Col>
      </Row>

      <Card className="dashboard-card mb-4">
        <Card.Body>
          <Card.Title>Monthly Revenue Trend</Card.Title>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.monthlyOrders || []}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#7a5a4b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-3">
        <Tab eventKey="users" title={<><FaUsers /> Users</>}>
          <Card className="dashboard-card"><Card.Body><h4>User Management</h4>
            {users.length === 0 ? <p>No users found.</p> : (
              <Table striped hover><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Approved</th><th>Banned</th><th>Actions</th></tr></thead>
              <tbody>{users.map(u => (<tr key={u._id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td>{u.approved ? '✅' : '❌'}</td><td>{u.banned ? '🚫' : '✓'}</td>
                <td>{!u.approved && <Button size="sm" className="btn-brown me-1" onClick={() => approveUser(u._id)}>Approve</Button>}
                {!u.banned ? <Button size="sm" variant="warning" onClick={() => banUser(u._id)}>Ban</Button> : <Button size="sm" variant="success" onClick={() => unbanUser(u._id)}>Unban</Button>}
                <Button size="sm" variant="danger" onClick={() => deleteUser(u._id)}>Delete</Button></td>
              </tr>))}</tbody></Table>
            )}
          </Card.Body></Card>
        </Tab>

        <Tab eventKey="products" title={<><FaBox /> Products</>}>
          <Card className="dashboard-card"><Card.Body>
            <div className="d-flex justify-content-between"><h4>Inventory</h4><Button className="btn-brown" onClick={() => { setEditingProduct({}); setShowProductModal(true); }}>+ Add Product</Button></div>
            {products.length === 0 ? <p>No products.</p> : (
              <Table striped><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>{products.map(p => (<tr key={p._id}><td>{p.name}</td><td>{p.category}</td><td>₱{p.price}</td><td>{p.stock}</td>
              <td><Button size="sm" variant="outline-brown" onClick={() => { setEditingProduct(p); setShowProductModal(true); }}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => deleteProduct(p._id)}>Delete</Button></td></tr>))}</tbody></Table>
            )}
          </Card.Body></Card>
        </Tab>

        <Tab eventKey="bookings" title={<><FaCalendarAlt /> Bookings</>}>
          <Card className="dashboard-card"><Card.Body><h4>Service Bookings</h4>
            {bookings.length === 0 ? <p>No bookings.</p> : (
              <Table striped><thead><tr><th>User</th><th>Service</th><th>Details</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{bookings.map(b => (<tr key={b._id}>
                <td>{b.userId?.name}</td><td>{b.serviceType}</td><td>{b.details}</td>
                <td>{new Date(b.scheduledDate).toLocaleDateString()}</td>
                <td><Badge bg={b.status==='Pending'?'warning':'success'}>{b.status}</Badge></td>
                <td><Form.Select size="sm" style={{width:'120px'}} onChange={e=>updateBookingStatus(b._id, e.target.value)}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></Form.Select></td>
              </tr>))}</tbody></Table>
            )}
          </Card.Body></Card>
        </Tab>

        <Tab eventKey="crops" title={<><FaLeaf /> Crops</>}>
          <Card className="dashboard-card"><Card.Body><h4>All Crops</h4>
            {crops.length === 0 ? <p>No crops.</p> : (
              <Table striped><thead><tr><th>Crop Type</th><th>Farm</th><th>Stage</th><th>Soil Moisture</th><th>Actions</th></tr></thead>
              <tbody>{crops.map(c => (<tr key={c._id}>
                <td>{c.type}</td><td>{c.farmId?.name}</td><td>{c.growthStage}</td><td>{c.soilMoisture}%</td>
                <td><Button size="sm" variant="danger" onClick={() => deleteCropAdmin(c._id)}>Delete</Button></td>
              </tr>))}</tbody></Table>
            )}
          </Card.Body></Card>
        </Tab>

        <Tab eventKey="support" title={<><FaTicketAlt /> Support</>}>
          <Card className="dashboard-card"><Card.Body><h4>Support Tickets</h4>
            {tickets.length === 0 ? <p>No tickets.</p> : tickets.map(t => (
              <Card key={t._id} className="mb-2"><Card.Body>
                <strong>{t.userId?.name}:</strong> {t.subject}<br/>{t.message}<br/>
                <Form.Control as="textarea" placeholder="Your response..." id={`resp-${t._id}`}/>
                <Button className="btn-brown mt-2" onClick={()=>respondToTicket(t._id, document.getElementById(`resp-${t._id}`).value)}>Send Response</Button>
              </Card.Body></Card>
            ))}
          </Card.Body></Card>
        </Tab>

        <Tab eventKey="maintenance" title={<><FaTools /> System</>}>
          <Card className="dashboard-card"><Card.Body><h4>System Maintenance</h4>
            <p>Status: {logs.status || 'Unknown'}</p><p>Uptime: {Math.round(logs.uptime || 0)} sec</p>
            <Button className="btn-brown" onClick={runMaintenance}>Run Maintenance</Button>
            <hr/><h5>Recent Activity</h5>
            <Table><thead><tr><th>Recent Users</th><th>Recent Orders</th></tr></thead>
            <tbody><tr><td>{logs.recentUsers?.map(u=><div key={u._id}>{u.name}</div>)}</td>
            <td>{logs.recentOrders?.map(o=><div key={o._id}>${o.totalAmount}</div>)}</td></tr></tbody></Table>
          </Card.Body></Card>
        </Tab>

        <Tab eventKey="analytics" title={<><FaChartLine /> Analytics</>}>
          <Card className="dashboard-card"><Card.Body><h4>Data Insights</h4>
            <p>Total Farms: {analytics.totalFarms || 0}</p>
            <p>Total Crops: {analytics.totalCrops || 0}</p>
            <p>Active Alerts: {analytics.alertsCount || 0}</p>
            <p>Approval Rate: {analytics.totalUsers ? Math.round((analytics.approvedUsers/analytics.totalUsers)*100) : 0}%</p>
          </Card.Body></Card>
        </Tab>
      </Tabs>

      <Modal show={showProductModal} onHide={()=>setShowProductModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editingProduct?._id ? 'Edit' : 'Add'} Product</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form><Form.Group><Form.Label>Name</Form.Label><Form.Control value={editingProduct?.name||''} onChange={e=>setEditingProduct({...editingProduct,name:e.target.value})}/></Form.Group>
          <Form.Group><Form.Label>Category</Form.Label><Form.Select value={editingProduct?.category||'seed'} onChange={e=>setEditingProduct({...editingProduct,category:e.target.value})}><option>seed</option><option>fertilizer</option><option>pesticide</option><option>equipment</option></Form.Select></Form.Group>
          <Form.Group><Form.Label>Price</Form.Label><Form.Control type="number" value={editingProduct?.price||0} onChange={e=>setEditingProduct({...editingProduct,price:e.target.value})}/></Form.Group>
          <Form.Group><Form.Label>Stock</Form.Label><Form.Control type="number" value={editingProduct?.stock||0} onChange={e=>setEditingProduct({...editingProduct,stock:e.target.value})}/></Form.Group>
          <Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" value={editingProduct?.description||''} onChange={e=>setEditingProduct({...editingProduct,description:e.target.value})}/></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>setShowProductModal(false)}>Cancel</Button><Button className="btn-brown" onClick={saveProduct}>Save</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;