import { Publisher, OrderCreatedEvent, Exchanges, QueuesBindings } from '@tyagi-s/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  exchangeName = Exchanges.TicketExchange;
  readonly routingKey = QueuesBindings.OrderCreated;
}
