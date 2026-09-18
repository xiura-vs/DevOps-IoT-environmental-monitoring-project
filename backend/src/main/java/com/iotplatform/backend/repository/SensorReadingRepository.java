package com.iotplatform.backend.repository;

import com.iotplatform.backend.model.SensorReading;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface SensorReadingRepository extends MongoRepository<SensorReading, String> {

    // Finds all readings for a device, most recent first
    List<SensorReading> findByDeviceIdOrderByTimestampDesc(String deviceId);

    // Finds readings for a device within a time range (for historical/date-filtered queries)
    List<SensorReading> findByDeviceIdAndTimestampBetween(String deviceId, Instant start, Instant end);
}