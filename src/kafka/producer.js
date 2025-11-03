const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ticketboard-backend',
  brokers: [process.env.KAFKA_BROKER || 'kafka-service:9092']
});

const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
  console.log('✅ Kafka Producer connected');
};

const disconnectProducer = async () => {
  await producer.disconnect();
  console.log('❌ Kafka Producer disconnected');
};

const sendTicketEvent = async (eventType, ticketData) => {
  try {
    await producer.send({
      topic: 'ticket-events',
      messages: [
        {
          key: eventType,
          value: JSON.stringify({
            ...ticketData,
            eventType,
            timestamp: new Date().toISOString(),
            service: 'ticketboard-backend'
          })
        }
      ]
    });
    console.log(`📤 Sent ${eventType} event for ticket ${ticketData.id}`);
  } catch (error) {
    console.error('Error sending Kafka event:', error);
  }
};

module.exports = {
  connectProducer,
  disconnectProducer,
  sendTicketEvent
};