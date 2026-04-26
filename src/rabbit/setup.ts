import { getChannel } from './connection';
import { logger } from '../logger';

const DLX = 'dlx.notification-service';
const AUTH_EXCHANGE = 'auth-service.events';
const LOAN_EXCHANGE = 'loan-service.events';

export const QUEUES = {
  INVITE_TOKEN_GENERATED: 'notification-service.auth.invite_token_generated',
  LOAN_APPROVED: 'notification-service.loan.loan_approved',
  LOAN_REJECTED: 'notification-service.loan.loan_rejected',
  LOAN_STARTED: 'notification-service.loan.loan_started',
  LOAN_ENDED: 'notification-service.loan.loan_ended',
  LOAN_DUE_REMINDER: 'notification-service.loan.loan_due_reminder',
} as const;

const QUEUE_DEFINITIONS = [
  { queue: QUEUES.INVITE_TOKEN_GENERATED, exchange: AUTH_EXCHANGE, routingKey: 'auth.invite_token_generated' },
  { queue: QUEUES.LOAN_APPROVED,          exchange: LOAN_EXCHANGE,  routingKey: 'loan.loan_approved' },
  { queue: QUEUES.LOAN_REJECTED,          exchange: LOAN_EXCHANGE,  routingKey: 'loan.loan_rejected' },
  { queue: QUEUES.LOAN_STARTED,           exchange: LOAN_EXCHANGE,  routingKey: 'loan.loan_started' },
  { queue: QUEUES.LOAN_ENDED,             exchange: LOAN_EXCHANGE,  routingKey: 'loan.loan_ended' },
  { queue: QUEUES.LOAN_DUE_REMINDER,      exchange: LOAN_EXCHANGE,  routingKey: 'loan.loan_due_reminder' },
];

const withDlx = (dlq: string) => ({
  durable: true,
  arguments: {
    'x-dead-letter-exchange': DLX,
    'x-dead-letter-routing-key': dlq,
  },
});

export async function setupTopology(): Promise<void> {
  const channel = getChannel();

  // Owned — declare authoritatively
  await channel.assertExchange(DLX, 'direct', { durable: true });

  // Upstream exchanges — passive check; fails loudly if not yet created by owning service
  await channel.checkExchange(AUTH_EXCHANGE);
  await channel.checkExchange(LOAN_EXCHANGE);

  for (const { queue, exchange, routingKey } of QUEUE_DEFINITIONS) {
    const dlq = `${queue}.dlq`;
    await channel.assertQueue(dlq, { durable: true });
    await channel.bindQueue(dlq, DLX, dlq);
    await channel.assertQueue(queue, withDlx(dlq));
    await channel.bindQueue(queue, exchange, routingKey);
  }

  logger.info('RabbitMQ topology ready');
}
