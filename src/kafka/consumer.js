const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ticketboard-processor',
  brokers: [process.env.KAFKA_BROKER || 'kafka-service:9092']
});

const consumer = kafka.consumer({ groupId: 'ticketboard-group' });

const processTicketEvents = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'ticket-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        console.log(`📥 Processing ${event.eventType} for ticket ${event.id}`);

        // Procesar diferentes tipos de eventos
        switch (event.eventType) {
          case 'TICKET_CREATED':
            console.log(`🎫 New ticket created: ${event.title}`);
            // Aquí podrías: enviar notificación, actualizar analytics, etc.
            break;
          
          case 'TICKET_UPDATED':
            console.log(`🔄 Ticket ${event.id} status changed: ${event.oldStatus} → ${event.newStatus}`);
            // Aquí podrías: actualizar dashboard en tiempo real, logging, etc.
            break;
        }

      } catch (error) {
        console.error('Error processing Kafka message:', error);
      }
    },
  });
};

module.exports = { processTicketEvents };