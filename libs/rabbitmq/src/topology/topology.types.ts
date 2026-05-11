export interface ExchangeDeclaration {
  name: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers';
  options?: {
    durable?: boolean;
    autoDelete?: boolean;
  };
}

export interface QueueDeclaration {
  name: string;
  options?: {
    durable?: boolean;
    arguments?: Record<string, string | number | boolean>;
  };
}

export interface BindingDeclaration {
  exchange: string;
  queue: string;
  routingKey: string;
}

export interface RabbitMqTopology {
  exchanges: ExchangeDeclaration[];
  queues: QueueDeclaration[];
  bindings: BindingDeclaration[];
}
