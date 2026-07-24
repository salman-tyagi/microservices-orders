import express, { Request, Response } from 'express';
import { protect, validate, Source, NotFoundException, BadRequestException } from '@tyagi-s/common';

import { createOrderDto, CreateOrderDto } from '../dtos/order.dto';
import { Order } from '../models/order.model';
import { Ticket } from '../models/ticket.model';
import { OrderCreatedPublisher } from '../events/publishers/order-created.publisher';
import { channel } from '../rabbitmq';

export const router = express.Router();

router.post(
  '/api/orders',
  protect,
  validate(Source.BODY, createOrderDto),
  async (req: Request<any, any, CreateOrderDto>, res: Response) => {
    // Find the ticket the user is trying to order in the database
    const { ticket: ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) throw NotFoundException('Ticket not found');

    // Make sure the ticket is not not already reserved
    const reserved = await Order.reservedTicket(ticket.id);

    if (reserved) throw BadRequestException('Ticket is already reserved');

    // Calculate the expiration date for this order
    // Create order and save it into the database
    const order = await Order.create({
      ticket: ticket.id,
      userId: req.user!.id,
    });

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(channel).publish({
      id: order.id,
      userId: req.user!.id,
      status: order.status,
      expiresAt: order.expiresAt!,
      ticket: { id: ticket.id, price: ticket.price },
      version: order.version,
    });

    res.status(201).send(order);
  },
);
