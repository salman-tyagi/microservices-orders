import mongoose from 'mongoose';
import { OrderStatus } from '@tyagi-s/common';

import { BaseOrderSchema, OrderModel } from '../dtos/order.dto';

const EXPIRATION_ORDER_WINDOW = 10 * 60 * 1000;

const orderSchema = new mongoose.Schema<BaseOrderSchema, OrderModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
      index: true,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      default: new Date(Date.now() + EXPIRATION_ORDER_WINDOW),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    versionKey: 'version',
    optimisticConcurrency: true,
  },
);

orderSchema.static('reservedTicket', function (ticketId: mongoose.Types.ObjectId) {
  return this.findOne({
    ticket: ticketId,
    status: {
      $ne: OrderStatus.Cancelled,
    },
  });
});

export const Order = mongoose.model<BaseOrderSchema, OrderModel>('Order', orderSchema);
