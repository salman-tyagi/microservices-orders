import express, { Request, Response } from 'express';
import { NotFoundException, protect, Source, validate } from '@tyagi-s/common';

import { OrderParamDto, orderParamDto } from '../dtos/order.dto';
import { Order } from '../models/order.model';

export const router = express.Router();

router.get(
  '/api/orders/:orderId',
  protect,
  validate(Source.PARAMS, orderParamDto),
  async (req: Request<OrderParamDto>, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId!, userId: req.user!.id });

    if (!order) throw NotFoundException('Order not found');

    res.send(order);
  },
);
