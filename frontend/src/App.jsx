import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './App.css';

const API_BASE = 'http://localhost:8081/api';

function App() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [latestReading, setLatestReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/devices`)
      .then((res) => res.json())
      .then((data) => {
        setDevices(data);
        if (data.length > 0) setSelectedDevice(data[0]);
      })
      .catch((err) => setError('Failed to load devices: ' + err.message));
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;

    function fetchData() {
      fetch(`${API_BASE}/readings/latest/${selectedDevice}`)
        .then((res) => {
          if (!res.ok) throw new Error('No data yet for this device');
          return res.json();
        })
        .then((data) => {
          setLatestReading(data);
          setLastUpdated(new Date());
          setError(null);
        })
        .catch((err) => setError(err.message));

      const end = new Date().toISOString();
      const start = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      fetch(`${API_BASE}/readings/history/${selectedDevice}?start=${start}&end=${end}`)
        .then((res) => res.json())
        .then((data) => {
          const sorted = data
            .slice(-30)
            .map((r) => ({
              ...r,
              timeLabel: new Date(r.timestamp).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              }),
            }));
          setHistory(sorted);
        })
        .catch((err) => setError(err.message));
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedDevice]);

  return (
    <div className="dashboard">
      <header className="header">
        <h1> IoT Environmental Monitor</h1>
        <p className="subtitle">Real-time sensor telemetry dashboard</p>
      </header>

      {error && <div className="error-banner">⚠ {error}</div>}

      <div className="controls">
        <label htmlFor="device-select">Device</label>
        <select
          id="device-select"
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          {devices.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {lastUpdated && (
          <span className="live-indicator">
            <span className="pulse-dot" /> Live · updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {latestReading && (
        <div className="reading-cards">
          <div className="card card-temp">
            <div className="card-icon">🌡️</div>
            <div className="card-label">Temperature</div>
            <div className="card-value">{latestReading.temperature}<span>°C</span></div>
          </div>
          <div className="card card-humidity">
            <div className="card-icon">💧</div>
            <div className="card-label">Humidity</div>
            <div className="card-value">{latestReading.humidity}<span>%</span></div>
          </div>
          <div className="card card-soil">
            <div className="card-icon">🌱</div>
            <div className="card-label">Soil Moisture</div>
            <div className="card-value">{latestReading.soilMoisture}<span>%</span></div>
          </div>
        </div>
      )}

      <div className="panel">
        <h2>Trends — last hour</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
            <XAxis dataKey="timeLabel" stroke="#8b93a7" fontSize={12} minTickGap={40} />
            <YAxis stroke="#8b93a7" fontSize={12} />
            <Tooltip
              contentStyle={{ background: '#1c2130', border: '1px solid #333a4a', borderRadius: 8 }}
              labelStyle={{ color: '#8b93a7' }}
            />
            <Legend />
            <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff5e7b" strokeWidth={2.5} dot={false} />
	    <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#00e0ff" strokeWidth={2.5} dot={false} />
	    <Line type="monotone" dataKey="soilMoisture" name="Soil Moisture (%)" stroke="#00ffb0" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <h2>Recent Readings</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Temp (°C)</th>
                <th>Humidity (%)</th>
                <th>Soil Moisture (%)</th>
              </tr>
            </thead>
            <tbody>
              {history.slice().reverse().slice(0, 10).map((r) => (
                <tr key={r.id}>
                  <td>{r.timeLabel}</td>
                  <td>{r.temperature}</td>
                  <td>{r.humidity}</td>
                  <td>{r.soilMoisture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;