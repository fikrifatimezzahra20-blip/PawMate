import type { Request, Response, NextFunction } from 'express';
import { getAllDogs, createDog } from '../models/dog.model.js';

export const getDogs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user as { userId: number; role: string };
    const dogs = await getAllDogs(user.userId);

    res.status(200).json({
      status: 'success',
      count: dogs.length,
      data: dogs,
    });
  } catch (error) {
    next(error);
  }
};

export const addDog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user as { userId: number; role: string };
    const { name, breed, age_years, notes } = req.body ?? {};

    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
      res.status(400).json({
        status: 'error',
        message: 'A valid dog name is required (maximum 100 characters).',
      });
      return;
    }

    if (breed !== undefined && (typeof breed !== 'string' || breed.length > 100)) {
      res.status(400).json({ status: 'error', message: 'Invalid breed.' });
      return;
    }

    if (
      age_years !== undefined &&
      (typeof age_years !== 'number' ||
        !Number.isFinite(age_years) ||
        age_years < 0 ||
        age_years > 100)
    ) {
      res.status(400).json({
        status: 'error',
        message: 'Age must be a number between 0 and 100.',
      });
      return;
    }

    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 2000)) {
      res.status(400).json({ status: 'error', message: 'Invalid notes.' });
      return;
    }

    const dog = await createDog({
      owner_id: user.userId,
      name: name.trim(),
      breed,
      age_years,
      notes,
    });

    if (!dog) {
      res.status(403).json({
        status: 'error',
        message: 'Only an owner account can add a dog.',
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      message: 'Dog created successfully.',
      data: dog,
    });
  } catch (error) {
    next(error);
  }
};
