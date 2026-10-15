import type { Request, Response, NextFunction } from 'express';
import { getAllWalkers } from '../models/walker.model.js';

export const getWalkers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const walkers = await getAllWalkers();

    res.status(200).json({
      status: 'success',
      count: walkers.length,
      data: walkers,
    });
  } catch (error) {
    next(error);
  }
};
