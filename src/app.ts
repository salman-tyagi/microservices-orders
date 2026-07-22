import express from 'express';
import cookieParser from 'cookie-parser';

import { notFoundHandler, globalErrorHandler } from '@tyagi-s/common';

import { router as createOrderRouter } from './routes/create-order';
import { router as findOrderRouter } from './routes/find-order';
import { router as findOrdersRouter } from './routes/find-orders';
import { router as deleteOrderRouter } from './routes/delete-order';

export const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(createOrderRouter);
app.use(findOrderRouter);
app.use(findOrdersRouter);
app.use(deleteOrderRouter);

app.all('*splat', notFoundHandler);

app.use(globalErrorHandler);
