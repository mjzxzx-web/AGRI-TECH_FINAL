import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FaSeedling, FaUser, FaEnvelope, FaLock, FaUserTag, FaArrowRight, FaCheckCircle, FaClock } from 'react-icons/fa';

const Register = () => {
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: 'farmer' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [pending, setPending]   = useState(null); // { msg, role }
  const { loginWithToken }      = useContext(AuthContext);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', form);

      // Account created but needs approval (no token returned)
      if (res.data.approved === false) {
        setPending({ msg: res.data.msg, role: form.role });
        setLoading(false);
        return;
      }

      // First admin — register returned a token directly.
      // Set it in axios + localStorage via the AuthContext loginWithToken helper,
      // avoiding a redundant second /login round-trip that could race.
      if (res.data.token) {
        loginWithToken(res.data.token, res.data.user);
        navigate('/');
        return;
      }

      // Fallback (shouldn't happen)
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pending approval screen
  if (pending) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ maxWidth: 440 }}>
          <div className="auth-card-header">
            <div className="auth-logo"><FaClock /></div>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '.25rem' }}>Account Pending Approval</h2>
            <p style={{ opacity: .7, fontSize: '.83rem', margin: 0 }}>
              {pending.role === 'admin' ? 'Admin account created' : 'Farmer account created'}
            </p>
          </div>
          <div className="auth-card-body" style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fef9c3', color: '#a16207',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', margin: '0 auto 1.25rem'
            }}>
              <FaClock />
            </div>
            <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {pending.msg}
            </p>
            <Link to="/login">
              <Button className="btn btn-primary w-100">Go to Login</Button>
            </Link>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/" style={{ fontSize: '.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const helpText = {
    farmer: 'Farmer accounts require admin approval before first login.',
    admin:  'If an admin already exists, your account will need their approval. The very first admin is approved automatically.',
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-card-header">
          <div className="auth-logo"><FaSeedling /></div>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '.25rem' }}>Create your account</h2>
          <p style={{ opacity: .7, fontSize: '.83rem', margin: 0 }}>Start your smart farming journey today</p>
        </div>

        <div className="auth-card-body">
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label><FaUser className="me-1" style={{ color: 'var(--primary)' }} /> Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Farmer"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaEnvelope className="me-1" style={{ color: 'var(--primary)' }} /> Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaLock className="me-1" style={{ color: 'var(--primary)' }} /> Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label><FaUserTag className="me-1" style={{ color: 'var(--primary)' }} /> Account Type</Form.Label>
              <Form.Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="farmer">Farmer — Access farm tools, marketplace &amp; forum</option>
                <option value="admin">Admin — Manage system, users &amp; inventory</option>
              </Form.Select>
              <Form.Text style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>
                {helpText[form.role]}
              </Form.Text>
            </Form.Group>

            <Button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
              {loading
                ? <Spinner animation="border" size="sm" />
                : <><span>Create Account</span> <FaArrowRight /></>}
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.82rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: '.75rem' }}>
            <Link to="/" style={{ fontSize: '.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
