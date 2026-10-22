import pool from '../config/db.js';

export interface User {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: 'owner' | 'walker';
  phone: string | null;
  profile_photo_url: string | null;
  created_at: Date;
}

export interface CreateUserInput {
  full_name: string;
  email: string;
  password_hash: string;
  role: 'owner' | 'walker';
  phone?: string;
  profile_photo_url?: string;
}

export const findUserByEmail = async (
  email: string
): Promise<User | undefined> => {
  const result = await pool.query<User>(
    `SELECT id, full_name, email, password_hash, role,
            phone, profile_photo_url, created_at
     FROM users
     WHERE email = $1`,
    [email.toLowerCase().trim()]
  );

  return result.rows[0];
};

export const findUserById = async (
  id: number
): Promise<Omit<User, 'password_hash'> | undefined> => {
  const result = await pool.query<Omit<User, 'password_hash'>>(
    `SELECT id, full_name, email, role, phone,
            profile_photo_url, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

export const createUser = async (
  user: CreateUserInput
): Promise<Omit<User, 'password_hash'>> => {
  const result = await pool.query<Omit<User, 'password_hash'>>(
    `INSERT INTO users
      (full_name, email, password_hash, role, phone, profile_photo_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, role, phone,
               profile_photo_url, created_at`,
    [
      user.full_name.trim(),
      user.email.toLowerCase().trim(),
      user.password_hash,
      user.role,
      user.phone ?? null,
      user.profile_photo_url ?? null,
    ]
  );

  return result.rows[0];
};


export const createWalkerAccountAndLink = async (
  user: CreateUserInput,
  walkerId: number,
): Promise<Omit<User, 'password_hash'> | null> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query<Omit<User, 'password_hash'>>(
      `INSERT INTO users
        (full_name, email, password_hash, role, phone, profile_photo_url)
       VALUES ($1, $2, $3, 'walker', $4, $5)
       RETURNING id, full_name, email, role, phone, profile_photo_url, created_at`,
      [
        user.full_name.trim(),
        user.email.toLowerCase().trim(),
        user.password_hash,
        user.phone ?? null,
        user.profile_photo_url ?? null,
      ],
    );

    const newUser = userResult.rows[0];

    const walkerResult = await client.query(
      `UPDATE walkers
       SET user_id = $1
       WHERE id = $2
         AND user_id IS NULL
         AND available = TRUE
       RETURNING id`,
      [newUser.id, walkerId],
    );

    if (walkerResult.rowCount !== 1) {
      await client.query('ROLLBACK');
      return null;
    }

    await client.query('COMMIT');
    return newUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
