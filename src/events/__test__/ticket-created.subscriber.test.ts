import { Message } from 'amqplib';
import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@tyagi-s/common';

import { channel } from '../../rabbitmq';
import { TicketCreatedSubscriber } from '../subscribers/ticket-created.subscriber';
import { Ticket } from '../../models/ticket.model';

const setup = async function () {
  // create a ticket subscriber instance
  const subscriber = new TicketCreatedSubscriber(channel);

  // create a fake event object
  const event: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: '100',
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };

  // create a fake message object
  const message = {} as Message;

  return { subscriber, event, message };
};

it('should create a ticket and save it', async () => {
  const { subscriber, event, message } = await setup();

  // call the onMessage function with data and message object
  await subscriber.onMessage(event, message);

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(event.id);

  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(event.title);
  expect(ticket?.price + '').toEqual(event.price);
});

it('should acknowledged the message', async () => {
  // Call the onMessage function with data + message object
  // Write assertions to make sure the message was acknowledged
});
