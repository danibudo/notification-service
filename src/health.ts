import http from 'http';
import { config } from './config';
import { logger } from './logger';

export function startHealthServer(): http.Server {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(config.PORT, () => {
    logger.info(`Health server listening on port ${config.PORT}`);
  });

  return server;
}
