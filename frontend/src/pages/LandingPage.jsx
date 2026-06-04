import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaTractor, FaLeaf, FaCloudSun, FaBug, FaShoppingCart,
  FaUsers, FaChartLine, FaUserMd, FaSeedling, FaArrowRight, FaCheckCircle
} from 'react-icons/fa';

const features = [
  { icon: <FaTractor />, title: 'Farm Management', desc: 'Set up farm profiles, log activities, and track resource usage across all your farms.' },
  { icon: <FaLeaf />, title: 'Crop Tracking', desc: 'Monitor growth stages, record soil health, and get data-driven recommendations.' },
  { icon: <FaCloudSun />, title: 'Weather Forecasting', desc: 'Real-time weather with 5-day forecasts and actionable farming suggestions.' },
  { icon: <FaBug />, title: 'Pest & Disease Alerts', desc: 'Receive community alerts, preventive measures, and treatment guidance.' },
  { icon: <FaShoppingCart />, title: 'Resource Marketplace', desc: 'Purchase seeds, fertilizers, pesticides, and equipment in one place.' },
  { icon: <FaUserMd />, title: 'Expert Consultation', desc: 'Book sessions with certified agricultural experts for personalized advice.' },
  { icon: <FaUsers />, title: 'Community Forum', desc: 'Share experiences, ask questions, and learn from fellow farmers.' },
  { icon: <FaChartLine />, title: 'Analytics & Reports', desc: 'Track farm performance, resource usage, and crop yields over time.' },
];

const benefits = [
  'Admin-approved accounts for a trusted community',
  'Real-time pest broadcast alerts to all farmers',
  'Soil health monitoring with nutrient recommendations',
  'Harvest history and yield tracking',
];

const LandingPage = () => (
  <>
    {/* Hero */}
    <section className="hero-section">
      <Container>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-badge">
            <FaSeedling /> Smart Farming Platform
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
            Modern Tools for<br />Modern Farmers
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: .8, marginBottom: '2rem', lineHeight: 1.7 }}>
            Agri-Tech brings weather forecasting, soil monitoring, pest alerts, marketplace,
            expert consultations, and community forums into one professional platform.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              as={Link} to="/register"
              style={{
                background: '#fff', color: 'var(--primary-dark)',
                border: 'none', fontWeight: 700,
                padding: '.7rem 1.75rem', borderRadius: 'var(--radius-lg)',
                fontSize: '.9rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem'
              }}
            >
              Get Started Free <FaArrowRight />
            </Button>
            <Button
              as={Link} to="/login"
              style={{
                background: 'rgba(255,255,255,.12)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,.3)', fontWeight: 600,
                padding: '.7rem 1.75rem', borderRadius: 'var(--radius-lg)', fontSize: '.9rem'
              }}
            >
              Sign In
            </Button>
          </div>
        </div>
      </Container>
    </section>

    {/* Benefits strip */}
    <div style={{ background: 'var(--primary)', padding: '.9rem 0' }}>
      <Container>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#fff', fontSize: '.8rem', fontWeight: 500 }}>
              <FaCheckCircle style={{ color: 'var(--primary-pale)', flexShrink: 0 }} />
              {b}
            </div>
          ))}
        </div>
      </Container>
    </div>

    {/* Features */}
    <section style={{ padding: '5rem 0', background: 'var(--surface-2)' }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', marginBottom: '.5rem' }}>
            Everything You Need
          </p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Built for Serious Farmers
          </h2>
        </div>
        <Row className="g-3">
          {features.map((f, i) => (
            <Col md={6} lg={3} key={i}>
              <div className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h5 style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: '.4rem', color: 'var(--text-primary)' }}>{f.title}</h5>
                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>

    {/* CTA */}
    <section style={{ padding: '4rem 0', background: 'var(--surface)' }}>
      <Container>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
          borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', textAlign: 'center', color: '#fff'
        }}>
          <h2 style={{ fontWeight: 800, marginBottom: '.75rem' }}>Ready to transform your farm?</h2>
          <p style={{ opacity: .8, marginBottom: '1.75rem', fontSize: '.95rem' }}>
            Join thousands of farmers already using Agri-Tech to grow smarter.
          </p>
          <Button
            as={Link} to="/register"
            style={{
              background: '#fff', color: 'var(--primary-dark)',
              border: 'none', fontWeight: 700,
              padding: '.75rem 2rem', borderRadius: 'var(--radius-lg)', fontSize: '.9rem'
            }}
          >
            Create Free Account
          </Button>
        </div>
      </Container>
    </section>

    {/* Footer */}
    <footer style={{ background: 'var(--primary-dark)', color: 'rgba(255,255,255,.5)', padding: '1.5rem 0', textAlign: 'center', fontSize: '.78rem' }}>
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginBottom: '.25rem', color: '#fff' }}>
          <FaSeedling /> <strong>Agri-Tech</strong>
        </div>
        <p style={{ margin: 0 }}>Smart farming platform — empowering farmers with technology.</p>
      </Container>
    </footer>
  </>
);

export default LandingPage;
