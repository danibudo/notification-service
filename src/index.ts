import { startHealthServer } from './health';

async function main(): Promise<void> {
  const healthServer = startHealthServer();
  // Phase 3: initConnection + setupTopology()
  // Phase 6: startConsumers()
}

const shutdown = async (): Promise<void> => {
  // Phase 3: close health server and RabbitMQ connection
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());

main().catch((err: unknown) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
