
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  createUser,
  createWalkerAccountAndLink,
  findUserByEmail,
  findUserById,
} from '../models/user.model.js';

const createToken = (userId: number, role: 'owner' | 'walker') => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is missing from environment variables');
  }

  return jwt.sign({ userId, role }, secret, { expiresIn: '1d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      phone,
      walker_id,
    } = req.body ?? {};

    if (
      typeof full_name !== 'string' ||
      !full_name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !['owner', 'walker'].includes(role)
    ) {
      return res.status(400).json({
        message: 'Full name, email, password and a valid role are required.',
      });
    }

    if (full_name.trim().length > 100) {
      return res.status(400).json({
        message: 'Full name must be 100 characters or fewer.',
      });
    }

    if (email.trim().length > 255) {
      return res.status(400).json({
        message: 'Email is too long.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters.',
      });
    }

    if (
      phone !== undefined &&
      (typeof phone !== 'string' || phone.length > 30)
    ) {
      return res.status(400).json({
        message: 'Invalid phone number.',
      });
    }

    if (
      role === 'walker' &&
      (!Number.isInteger(walker_id) || walker_id <= 0)
    ) {
      return res.status(400).json({
        message: 'A valid walker_id is required for walker registration.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    let user;

    if (role === 'walker') {
      user = await createWalkerAccountAndLink(
        {
          full_name,
          email: normalizedEmail,
          password_hash,
          role: 'walker',
          phone,
        },
        walker_id,
      );

      if (!user) {
        return res.status(409).json({
          message:
            'This walker profile is unavailable or already linked to an account.',
        });
      }
    } else {
      user = await createUser({
        full_name,
        email: normalizedEmail,
        password_hash,
        role,
        phone,
      });
    }

    const token = createToken(user.id, user.role);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    console.error('Register error:', error);

    return res.status(500).json({
      message: 'Unable to create account.',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const user = await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const token = createToken(user.id, user.role);

    const { password_hash: _passwordHash, ...safeUser } = user;

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Unable to log in.',
    });
  }
};

export const getMe = async (_req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.userId;

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve profile.',
    });
  }
};
