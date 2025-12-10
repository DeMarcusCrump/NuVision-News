#!/usr/bin/env node
require('dotenv').config();
const http = require('http');
const app = require('./index');

const tryPorts = [process.env.PORT ? Number(process.env.PORT) : 4000, 4001];

(async function start() {
  for (const port of tryPorts) {
    try {
      const server = http.createServer(app);
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, () => resolve());
      });
      console.log(`NuVision inference proxy running on http://localhost:${port}`);
      // Graceful shutdown
      process.on('SIGINT', () => server.close(() => process.exit(0)));
      process.on('SIGTERM', () => server.close(() => process.exit(0)));
      return;
    } catch (err) {
      if (err && (err.code === 'EADDRINUSE' || err.errno === 'EADDRINUSE')) {
        console.warn(`Port ${port} in use, trying next port...`);
        continue;
      }
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  }
  console.error('No available ports to start the server. Tried:', tryPorts.join(', '));
  process.exit(1);
})();
