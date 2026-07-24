import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket.model';
import { OrderStatus } from '@tyagi-s/common';

const createTicket = () => {
  return Ticket.create({ title: 'concert', price: 100 });
};

describe('GET /api/orders', () => {
  it('/api/orders GET route must be defined', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).not.toBe(404);
  });

  it('should throw unauthorized error if user is not signed in', async () => {
    const res = await request(app).get('/api/orders').expect(401);

    expect(res.body).toEqual({
      status: 'fail',
      statusCode: 401,
      message: "You're not logged in",
      timestamp: expect.any(String),
    });
  });

  it('should return all orders', async () => {
    // Create three tickets
    const ticket1 = await createTicket();
    const ticket2 = await createTicket();
    const ticket3 = await createTicket();

    // Create ticket 1 for user 1
    const cookie1 = global.signin();

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie1)
      .send({ ticket: ticket1.id })
      .expect(201);

    // Create 2 tickets for user 2
    const cookie2 = global.signin();

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie2)
      .send({ ticket: ticket2.id })
      .expect(201);

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie2)
      .send({ ticket: ticket3.id })
      .expect(201);

    const res = await request(app).get('/api/orders').set('Cookie', cookie2).expect(200);

    const orderDoc = {
      id: expect.any(String),
      userId: expect.any(String),
      ticket: {
        id: expect.any(String),
        title: 'concert',
        price: 100,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: expect.any(Number),
      },
      status: OrderStatus.Created,
      expiresAt: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      version: expect.any(Number),
    };

    expect(res.body.length).toEqual(2);
    expect(res.body).toEqual([orderDoc, orderDoc]);
  });
});
