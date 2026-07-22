import request from 'supertest';
import mongoose from 'mongoose';
import { OrderStatus } from '@tyagi-s/common';

import { app } from '../../app';
import { Ticket } from '../../models/ticket.model';
import { Order } from '../../models/order.model';
import { channel } from '../../rabbitmq';

describe('POST /api/orders', () => {
  it('/api/orders POST route must be defined', async () => {
    const res = await request(app).post('/api/orders');
    expect(res.status).not.toBe(404);
  });

  it('should throw 401 unauthorized error if user is not signed in', async () => {
    await request(app).post('/api/orders').expect(401);
  });

  it('should throw bad request error if ticket id is not provided in body', async () => {
    await request(app).post('/api/orders').set('Cookie', global.signin()).send().expect(400);
  });

  it('should throw not found error if ticket is not found with the provided ticket id', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticket: ticketId })
      .expect(404);
  });

  it('should throw bad request error if the ticket is already reserved', async () => {
    const ticket = await Ticket.create({
      title: 'concert',
      price: 100,
    });

    const userId = new mongoose.Types.ObjectId();

    await Order.create({
      ticket: ticket.id,
      userId,
    });

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin(userId))
      .send({ ticket: ticket.id })
      .expect(400);
  });

  it('should create a successful order doc on valid inputs provided', async () => {
    const ticket = await Ticket.create({
      title: 'concert',
      price: 100,
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticket: ticket.id })
      .expect(201);

    expect(res.body).toEqual({
      id: expect.any(String),
      userId: expect.any(String),
      ticket: ticket.id,
      status: OrderStatus.Created,
      expiresAt: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      __v: expect.any(Number),
    });
  });

  it('should emit an order created event to message queue', async () => {
    const ticket = await Ticket.create({
      title: 'concert',
      price: 100,
    });

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticket: ticket.id })
      .expect(201);

    expect(channel.publish).toHaveBeenCalled();
  });
});
