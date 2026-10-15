import pool from '../config/db.js';

export interface Walker {
  id: number;
  name: string;
  photo_url: string | null;
  bio: string | null;
  rating: number;
  review_count: number;
  distance_km: number | null;
  price_per_hour: number;
  available: boolean;
}

export const getAllWalkers = async (): Promise<Walker[]> => {
  const result = await pool.query<Walker>(`
    SELECT
      id,
      name,
      photo_url,
      bio,
      rating,
      review_count,
      distance_km,
      price_per_hour,
      available
    FROM walkers
    WHERE available = TRUE
    ORDER BY rating DESC, id ASC
  `);

  return result.rows;
};



export const getWalkerById = async (
  id: number
): Promise<Walker | null> => {
  const result = await pool.query<Walker>(
    `SELECT
      id,
      name,
      photo_url,
      bio,
      rating,
      review_count,
      distance_km,
      price_per_hour,
      available
    FROM walkers
    WHERE id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
};
