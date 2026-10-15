import express from 'express';
import cors from 'cors';

import walkerRoutes from './routes/walker.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'PawMate API is running!',
  });
});

app.use('/api/walkers', walkerRoutes);

app.use(errorMiddleware);

export default app;
