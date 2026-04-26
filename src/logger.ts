type Level = 'info' | 'warn' | 'error';

function log(level: Level, message: string, correlationId?: string): void {
  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (correlationId) entry['correlation_id'] = correlationId;
  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
}

export const logger = {
  info: (message: string, correlationId?: string) => log('info', message, correlationId),
  warn: (message: string, correlationId?: string) => log('warn', message, correlationId),
  error: (message: string, correlationId?: string) => log('error', message, correlationId),
};
