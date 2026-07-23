import { Channel, Message } from 'amqplib';

export const channel = {
  publish: jest
    .fn()
    .mockImplementation((queueName: string, routingKey: string, content: Buffer) => Boolean),
  ack: jest.fn().mockImplementation((message: Message) => Promise<void>),
} as unknown as Channel;
