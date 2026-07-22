import { Publisher, OrderCancelledEvent, Exchanges, QueuesBindings } from '@tyagi-s/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  exchangeName = Exchanges.TicketExchange;
  readonly routingKey = QueuesBindings.OrderCancelled;
}
