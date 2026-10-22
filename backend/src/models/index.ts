import sequelize from '../config/db.js';
import User, { findUserByEmail, findUserById, createUser, createWalkerAccountAndLink } from './user.model.js';
import Walker, { getAllWalkers, getWalkerById } from './walker.model.js';
import Dog, { getAllDogs, createDog } from './dog.model.js';
import Booking, { getAllBookings, createBooking, updateBookingStatus } from './booking.model.js';
import './associations.js';

export {
  sequelize,
  User,
  findUserByEmail,
  findUserById,
  createUser,
  createWalkerAccountAndLink,
  Walker,
  getAllWalkers,
  getWalkerById,
  Dog,
  getAllDogs,
  createDog,
  Booking,
  getAllBookings,
  createBooking,
  updateBookingStatus,
};

export default {
  sequelize,
  User,
  Walker,
  Dog,
  Booking,
};
