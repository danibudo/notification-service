export interface EventMetadata {
  timestamp: string;
  correlation_id: string;
}

export interface MessageEnvelope<T> {
  event: string;
  data: T;
  metadata: EventMetadata;
}
