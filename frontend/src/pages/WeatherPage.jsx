import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Spinner, Form, Button, InputGroup } from 'react-bootstrap';
import {
  FaCloudSun, FaCloud, FaCloudRain, FaBolt, FaSnowflake,
  FaSmog, FaSun, FaWind, FaTint, FaArrowUp, FaEye,
  FaMapMarkerAlt, FaExclamationTriangle, FaInfoCircle,
  FaThermometerHalf, FaLeaf
} from 'react-icons/fa';
import axios from 'axios';

const CITY_COORDS = {
  'Nairobi':       { lat: -1.2921,  lon: 36.8219 },
  'Lagos':         { lat:  6.5244,  lon:  3.3792 },
  'Accra':         { lat:  5.6037,  lon: -0.1870 },
  'Kampala':       { lat:  0.3476,  lon: 32.5825 },
  'Dar es Salaam': { lat: -6.7924,  lon: 39.2083 },
  'Addis Ababa':   { lat:  9.0320,  lon: 38.7469 },
  'Kigali':        { lat: -1.9441,  lon: 30.0619 },
  'London':        { lat: 51.5074,  lon: -0.1278 },
  'New York':      { lat: 40.7128,  lon: -74.0060 },
  'Mumbai':        { lat: 19.0760,  lon: 72.8777 },
};

const weatherIconMap = {
  Clear:        { icon: <FaSun />,        bg: '#fff3e0', color: '#f59e0b' },
  Clouds:       { icon: <FaCloud />,      bg: '#f0f4f1', color: '#6b7280' },
  Rain:         { icon: <FaCloudRain />,  bg: '#e0f2fe', color: '#0369a1' },
  Drizzle:      { icon: <FaCloudRain />,  bg: '#e0f2fe', color: '#0369a1' },
  Thunderstorm: { icon: <FaBolt />,       bg: '#fce7f3', color: '#9d174d' },
  Snow:         { icon: <FaSnowflake />,  bg: '#e0f2fe', color: '#0ea5e9' },
  Mist:         { icon: <FaSmog />,       bg: '#f0f4f1', color: '#6b7280' },
  Fog:          { icon: <FaSmog />,       bg: '#f0f4f1', color: '#6b7280' },
};

const suggestionMap = {
  Rain:         { icon: <FaCloudRain />,        color: '#0369a1', text: 'Avoid spraying pesticides today. Postpone planting. Check drainage systems.' },
  Drizzle:      { icon: <FaCloudRain />,        color: '#0369a1', text: 'Light rain — delay field spraying. Monitor for fungal disease risk.' },
  Thunderstorm: { icon: <FaBolt />,             color: '#9d174d', text: 'Dangerous conditions. Stay indoors. Secure equipment and livestock.' },
  Snow:         { icon: <FaSnowflake />,        color: '#0ea5e9', text: 'Protect frost-sensitive crops. Delay planting of warm-season crops.' },
  Clear:        { icon: <FaSun />,              color: '#f59e0b', text: 'Ideal day for planting, fertilizing, and pest scouting.' },
  default:      { icon: <FaCloudSun />,         color: 'var(--primary)', text: 'Good conditions for routine farm activities.' },
  hot35:        { icon: <FaThermometerHalf />,  color: '#b91c1c', text: 'Extreme heat. Irrigate early morning or evening. Provide shade for seedlings.' },
  hot30:        { icon: <FaThermometerHalf />,  color: '#e76f51', text: 'High heat. Irrigate early morning or evening. Avoid heavy field work midday.' },
  cold:         { icon: <FaSnowflake />,        color: '#0ea5e9', text: 'Cold conditions. Protect frost-sensitive crops. Delay planting of warm-season crops.' },
};

const WeatherPage = () => {
  const [weather, setWeather]           = useState(null);
  const [forecast, setForecast]         = useState(null);
  const [suggestion, setSuggestion]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [locationDenied, setLocationDenied] = useState(false);
  const [manualCity, setManualCity]     = useState('');
  const [manualLat, setManualLat]       = useState('');
  const [manualLon, setManualLon]       = useState('');
  const [searchMode, setSearchMode]     = useState('city');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        ()  => { setLocationDenied(true); setLoading(false); }
      );
    } else {
      setLocationDenied(true);
      setLoading(false);
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    setLoading(true); setError('');
    try {
      const [wRes, fRes] = await Promise.all([
        axios.get(`/api/weather?lat=${lat}&lon=${lon}`),
        axios.get(`/api/weather/forecast?lat=${lat}&lon=${lon}`),
      ]);
      setWeather(wRes.data);
      setForecast(fRes.data);

      const cond = wRes.data.weather[0].main;
      const temp = wRes.data.main.temp;
      if (temp > 35)                                    setSuggestion(suggestionMap.hot35);
      else if (temp > 30)                               setSuggestion(suggestionMap.hot30);
      else if (temp < 10)                               setSuggestion(suggestionMap.cold);
      else if (suggestionMap[cond])                     setSuggestion(suggestionMap[cond]);
      else                                              setSuggestion(suggestionMap.default);
    } catch {
      setError('Failed to fetch weather data. Check your connection or try a different location.');
    }
    setLoading(false);
  };

  const handleCitySearch = () => {
    const coords = CITY_COORDS[manualCity];
    if (coords) fetchWeather(coords.lat, coords.lon);
    else setError(`City "${manualCity}" not found. Try entering coordinates manually.`);
  };

  const handleCoordsSearch = () => {
    const lat = parseFloat(manualLat), lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Enter valid latitude (−90 to 90) and longitude (−180 to 180).');
      return;
    }
    fetchWeather(lat, lon);
  };

  const getWeatherStyle = (main) => weatherIconMap[main] || { icon: <FaCloudSun />, bg: '#f0f4f1', color: '#4a6358' };

  /* ── Location denied screen ── */
  if (locationDenied && !weather) return (
    <>
      <div className="page-header">
        <h2>Weather Forecast</h2>
        <p>Enter your location to get real-time weather and farming suggestions.</p>
      </div>
      <Card className="dashboard-card" style={{ border: 'none', maxWidth: 520 }}>
        <Card.Body style={{ padding: '1.75rem' }}>
          <Alert variant="warning" style={{ fontSize: '.83rem' }}>
            <FaMapMarkerAlt className="me-2" />
            Location access was denied. Enter your location manually.
          </Alert>

          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem' }}>
            {['city', 'coords'].map(m => (
              <button key={m} onClick={() => setSearchMode(m)} style={{
                padding: '.35rem .9rem', borderRadius: 'var(--radius-full)',
                border: '1.5px solid', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600,
                borderColor: searchMode === m ? 'var(--primary)' : 'var(--border)',
                background: searchMode === m ? 'var(--primary)' : 'var(--surface)',
                color: searchMode === m ? '#fff' : 'var(--text-secondary)',
              }}>
                {m === 'city' ? 'Select City' : 'Enter Coordinates'}
              </button>
            ))}
          </div>

          {error && <Alert variant="danger" style={{ fontSize: '.8rem' }}>{error}</Alert>}

          {searchMode === 'city' ? (
            <InputGroup>
              <Form.Select value={manualCity} onChange={e => setManualCity(e.target.value)}>
                <option value="">— Select a city —</option>
                {Object.keys(CITY_COORDS).map(c => <option key={c}>{c}</option>)}
              </Form.Select>
              <Button className="btn btn-primary" onClick={handleCitySearch} disabled={!manualCity}>
                Get Weather
              </Button>
            </InputGroup>
          ) : (
            <Row className="g-2">
              <Col><Form.Control placeholder="Latitude (e.g. −1.29)" value={manualLat} onChange={e => setManualLat(e.target.value)} /></Col>
              <Col><Form.Control placeholder="Longitude (e.g. 36.82)" value={manualLon} onChange={e => setManualLon(e.target.value)} /></Col>
              <Col xs="auto"><Button className="btn btn-primary" onClick={handleCoordsSearch}>Go</Button></Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </>
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <Spinner animation="border" style={{ color: 'var(--primary)' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>Fetching weather data...</span>
    </div>
  );

  if (error && !weather) return (
    <>
      <Alert variant="danger">{error}</Alert>
      <Button className="btn btn-secondary" onClick={() => { setError(''); setLocationDenied(true); }}>
        Try Manual Location
      </Button>
    </>
  );

  if (!weather) return null;

  const ws = getWeatherStyle(weather.weather[0].main);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Weather Forecast</h2>
          {weather.name && <p><FaMapMarkerAlt className="me-1" style={{ color: 'var(--primary)' }} />{weather.name}, {weather.sys?.country}</p>}
        </div>
        {locationDenied && (
          <InputGroup style={{ maxWidth: 320 }}>
            <Form.Select size="sm" value={manualCity} onChange={e => setManualCity(e.target.value)}>
              <option value="">— Change city —</option>
              {Object.keys(CITY_COORDS).map(c => <option key={c}>{c}</option>)}
            </Form.Select>
            <Button size="sm" className="btn btn-primary" onClick={handleCitySearch} disabled={!manualCity}>Update</Button>
          </InputGroup>
        )}
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')} style={{ fontSize: '.83rem' }}>{error}</Alert>}

      {/* Current weather card */}
      <Row className="g-3 mb-4">
        <Col lg={5}>
          <Card className="dashboard-card h-100" style={{ border: 'none' }}>
            <Card.Body style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 'var(--radius-lg)',
                background: ws.bg, color: ws.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 1rem'
              }}>
                {ws.icon}
              </div>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                {Math.round(weather.main.temp)}°C
              </div>
              <div style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', margin: '.5rem 0', fontSize: '.9rem' }}>
                {weather.weather[0].description}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                Feels like {Math.round(weather.main.feels_like)}°C
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Row className="g-3 h-100">
            {[
              { icon: <FaTint />,             label: 'Humidity',    value: `${weather.main.humidity}%`,                                          bg: '#e0f2fe', color: '#0369a1' },
              { icon: <FaWind />,             label: 'Wind Speed',  value: `${weather.wind.speed} m/s`,                                          bg: '#f0f4f1', color: '#4a6358' },
              { icon: <FaArrowUp />,          label: 'Pressure',    value: `${weather.main.pressure} hPa`,                                       bg: '#fef9c3', color: '#a16207' },
              { icon: <FaEye />,              label: 'Visibility',  value: weather.visibility ? `${(weather.visibility/1000).toFixed(1)} km` : 'N/A', bg: '#f0f4f1', color: '#4a6358' },
            ].map(stat => (
              <Col xs={6} key={stat.label}>
                <Card className="dashboard-card h-100" style={{ border: 'none' }}>
                  <Card.Body style={{ padding: '1.25rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.6rem' }}>
                      {stat.icon}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stat.value}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{stat.label}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Farming suggestion */}
      {suggestion && (
        <Card className="dashboard-card mb-4" style={{ border: 'none', borderLeft: '3px solid var(--primary)' }}>
          <Card.Body style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-pale)', color: suggestion.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {suggestion.icon}
            </div>
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)', marginBottom: '.2rem' }}>
                <FaLeaf className="me-1" /> Farming Suggestion
              </div>
              <div style={{ fontSize: '.85rem', color: 'var(--text-primary)' }}>{suggestion.text}</div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 5-day forecast */}
      {forecast && (
        <Card className="dashboard-card" style={{ border: 'none' }}>
          <div className="card-header-clean"><h5>5-Day Forecast</h5></div>
          <Card.Body style={{ padding: '1.25rem' }}>
            <Row className="g-2">
              {forecast.list?.filter((_, i) => i % 8 === 0).slice(0, 5).map((f, i) => {
                const fs = getWeatherStyle(f.weather[0].main);
                return (
                  <Col key={i}>
                    <div style={{ textAlign: 'center', padding: '.75rem .5rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
                      <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '.5rem' }}>
                        {new Date(f.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: fs.bg, color: fs.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .5rem' }}>
                        {fs.icon}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{Math.round(f.main.temp)}°C</div>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '.2rem' }}>
                        {f.weather[0].description}
                      </div>
                      <div style={{ fontSize: '.68rem', color: '#0369a1', marginTop: '.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.2rem' }}>
                        <FaTint style={{ fontSize: '.6rem' }} />{f.main.humidity}%
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default WeatherPage;
