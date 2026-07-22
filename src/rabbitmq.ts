import amqp, { Channel, ChannelModel } from 'amqplib';
import { QueuesBindings, Exchanges, Queues } from '@tyagi-s/common';

export let channel: Channel, connection: ChannelModel;

const RETRY_DELAY = 5000;

let shuttingDown = false;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function connectRabbitMQ() {
  while (!shuttingDown) {
    try {
      connection = await amqp.connect(process.env.RABBITMQ_URL!);

      channel = await connection.createChannel();

      await channel.assertExchange(Exchanges.TicketExchange, 'direct', { durable: true });

      await channel.assertQueue(Queues.OrdersServiceTicketCreated, {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' },
      });

      await channel.bindQueue(
        Queues.OrdersServiceTicketCreated,
        Exchanges.TicketExchange,
        QueuesBindings.TicketCreated,
      );

      await channel.assertQueue(Queues.OrdersServiceTicketUpdated, {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' },
      });

      await channel.bindQueue(
        Queues.OrdersServiceTicketUpdated,
        Exchanges.TicketExchange,
        QueuesBindings.TicketUpdated,
      );

      console.log('RabbitMQ connected');

      connection.on('error', err => {
        console.log('RabbitMQ connection error:', err.message);
      });

      connection.on('close', () => {
        if (shuttingDown) return;
        console.log('RabbitMQ disconnected, reconnecting...');
        connectRabbitMQ();
      });

      return;
    } catch (err) {
      console.log(`RabbitMQ unavailable, retrying in ${RETRY_DELAY}ms:`, (err as Error).message);
      await wait(RETRY_DELAY);
    }
  }
}

function closeRabbitMQ() {
  shuttingDown = true;
  connection?.close();
}

process.on('SIGINT', closeRabbitMQ);
process.on('SIGTERM', closeRabbitMQ);
