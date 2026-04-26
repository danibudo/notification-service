async function main(): Promise<void> {
  // Phase 2: startHealthServer()
  // Phase 3: initConnection + setupTopology()
  // Phase 6: startConsumers()
}

const shutdown = async (): Promise<void> => {
  // Phase 2: close health server
  // Phase 3: closeConnection()
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());

main().catch((err: unknown) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
