const mqtt = require('mqtt');

// Connect to our Mosquitto broker running in Docker,
// reachable on localhost since Docker published port 1883 to Windows.
const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1:1883';
const client = mqtt.connect(brokerUrl);

// Config: which fake devices exist, and their "base" readings
const devices = [
  { id: 'device1', baseTemp: 22, baseHumidity: 45, baseSoilMoisture: 30 },
  { id: 'device2', baseTemp: 26, baseHumidity: 55, baseSoilMoisture: 40 },
  { id: 'device3', baseTemp: 19, baseHumidity: 60, baseSoilMoisture: 50 },
];

// Utility: random noise generator, e.g. noise(2) returns something between -2 and +2
function noise(amount) {
  return (Math.random() * 2 - 1) * amount;
}

// Utility: slow oscillation using sine wave, so temperature drifts smoothly
// over time instead of jumping randomly every reading.
function oscillate(base, amplitude, periodSeconds) {
  const t = Date.now() / 1000; // current time in seconds
  return base + amplitude * Math.sin((2 * Math.PI * t) / periodSeconds);
}

function generateReading(device) {
  return {
    deviceId: device.id,
    timestamp: new Date().toISOString(),
    temperature: parseFloat(
      (oscillate(device.baseTemp, 3, 60) + noise(0.5)).toFixed(2)
    ),
    humidity: parseFloat(
      (oscillate(device.baseHumidity, 10, 90) + noise(1)).toFixed(2)
    ),
    soilMoisture: parseFloat(
      (oscillate(device.baseSoilMoisture, 5, 120) + noise(1)).toFixed(2)
    ),
  };
}

client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${brokerUrl}`);

  // Every 5 seconds, generate and publish a reading for each device
  setInterval(() => {
    devices.forEach((device) => {
      const reading = generateReading(device);
      const topic = `sensors/${device.id}/readings`;
      const payload = JSON.stringify(reading);

      client.publish(topic, payload, {}, (err) => {
        if (err) {
          console.error(`Failed to publish for ${device.id}:`, err.message);
        } else {
          console.log(`Published to ${topic}:`, payload);
        }
      });
    });
  }, 5000);
});

client.on('error', (err) => {
  console.error('MQTT connection error:', err.message);
});