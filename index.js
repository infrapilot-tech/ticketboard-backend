const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

let tickets = [
  { id: 1, title: "Test ticket", status: "open" }
];

// Healthcheck (para K8s probes)
app.get('/healthz', (req, res) => res.send('ok'));

// Get all tickets
app.get('/tickets', (req, res) => {
  res.json(tickets);
});

// Create a new ticket
app.post('/tickets', (req, res) => {
  const id = tickets.length ? tickets[tickets.length - 1].id + 1 : 1;
  const title = req.body.title || "Untitled";
  const newTicket = { id, title, status: "open" };
  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

// Agrega estos endpoints básicos cuando los necesites:
/*
app.get('/tickets/:id', (req, res) => {
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

app.put('/tickets/:id', (req, res) => {
  const ticketIndex = tickets.findIndex(t => t.id === parseInt(req.params.id));
  if (ticketIndex === -1) return res.status(404).json({ error: 'Ticket not found' });
  tickets[ticketIndex] = { ...tickets[ticketIndex], ...req.body };
  res.json(tickets[ticketIndex]);
});

app.delete('/tickets/:id', (req, res) => {
  const ticketIndex = tickets.findIndex(t => t.id === parseInt(req.params.id));
  if (ticketIndex === -1) return res.status(404).json({ error: 'Ticket not found' });
  tickets.splice(ticketIndex, 1);
  res.status(204).send();
});
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));