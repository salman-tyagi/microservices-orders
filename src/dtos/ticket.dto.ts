import mongoose from 'mongoose';
import z from 'zod';

export const ticketBaseSchema = z.object({
  title: z.string().nonempty().trim().max(50),
  price: z.coerce.number<number>().int().positive().max(5),
});
export type TicketBaseSchema = z.infer<typeof ticketBaseSchema>;

export type TicketDoc = TicketBaseSchema & mongoose.Document & { version: number };

export type TicketModel = mongoose.Model<TicketDoc> & {
  findByEvent(event: { id: string; version: number }): Promise<TicketDoc | null>;
};

export const createTicketDto = ticketBaseSchema;
export type CreateTicketDto = TicketBaseSchema;
