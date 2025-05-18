import { useState, useEffect } from 'react'
import { ClipLoader} from 'react-spinners';
import getDataApi from './api/getDataApi';
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [tempUnit, setTempUnit] = useState('C')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [temperature, setTemperature] = useState(null)
  const [humidity, setHumidity] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const GetApi = async() => {
        const data = await getDataApi.getData();

        console.log(data)
        setHumidity(data.hum);
        setTemperature(data.temp);
        setLoading(false);
    };

    GetApi();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Convert temperature when unit changes
  const handleUnitChange = (unit) => {
    if (unit === tempUnit) return;
    
    if (unit === 'F') {
      // Convert from Celsius to Fahrenheit: (C × 9/5) + 32
      setTemperature(Math.round((temperature * 9/5) + 32));
    } else {
      // Convert from Fahrenheit to Celsius: (F - 32) × 5/9
      setTemperature(Math.round((temperature - 32) * 5/9));
    }
    
    setTempUnit(unit);
  };

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date) => {
    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    return date.toLocaleTimeString('en-US', options);
  };

  return (
    <div className="weather-app">
      {loading ? (
        <div className="loading-container">
          <ClipLoader color="#66a6ff" size={50} />
          <p>Loading weather data...</p>
        </div>
      ) : (
        <>
          {/* Left Sidebar */}
          <div className="sidebar">
            <div className="weather-info">
              <div className="cloud-bg">
                <span className="material-icons cloud-icon">cloud</span>
              </div>
              <div className="current-temp">{temperature}<sup>°{tempUnit}</sup></div>
              <div className="weather-condition">Scattered clouds</div>
              
              <div className="date-location">
                <div className="date-time">
                  <span className="material-icons calendar-icon">event</span>
                  <span>{formatDate(currentTime)}</span>
                  <span className="time">{formatTime(currentTime)}</span>
                </div>
                <div className="location">
                  <span className="material-icons location-icon">place</span>
                  <span>VietNam, Ho Chi Minh City</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <div className="header">
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'today' ? 'active' : ''}`}
                  onClick={() => setActiveTab('today')}
                >
                  Today
                </button>
                <button 
                  className={`tab ${activeTab === 'week' ? 'active' : ''}`}
                  onClick={() => setActiveTab('week')}
                >
                  Week
                </button>
              </div>
              
              <div className="unit-toggle">
                <button 
                  className={`unit ${tempUnit === 'C' ? 'active' : ''}`}
                  onClick={() => handleUnitChange('C')}
                >
                  °C
                </button>
                <button 
                  className={`unit ${tempUnit === 'F' ? 'active' : ''}`}
                  onClick={() => handleUnitChange('F')}
                >
                  °F
                </button>
              </div>
            </div>
            
            <div className="temperature-chart">
              <div className="chart-container">
                {/* Temperature line chart */}
                <svg width="100%" height="100%" viewBox="0 0 1000 200">
                  <path d="M50,60 Q300,120 500,130 T950,170" 
                        fill="none" 
                        stroke="#66a6ff" 
                        strokeWidth="2" />
                  <circle cx="50" cy="60" r="5" fill="#66a6ff" stroke="white" strokeWidth="2" />
                  <circle cx="350" cy="130" r="5" fill="#66a6ff" stroke="white" strokeWidth="2" />
                  <circle cx="650" cy="150" r="5" fill="#66a6ff" stroke="white" strokeWidth="2" />
                  <circle cx="950" cy="170" r="5" fill="#66a6ff" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              
              <div className="time-labels">
                <span>12:00 PM</span>
                <span>3:00 PM</span>
                <span>6:00 PM</span>
                <span>9:00 PM</span>
              </div>
            </div>
            
            <div className="highlights">
              <h2 className="section-title">TODAY'S HIGHLIGHTS</h2>
              
              <div className="widgets-grid two-widgets">
                {/* Temperature */}
                <div className="widget">
                  <h3>Temperature</h3>
                  <div className="temperature-meter">
                    <span className="material-icons temp-icon">thermostat</span>
                    <div className="temperature-value">{temperature}°{tempUnit}</div>
                    <div className="temperature-desc">Current Temperature</div>
                  </div>
                </div>
                
                {/* Humidity */}
                <div className="widget">
                  <h3>Humidity</h3>
                  <div className="humidity-meter">
                    <span className="material-icons humidity-icon">water_drop</span>
                    <div className="humidity-value">{humidity}%</div>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: `${humidity}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
