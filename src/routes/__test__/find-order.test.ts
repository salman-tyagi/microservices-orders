import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Ticket } from '../../models/ticket.model';

describe('GET /api/orders/:orderId', () => {
  it('should throw bad request error if order id is not provided', async () => {
    await request(app).get(`/api/orders/${undefined}`).set('Cookie', global.signin()).expect(400);
  });

  it('should throw bad request error if invalid order id provided', async () => {
    await request(app).get('/api/orders/432ghj4g432kj').set('Cookie', global.signin()).expect(400);
  });

  it('should throw 401 unauthorized error if user is not signed in', async () => {
    const orderId = new mongoose.Types.ObjectId();

    await request(app).get(`/api/orders/${orderId}`).expect(401);
  });

  it('should throw 404 not found error if order is not found with provided order id', async () => {
    const orderId = new mongoose.Types.ObjectId();

    await request(app).get(`/api/orders/${orderId}`).set('Cookie', global.signin()).expect(404);
  });

  it('should return an order related to the logged in user', async () => {
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

    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(order.id).toEqual(fetchedOrder.id);
    expect(order.userId).toEqual(fetchedOrder.userId);
  });

  it("should throw 404 not found error if user trying to find other user's order", async () => {
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

    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', global.signin())
      .expect(404);

    expect(order.userId).not.toEqual(fetchedOrder.userId);
  });
});
