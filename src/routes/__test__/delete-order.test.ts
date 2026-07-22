import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Ticket } from '../../models/ticket.model';
import { channel } from '../../rabbitmq';

describe('DELETE /api/orders/:orderId', () => {
  it('returns 401 error if user is not signed in', async () => {
    const orderId = new mongoose.Types.ObjectId();

    await request(app).delete(`/api/orders/${orderId}`).expect(401);
  });

  it('returns 400 error if invalid id is provided', async () => {
    await request(app)
      .delete('/api/orders/54hj3k5hkj43')
      .set('Cookie', global.signin())
      .expect(400);
  });

  it('returns 404 error if signed in user related order not found to delete', async () => {
    const orderId = new mongoose.Types.ObjectId();

    await request(app).delete(`/api/orders/${orderId}`).set('Cookie', global.signin()).expect(404);
  });

  it('returns 204 success response if signed user deleted his order doc', async () => {
    const ticket = await Ticket.create({
      title: 'concert',
      price: 100,
    });

    const cookie = global.signin();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticket: ticket.id })
      .expect(201);

    await request(app).delete(`/api/orders/${order.id}`).set('Cookie', cookie).expect(204);
  });

  it('return 404 not found error if user try to delete another user order', async () => {
    const ticket = await Ticket.create({
      title: 'concert',
      price: 100,
    });

    const cookie = global.signin();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticket: ticket.id })
      .expect(201);

    await request(app).delete(`/api/orders/${order.id}`).set('Cookie', global.signin()).expect(404);
  });

  it('sends order cancelled event', async () => {
    const ticket = await Ticket.create({
      title: 'concert',
      price: 100,
    });

    const cookie = global.signin();

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticket: ticket.id })
      .expect(201);

    expect(channel.publish).toHaveBeenCalled();
  });
});
