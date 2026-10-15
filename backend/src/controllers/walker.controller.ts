import type { Request, Response, NextFunction } from 'express';
import { getAllWalkers } from '../models/walker.model.js';
import { getWalkerById as findWalkerById } from '../models/walker.model.js';

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

export const getWalkerDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid walker ID',
      });
      return;
    }

    const walker = await findWalkerById(id);

    if (!walker) {
      res.status(404).json({
        status: 'error',
        message: 'Walker not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: walker,
    });
  } catch (error) {
    next(error);
  }
};

