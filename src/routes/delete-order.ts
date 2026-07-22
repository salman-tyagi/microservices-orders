import { NotFoundException, OrderStatus, protect, Source, validate } from '@tyagi-s/common';
import express, { Request, Response } from 'express';

import { OrderParamDto, orderParamDto } from '../dtos/order.dto';
import { Order } from '../models/order.model';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled.publisher';
import { channel } from '../rabbitmq';

export const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  protect,
  validate(Source.PARAMS, orderParamDto),
  async (req: Request<OrderParamDto>, res: Response) => {
    const { orderId } = req.params;

    const deletedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId!,
        userId: req.user!.id,
      },
      {
        status: OrderStatus.Cancelled,
      },
      { returnDocument: 'after', runValidators: true },
    ).populate<{ ticket: { id: string; title: string; price: number } }>('ticket');


    if (!deletedOrder) throw NotFoundException('Order not found to delete');

    // Publish a cancelled order event
    new OrderCancelledPublisher(channel).publish({
      id: deletedOrder.id,
      ticket: { id: deletedOrder.ticket.id },
    });

    res.status(204).send(deletedOrder);
  },
);
