import { useState, useEffect } from 'react'
import { ClipLoader} from 'react-spinners';
import getDataApi from './api/getDataApi';
import { Chart as ChartJs} from 'chart.js/auto';
import { Line } from 'react-chartjs-2'
import './App.css'



function App() {
  const [tempUnit, setTempUnit] = useState('C') 
  const [currentTime, setCurrentTime] = useState(new Date())
  const [temperature, setTemperature] = useState(null) // độ C
  const [humidity, setHumidity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motorActive, setMotorActive] = useState(0);
  const [temperature1, setTemperature1] = useState(null); // độ F
  const [temperatureChart, setTemperatureChart] = useState([]);
  const [humidityChart, setHumidityChart] = useState([]);
  const [tempAxisVisible, setTempAxisVisible] = useState(true);
  const [humidityAxisVisible, setHumidityAxisVisible] = useState(true);

  

  useEffect(() => {
    const GetApi = async() => {
        const temperatureData = await getDataApi.getTemperatureData();
        const humidityData = await getDataApi.getHumidityData();

        console.log(temperatureData)
        // console.log(data)
        setHumidity(humidityData.value);
        setTemperature(temperatureData.value);
        setLoading(false);
        
        // Update chart data directly here instead of separate useEffects
        const newTemp = {
          timeStamp: temperatureData.timeStamp,
          temperature: temperatureData.value || 0,
          temperature1: Math.round((temperatureData.value * 9/5) + 32)
        };
        
        const newHumidity = {
          timeStamp: temperatureData.timeStamp,
          humidity: humidityData.value || 0,
        };
        
        setTemperatureChart(prevData => {
          const newData = [...prevData, newTemp];
          // Keep only the last 10 data points to prevent memory issues
          return newData.slice(-10);
        });
        
        setHumidityChart(prevData => {
          const newData = [...prevData, newHumidity];
          // Keep only the last 10 data points to prevent memory issues
          return newData.slice(-10);
        });
    };

    // Call GetApi immediately when component mounts
    GetApi();

    // Set up interval to fetch data every 5 seconds
    const interval = setInterval(() => {
      GetApi();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
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
      setTemperature1(Math.round((temperature * 9/5) + 32));
    } else {
      // Convert from Fahrenheit to Celsius: (F - 32) × 5/9
      setTemperature(Math.round((temperature1 - 32) * 5/9));
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

  const updateMotorStatus = async (isOn) => {
    setMotorActive(isOn);
    const value = {
      status: isOn
    }
    await getDataApi.updateMotorStatus(value);
  };

  const formatChartTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Prepare combined chart data
  const combinedChartData = {
    labels: temperatureChart.slice(-5).reverse().map(data => formatChartTime(data.timeStamp)),
    datasets: [
      {
        label: tempUnit === 'C' ? 'Temperature (°C)' : 'Temperature (°F)',
        data: temperatureChart.slice(-5).reverse().map(data => tempUnit === 'C' ? data.temperature : data.temperature1),
        fill: false,
        backgroundColor: '#3366FF',
        borderColor: '#3366FF',
        tension: 0.1,
        pointBackgroundColor: '#3366FF',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 5,
        yAxisID: 'y', // Left y-axis
        hidden: !tempAxisVisible
      },
      {
        label: 'Humidity (%)',
        data: humidityChart.slice(-5).reverse().map(data => data.humidity),
        fill: false,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        tension: 0.1,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 5,
        yAxisID: 'y1', // Right y-axis
        hidden: !humidityAxisVisible
      }
    ]
  };

  // Combined chart options
  const combinedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: tempAxisVisible,
        position: 'left',
        beginAtZero: true,
        min: 0,
        max: tempUnit === 'C' ? 40 : 104, // Dynamic max based on temperature unit (122°F is ~50°C)
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: true,
        },
        ticks: {
          color: '#3366FF',
          font: {
            size: 12,
          },
          callback: function(value) {
            return tempUnit === 'C' ? value + '°C' : value + '°F';
          },
          padding: 10,
        },
        title: {
          display: true,
          text: tempUnit === 'C' ? 'Temperature (°C)' : 'Temperature (°F)',
          color: '#3366FF',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y1: {
        type: 'linear',
        display: humidityAxisVisible,
        position: 'right',
        beginAtZero: true,
        min: 0,
        max: 100, // Set max for humidity scale (percentage)
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
        ticks: {
          color: '#4CAF50',
          font: {
            size: 12,
          },
          callback: function(value) {
            return value + '%';
          },
          padding: 10,
        },
        title: {
          display: true,
          text: 'Humidity (%)',
          color: '#4CAF50',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: true,
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'center',
        labels: {
          boxWidth: 40,
          color: '#666',
          font: {
            size: 12,
          },
          usePointStyle: false,
        },
        onClick: (evt, item, legend) => {
          // Call the original legend click handler
          ChartJs.defaults.plugins.legend.onClick(evt, item, legend);
          
          // Get the index of the clicked dataset
          const index = item.datasetIndex;
          
          // After toggling visibility, check if datasets are visible
          const chart = legend.chart;
          
          // Update y-axis visibility based on dataset visibility
          if (index === 0) { // Temperature dataset
            const isVisible = chart.isDatasetVisible(0);
            setTempAxisVisible(isVisible);
            chart.options.scales.y.display = isVisible;
          } else if (index === 1) { // Humidity dataset
            const isVisible = chart.isDatasetVisible(1);
            setHumidityAxisVisible(isVisible);
            chart.options.scales.y1.display = isVisible;
          }
          
          // Update the chart
          chart.update();
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      }
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        hoverRadius: 7,
        radius: 5,
      }
    },
    layout: {
      padding: 20
    },
    backgroundColor: 'white',
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
              {tempUnit === 'C' ? (
                <div className="current-temp">{temperature}°C</div>
              ) : (
                <div className="current-temp">{temperature1}°F</div>
              )}
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
              <h2 className="section-title">DATA CHART</h2>
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
            
     
              <div className="charts-row" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%',
                marginBottom: '20px' 
              }}>
                <div className="chart-container" style={{ 
                  width: '100%', 
                  height: 'calc(40vh)', 
                  minHeight: '300px',
                  padding: '20px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}>
                  <h3 style={{ marginTop: 0 }}>Temperature & Humidity Chart</h3>
                  <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                    <Line 
                      data={combinedChartData} 
                      options={{
                        ...combinedChartOptions,
                        responsive: true,
                        maintainAspectRatio: false,
                        onResize: () => {
                          // Optional: handle resize if needed
                        }
                      }} 
                    />
                  </div>
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
                    {tempUnit === 'C' ? (
                      <div className="temperature-value">{temperature}°C</div>
                    ) : (
                      <div className="temperature-value">{temperature1}°F</div>
                    )}
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

                   {/* Sensor */}
                <div className="widget">
                  <h3>Motor</h3>
                  <div className="motor-control">
                    <span className={`material-icons motor-icon rotating ${motorActive ? 'active' : ''}`}>settings</span>
                    <div className="motor-status">Status: {motorActive ? 'ON' : 'OFF'}</div>
                    <div className="motor-buttons">
                      {
                        motorActive === 1 ? (
                          <button 
                            className="motor-btn off"
                            onClick={() => updateMotorStatus(0)}
                            disabled={!motorActive}
                          >
                            OFF
                          </button>
                        ) : (
                          <button 
                            className="motor-btn on" 
                            onClick={() => updateMotorStatus(1)}
                            disabled={motorActive}
                          >
                            ON
                          </button>
                        )
                    }
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
