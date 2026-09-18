package com.iotplatform.backend.mqtt;

import tools.jackson.databind.ObjectMapper;
import com.iotplatform.backend.model.SensorReading;
import com.iotplatform.backend.repository.SensorReadingRepository;
import jakarta.annotation.PostConstruct;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class MqttSubscriberService implements MqttCallback {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.topic.filter}")
    private String topicFilter;

    private final SensorReadingRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Spring injects the repository automatically via constructor injection
    public MqttSubscriberService(SensorReadingRepository repository) {
        this.repository = repository;
    }

    // @PostConstruct: run this method once, right after Spring finishes
    // creating this bean and injecting its dependencies.
    @PostConstruct
    public void connectAndSubscribe() {
        try {
            MqttClient client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
            client.setCallback(this);

            MqttConnectOptions options = new MqttConnectOptions();
            options.setAutomaticReconnect(true);
            options.setCleanSession(true);

            client.connect(options);
            client.subscribe(topicFilter);

            System.out.println("MQTT: connected to " + brokerUrl + " and subscribed to " + topicFilter);
        } catch (MqttException e) {
            System.err.println("MQTT: failed to connect/subscribe: " + e.getMessage());
        }
    }

    // Called automatically whenever a message arrives on a subscribed topic
    @Override
    public void messageArrived(String topic, MqttMessage message) {
        try {
            String payload = new String(message.getPayload());
            System.out.println("MQTT: received on " + topic + ": " + payload);

            // Parse the JSON payload into a generic Map first
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);

            SensorReading reading = new SensorReading(
                    (String) data.get("deviceId"),
                    Instant.parse((String) data.get("timestamp")),
                    ((Number) data.get("temperature")).doubleValue(),
                    ((Number) data.get("humidity")).doubleValue(),
                    ((Number) data.get("soilMoisture")).doubleValue()
            );

            repository.save(reading);
            System.out.println("MQTT: saved reading for device " + reading.getDeviceId());

        } catch (Exception e) {
            System.err.println("MQTT: failed to process message: " + e.getMessage());
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        System.err.println("MQTT: connection lost: " + cause.getMessage());
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // Not used — we only publish nothing from the backend, we only subscribe
    }
}