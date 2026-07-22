import { Channel } from 'amqplib';

export const channel = {
  publish: jest
    .fn()
    .mockImplementation((queueName: string, routingKey: string, content: Buffer) => Boolean),
} as unknown as Channel;
