import pool from '../config/db.js';

export interface Booking {
  id: number;
  walker_id: number;
  dog_id: number;
  booking_date: Date;
  duration_hours: number | string;
  total_price: number | string;
  status: string;
  walker_name?: string;
  dog_name?: string;
}

interface CreateBookingInput {
  owner_id: number;
  walker_id: number;
  dog_id: number;
  booking_date: string;
  duration_hours: number;
}

export const getAllBookings = async (
  userId: number,
  role: 'owner' | 'walker'
): Promise<Booking[]> => {
  const condition =
    role === 'owner' ? 'd.owner_id = $1' : 'w.user_id = $1';

  const result = await pool.query<Booking>(
    `SELECT b.id, b.walker_id, b.dog_id, b.booking_date,
            b.duration_hours, b.total_price, b.status,
            w.name AS walker_name, d.name AS dog_name
     FROM bookings b
     JOIN walkers w ON w.id = b.walker_id
     JOIN dogs d ON d.id = b.dog_id
     WHERE ${condition}
     ORDER BY b.created_at DESC`,
    [userId]
  );

  return result.rows;
};

export const createBooking = async (
  booking: CreateBookingInput
): Promise<Booking | null> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const dogResult = await client.query(
      `SELECT id FROM dogs
       WHERE id = $1 AND owner_id = $2
       FOR UPDATE`,
      [booking.dog_id, booking.owner_id]
    );

    if (dogResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const walkerResult = await client.query(
      `SELECT price_per_hour
       FROM walkers
       WHERE id = $1 AND available = TRUE`,
      [booking.walker_id]
    );

    if (walkerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const totalPrice =
      Number(walkerResult.rows[0].price_per_hour) * booking.duration_hours;

    const result = await client.query<Booking>(
      `INSERT INTO bookings
         (walker_id, dog_id, booking_date, duration_hours, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, walker_id, dog_id, booking_date,
                 duration_hours, total_price, status`,
      [
        booking.walker_id,
        booking.dog_id,
        booking.booking_date,
        booking.duration_hours,
        totalPrice,
      ]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


export const updateBookingStatus = async (
  bookingId: number,
  walkerUserId: number,
  status: 'confirmed' | 'cancelled',
): Promise<Booking | null> => {
  const result = await pool.query<Booking>(
    `UPDATE bookings AS b
     SET status = $3
     FROM walkers AS w
     WHERE b.walker_id = w.id
       AND w.user_id = $2
       AND b.id = $1
       AND b.status = 'pending'
     RETURNING
       b.id,
       b.walker_id,
       b.dog_id,
       b.booking_date,
       b.duration_hours,
       b.total_price,
       b.status`,
    [bookingId, walkerUserId, status],
  );

  return result.rows[0] ?? null;
};
