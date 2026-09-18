package com.iotplatform.backend.controller;

import com.iotplatform.backend.model.SensorReading;
import com.iotplatform.backend.repository.SensorReadingRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SensorReadingController {

        private final SensorReadingRepository repository;
    private final MongoTemplate mongoTemplate;

    public SensorReadingController(SensorReadingRepository repository, MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
    }

    // GET /api/devices — list of all distinct device IDs that have ever reported data
    @GetMapping("/devices")
    public List<String> getDevices() {
        return mongoTemplate.findDistinct("deviceId", SensorReading.class, String.class);
    }

    // GET /api/readings/latest/{deviceId} — most recent reading for one device
    @GetMapping("/readings/latest/{deviceId}")
    public ResponseEntity<SensorReading> getLatestReading(@PathVariable String deviceId) {
        List<SensorReading> readings = repository.findByDeviceIdOrderByTimestampDesc(deviceId);

        if (readings.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(readings.get(0));
    }

    // GET /api/readings/history/{deviceId}?start=2026-09-01T00:00:00Z&end=2026-09-18T00:00:00Z
    @GetMapping("/readings/history/{deviceId}")
    public List<SensorReading> getHistory(
            @PathVariable String deviceId,
            @RequestParam String start,
            @RequestParam String end) {

        Instant startInstant = Instant.parse(start);
        Instant endInstant = Instant.parse(end);

        return repository.findByDeviceIdAndTimestampBetween(deviceId, startInstant, endInstant);
    }
}