import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db.js';
import Walker from './walker.model.js';
import Dog from './dog.model.js';

export interface BookingAttributes {
  id: number;
  walker_id: number;
  dog_id: number;
  booking_date: Date;
  duration_hours: number | string;
  total_price: number | string;
  status: string;
  created_at?: Date;
  walker_name?: string;
  dog_name?: string;
}

export type BookingCreationAttributes = Optional<
  BookingAttributes,
  'id' | 'status' | 'created_at' | 'walker_name' | 'dog_name'
>;

export class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  declare id: number;
  declare walker_id: number;
  declare dog_id: number;
  declare booking_date: Date;
  declare duration_hours: number | string;
  declare total_price: number | string;
  declare status: string;
  declare created_at: Date;
  declare walker_name?: string;
  declare dog_name?: string;

  declare walker?: Walker;
  declare dog?: Dog;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    walker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dog_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    booking_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export type BookingType = BookingAttributes;

export interface CreateBookingInput {
  owner_id: number;
  walker_id: number;
  dog_id: number;
  booking_date: string;
  duration_hours: number;
}

export const getAllBookings = async (
  userId: number,
  role: 'owner' | 'walker'
): Promise<BookingAttributes[]> => {
  const dogInclude =
    role === 'owner'
      ? {
          model: Dog,
          as: 'dog',
          attributes: ['id', 'name', 'owner_id'],
          where: { owner_id: userId },
          required: true,
        }
      : {
          model: Dog,
          as: 'dog',
          attributes: ['id', 'name', 'owner_id'],
          required: false,
        };

  const walkerInclude =
    role === 'walker'
      ? {
          model: Walker,
          as: 'walker',
          attributes: ['id', 'name', 'user_id'],
          where: { user_id: userId },
          required: true,
        }
      : {
          model: Walker,
          as: 'walker',
          attributes: ['id', 'name', 'user_id'],
          required: false,
        };

  const bookings = await Booking.findAll({
    include: [dogInclude, walkerInclude],
    order: [['created_at', 'DESC']],
  });

  return bookings.map((b: Booking) => {
    const plain = b.get({ plain: true }) as BookingAttributes & {
      walker?: { name: string };
      dog?: { name: string };
    };

    return {
      id: plain.id,
      walker_id: plain.walker_id,
      dog_id: plain.dog_id,
      booking_date: plain.booking_date,
      duration_hours: plain.duration_hours,
      total_price: plain.total_price,
      status: plain.status,
      walker_name: plain.walker?.name,
      dog_name: plain.dog?.name,
      created_at: plain.created_at,
    };
  });
};

export const createBooking = async (
  bookingInput: CreateBookingInput
): Promise<BookingAttributes | null> => {
  return await sequelize.transaction(async (t) => {
    const dog = await Dog.findOne({
      where: { id: bookingInput.dog_id, owner_id: bookingInput.owner_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!dog) {
      return null;
    }

    const walker = await Walker.findOne({
      where: { id: bookingInput.walker_id, available: true },
      transaction: t,
    });

    if (!walker) {
      return null;
    }

    const totalPrice =
      Number(walker.price_per_hour) * bookingInput.duration_hours;

    const created = await Booking.create(
      {
        walker_id: bookingInput.walker_id,
        dog_id: bookingInput.dog_id,
        booking_date: new Date(bookingInput.booking_date),
        duration_hours: bookingInput.duration_hours,
        total_price: totalPrice,
        status: 'pending',
      },
      { transaction: t }
    );

    return created.get({ plain: true });
  });
};

export const updateBookingStatus = async (
  bookingId: number,
  walkerUserId: number,
  status: 'confirmed' | 'cancelled'
): Promise<BookingAttributes | null> => {
  return await sequelize.transaction(async (t) => {
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        status: 'pending',
      },
      include: [
        {
          model: Walker,
          as: 'walker',
          where: { user_id: walkerUserId },
          required: true,
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!booking) {
      return null;
    }

    booking.status = status;
    await booking.save({ transaction: t });

    return booking.get({ plain: true });
  });
};

export default Booking;
