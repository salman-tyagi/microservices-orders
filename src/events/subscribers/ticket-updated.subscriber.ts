import {
  Subscriber,
  TicketUpdatedEvent,
  QueuesBindings,
  Queues,
  NotFoundException,
} from '@tyagi-s/common';
import { Message } from 'amqplib';

import { Ticket } from '../../models/ticket.model';

export class TicketUpdatedSubscriber extends Subscriber<TicketUpdatedEvent> {
  readonly queueName = Queues.OrdersServiceTicketUpdated;
  readonly bindQueueKey = QueuesBindings.TicketUpdated;

  async onMessage(data: TicketUpdatedEvent['data'], message: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) throw NotFoundException('Failed to update. Ticket not found');

    const updateOptions = {} as TicketUpdatedEvent['data'];

    if (data.title) updateOptions.title = data.title;
    if (data.price) updateOptions.price = data.price;

    ticket.set(updateOptions);
    await ticket.save({ validateModifiedOnly: true });

    this.channel.ack(message);
  }
}
