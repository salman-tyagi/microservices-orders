import z from 'zod';
import mongoose from 'mongoose';

import { OrderStatus } from '@tyagi-s/common';

const objectIdSchema = (message: string) =>
  z
    .string({ error: `${message} is required` })
    .refine(val => mongoose.Types.ObjectId.isValid(val), {
      error: `${message} is not valid MongoDB ObjectID`,
    }) as unknown as mongoose.Types.ObjectId;

export const baseOrderSchema = z.object({
  userId: objectIdSchema('User id'),
  ticket: objectIdSchema('Ticket id'),
  status: z.enum(OrderStatus).default(OrderStatus.Created),
  expiresAt: z.iso.datetime({ offset: true, error: 'Invalid ISO date-time format' }).optional(),
});
export type BaseOrderSchema = z.infer<typeof baseOrderSchema>;

export type OrderDoc = BaseOrderSchema & mongoose.Document & { version: number };
export type OrderModel = mongoose.Model<OrderDoc> & {
  reservedTicket(ticketId: string): Promise<OrderDoc | null>;
};

export const createOrderDto = baseOrderSchema.pick({ ticket: true });
export type CreateOrderDto = Pick<BaseOrderSchema, 'ticket'>;

export const orderParamDto = z.object({
  orderId: objectIdSchema('Order id'),
});
export type OrderParamDto = Partial<z.infer<typeof orderParamDto>>;
