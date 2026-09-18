package com.iotplatform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "sensor_readings")
public class SensorReading {

    @Id
    private String id;

    private String deviceId;
    private Instant timestamp;
    private Double temperature;
    private Double humidity;
    private Double soilMoisture;

    // No-args constructor required by Spring Data / Jackson for deserialization
    public SensorReading() {
    }

    public SensorReading(String deviceId, Instant timestamp, Double temperature,
                          Double humidity, Double soilMoisture) {
        this.deviceId = deviceId;
        this.timestamp = timestamp;
        this.temperature = temperature;
        this.humidity = humidity;
        this.soilMoisture = soilMoisture;
    }

    // Getters and setters — Spring Data and Jackson both rely on these
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public Double getSoilMoisture() {
        return soilMoisture;
    }

    public void setSoilMoisture(Double soilMoisture) {
        this.soilMoisture = soilMoisture;
    }
}