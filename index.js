const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { register, httpRequestDurationMicroseconds, httpRequestsTotal } = require('./src/metrics');
const { connectProducer, sendTicketEvent } = require('./src/kafka/producer');

const app = express();

// Conectar a Kafka al iniciar
connectProducer().catch(console.error);

app.use(cors());
app.use(bodyParser.json());

let tickets = [
  { id: 1, title: "Test ticket", status: "open" }
];

// Healthcheck (incluye Kafka)
app.get('/healthz', async (req, res) => {
  res.json({ 
    status: 'OK', 
    kafka: 'connected',
    timestamp: new Date().toISOString() 
  });
});

// Get all tickets
app.get('/tickets', (req, res) => {
  res.json(tickets);
});

// Create a new ticket
app.post('/tickets', async (req, res) => {
  const id = tickets.length ? tickets[tickets.length - 1].id + 1 : 1;
  const title = req.body.title || "Untitled";
  const newTicket = { id, title, status: "open" };
  
  tickets.push(newTicket);
  
  // Emitir evento a Kafka
  await sendTicketEvent('TICKET_CREATED', newTicket);
  
  res.status(201).json(newTicket);
});

// Update ticket status
app.put('/tickets/:id/status', async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const newStatus = req.body.status;
  
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  
  const oldStatus = ticket.status;
  ticket.status = newStatus;
  
  // Emitir evento a Kafka
  await sendTicketEvent('TICKET_UPDATED', {
    ...ticket,
    oldStatus,
    newStatus
  });
  
  res.json(ticket);
});

// Middleware para métricas (existente)
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });
  
  next();
});

// Endpoint de métricas (existente)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', async () => {
  await disconnectProducer();
  process.exit(0);
});