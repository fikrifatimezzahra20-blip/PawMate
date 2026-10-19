import type { Request, Response, NextFunction } from 'express';
import {
  getAllDogs,
  createDog,
} from '../models/dog.model.js';

export const getDogs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dogs = await getAllDogs();

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
    const { owner_name, name, breed, age_years, notes } = req.body;

    if (
      typeof owner_name !== 'string' ||
      !owner_name.trim() ||
      typeof name !== 'string' ||
      !name.trim()
    ) {
      res.status(400).json({
        status: 'error',
        message: 'Owner name and dog name are required.',
      });
      return;
    }

    if (
      age_years !== undefined &&
      (
        typeof age_years !== 'number' ||
        !Number.isFinite(age_years) ||
        age_years < 0 ||
        age_years > 100
      )
    ) {
      res.status(400).json({
        status: 'error',
        message: 'Age must be a valid number between 0 and 100.',
      });
      return;
    }

    const dog = await createDog({
      owner_name: owner_name.trim(),
      name: name.trim(),
      breed,
      age_years,
      notes,
    });

    res.status(201).json({
      status: 'success',
      message: 'Dog created successfully.',
      data: dog,
    });
  } catch (error) {
    next(error);
  }
};
