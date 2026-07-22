import { channel, connectRabbitMQ } from './rabbitmq';
import { connectMongoDB } from './database';
import { startServer, server } from './server';
import { TicketCreatedSubscriber } from './events/subscribers/ticket-created.subscriber';
import { TicketUpdatedSubscriber } from './events/subscribers/ticket-updated.subscriber';

function gracefulShutDown(reason: string, err: unknown) {
  console.log(reason, err);

  if (!server) process.exit(1);

  console.log(`SHUTTING DOWN THE SERVER GRACEFULLY...`);

  server.close(() => {
    console.log('SERVER CLOSED!');
    process.exit(1);
  });
}

process.on('uncaughtException', err => {
  gracefulShutDown('UNCAUGHT_EXCEPTION:', err);
});

process.on('unhandledRejection', err => {
  gracefulShutDown('UNHANDLED_REJECTION:', err);
});

(async function main() {
  try {
    if (!process.env.JWT_KEY) throw Error('JWT KEY must be defined');
    if (!process.env.MONGO_URI) throw Error('MONGO_URI must be defined');
    if (!process.env.RABBITMQ_URL) throw Error('RABBITMQ_URL is not defined');

    await connectRabbitMQ();

    new TicketCreatedSubscriber(channel).consume();
    new TicketUpdatedSubscriber(channel).consume();

    await connectMongoDB();
    startServer();
  } catch (err) {
    console.log('[MAIN_ERROR]:', err);
    process.exit(1);
  }
})();
