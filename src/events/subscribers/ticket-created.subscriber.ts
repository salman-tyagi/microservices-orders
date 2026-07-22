import {
  Subscriber,
  TicketCreatedEvent,
  QueuesBindings,
  Queues,
  InternalServerErrorException,
} from '@tyagi-s/common';
import { Message } from 'amqplib';

import { Ticket } from '../../models/ticket.model';

export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
  readonly queueName = Queues.OrdersService;
  readonly bindQueueKey = QueuesBindings.TicketCreated;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.create({
      _id: data.id,
      title: data.title,
      price: parseInt(data.price),
    });

    if (!ticket) throw InternalServerErrorException('Failed to create ticket');

    this.channel.ack(msg);
  }
}
