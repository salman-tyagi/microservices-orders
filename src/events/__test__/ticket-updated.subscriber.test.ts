import { Message } from 'amqplib';
import { TicketUpdatedEvent } from '@tyagi-s/common';

import { channel } from '../../rabbitmq';
import { Ticket } from '../../models/ticket.model';
import { TicketUpdatedSubscriber } from '../subscribers/ticket-updated.subscriber';

async function setup() {
  // Create ticket updated event instance
  const subscriber = new TicketUpdatedSubscriber(channel);

  // Create a ticket
  const ticket = await Ticket.create({
    title: 'concert',
    price: 100,
  });

  // Create fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: '999',
    userId: 'df7s6f78ds6',
  };

  // Create fake message object
  const msg = {} as Message;

  // return all
  return { subscriber, ticket, data, msg };
}

it('should find, update and save a ticket', async () => {
  const { subscriber, ticket, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(+data.price);
  expect(updatedTicket?.version).toEqual(data.version);
});

it('should acknowledge the message', async () => {
  const { subscriber, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.ack).toHaveBeenCalled();
});
