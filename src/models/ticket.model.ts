import mongoose from 'mongoose';

import { TicketDoc, TicketModel } from '../dtos/ticket.dto';

const ticketSchema = new mongoose.Schema<TicketDoc, TicketModel>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
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

ticketSchema.static('findByEvent', async function (event: { id: string; version: number }) {
  return this.findOne({ _id: event.id, version: event.version - 1 });
});

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
