import pool from './db.js';

export const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE dogs
      ADD COLUMN IF NOT EXISTS owner_id INTEGER
      REFERENCES users(id) ON DELETE SET NULL
    `);

    await client.query(`
      ALTER TABLE walkers
      ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE
      REFERENCES users(id) ON DELETE SET NULL
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_dogs_owner_id
      ON dogs(owner_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_dog_id
      ON bookings(dog_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_walker_id
      ON bookings(walker_id)
    `);

    await client.query('COMMIT');
    console.log('Database migrations completed.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
