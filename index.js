const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

let tickets = [
  { id: 1, title: "Test ticket", status: "open" }
];

// Healthcheck (útil para K8s probes)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

