import express, { Request, Response } from 'express';
import { protect } from '@tyagi-s/common';

import { Order } from '../models/order.model';

export const router = express.Router();

router.get('/api/orders', protect, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.user!.id }).populate('ticket');

  res.send(orders);
});
