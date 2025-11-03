const client = require('prom-client');

// Crear un Registry personalizado
const register = new client.Registry();

// Agregar métricas por defecto
client.collectDefaultMetrics({ register });

// Métricas personalizadas
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeTicketsGauge = new client.Gauge({
  name: 'tickets_active',
  help: 'Number of active tickets'
});

const ticketsCreatedCounter = new client.Counter({
  name: 'tickets_created_total',
  help: 'Total number of tickets created'
});

// Registrar las métricas
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeTicketsGauge);
register.registerMetric(ticketsCreatedCounter);

module.exports = {
  register,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  activeTicketsGauge,
  ticketsCreatedCounter
};