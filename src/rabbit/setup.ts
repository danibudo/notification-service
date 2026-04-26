import { getChannel } from './connection';
import { config } from '../config';
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

const DLQ = {
  INVITE_TOKEN_GENERATED: `${QUEUES.INVITE_TOKEN_GENERATED}.dlq`,
  LOAN_APPROVED: `${QUEUES.LOAN_APPROVED}.dlq`,
  LOAN_REJECTED: `${QUEUES.LOAN_REJECTED}.dlq`,
  LOAN_STARTED: `${QUEUES.LOAN_STARTED}.dlq`,
  LOAN_ENDED: `${QUEUES.LOAN_ENDED}.dlq`,
  LOAN_DUE_REMINDER: `${QUEUES.LOAN_DUE_REMINDER}.dlq`,
} as const;

const ROUTING_KEYS = {
  INVITE_TOKEN_GENERATED: 'auth.invite_token_generated',
  LOAN_APPROVED: 'loan.loan_approved',
  LOAN_REJECTED: 'loan.loan_rejected',
  LOAN_STARTED: 'loan.loan_started',
  LOAN_ENDED: 'loan.loan_ended',
  LOAN_DUE_REMINDER: 'loan.loan_due_reminder',
} as const;

export async function setupTopology(): Promise<void> {
  const channel = getChannel();

  // Owned — declare authoritatively
  await channel.assertExchange(DLX, 'direct', { durable: true });

  // Upstream exchanges — passive check; fails loudly if not yet created by owning service
  await channel.checkExchange(AUTH_EXCHANGE);
  await channel.checkExchange(LOAN_EXCHANGE);

  // DLQs — plain durable queues bound to the DLX
  for (const dlqName of Object.values(DLQ)) {
    await channel.assertQueue(dlqName, { durable: true });
    await channel.bindQueue(dlqName, DLX, dlqName);
  }

  // Main queues with DLX routing
  const withDlx = (dlqRoutingKey: string) => ({
    durable: true,
    arguments: {
      'x-dead-letter-exchange': DLX,
      'x-dead-letter-routing-key': dlqRoutingKey,
    },
  });

  await channel.assertQueue(QUEUES.INVITE_TOKEN_GENERATED, withDlx(DLQ.INVITE_TOKEN_GENERATED));
  await channel.assertQueue(QUEUES.LOAN_APPROVED, withDlx(DLQ.LOAN_APPROVED));
  await channel.assertQueue(QUEUES.LOAN_REJECTED, withDlx(DLQ.LOAN_REJECTED));
  await channel.assertQueue(QUEUES.LOAN_STARTED, withDlx(DLQ.LOAN_STARTED));
  await channel.assertQueue(QUEUES.LOAN_ENDED, withDlx(DLQ.LOAN_ENDED));
  await channel.assertQueue(QUEUES.LOAN_DUE_REMINDER, withDlx(DLQ.LOAN_DUE_REMINDER));

  // Bindings
  await channel.bindQueue(QUEUES.INVITE_TOKEN_GENERATED, AUTH_EXCHANGE, ROUTING_KEYS.INVITE_TOKEN_GENERATED);
  await channel.bindQueue(QUEUES.LOAN_APPROVED, LOAN_EXCHANGE, ROUTING_KEYS.LOAN_APPROVED);
  await channel.bindQueue(QUEUES.LOAN_REJECTED, LOAN_EXCHANGE, ROUTING_KEYS.LOAN_REJECTED);
  await channel.bindQueue(QUEUES.LOAN_STARTED, LOAN_EXCHANGE, ROUTING_KEYS.LOAN_STARTED);
  await channel.bindQueue(QUEUES.LOAN_ENDED, LOAN_EXCHANGE, ROUTING_KEYS.LOAN_ENDED);
  await channel.bindQueue(QUEUES.LOAN_DUE_REMINDER, LOAN_EXCHANGE, ROUTING_KEYS.LOAN_DUE_REMINDER);

  await channel.prefetch(config.RABBITMQ_PREFETCH);

  logger.info('RabbitMQ topology ready');
}
