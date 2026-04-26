import { startHealthServer } from './health';
import { initConnection, closeConnection } from './rabbit/connection';
import { setupTopology } from './rabbit/setup';
import { logger } from './logger';

async function main(): Promise<void> {
  const healthServer = startHealthServer();

  await initConnection(async () => {
    await setupTopology();
    // Phase 6: startConsumers()
  });

  const shutdown = async (): Promise<void> => {
    logger.info('Shutting down...');
    healthServer.close(async () => {
      await closeConnection();
      logger.info('Shutdown complete.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

main().catch((err: unknown) => {
  logger.error(`Failed to start: ${String(err)}`);
  process.exit(1);
});
