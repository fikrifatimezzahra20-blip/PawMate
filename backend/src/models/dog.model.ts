import pool from '../config/db.js';

export interface Dog {
  id: number;
  owner_id: number | null;
  owner_name: string;
  name: string;
  breed: string | null;
  age_years: number | string | null;
  notes: string | null;
  created_at: Date;
}

interface CreateDogInput {
  owner_id: number;
  name: string;
  breed?: string;
  age_years?: number;
  notes?: string;
}

export const getAllDogs = async (ownerId: number): Promise<Dog[]> => {
  const result = await pool.query<Dog>(
    `SELECT id, owner_id, owner_name, name, breed, age_years, notes, created_at
     FROM dogs
     WHERE owner_id = $1
     ORDER BY id DESC`,
    [ownerId]
  );

  return result.rows;
};

export const createDog = async (dog: CreateDogInput): Promise<Dog | null> => {
  const result = await pool.query<Dog>(
    `INSERT INTO dogs (owner_id, owner_name, name, breed, age_years, notes)
     SELECT id, full_name, $2, $3, $4, $5
     FROM users
     WHERE id = $1 AND role = 'owner'
     RETURNING id, owner_id, owner_name, name, breed, age_years, notes, created_at`,
    [
      dog.owner_id,
      dog.name,
      dog.breed ?? null,
      dog.age_years ?? null,
      dog.notes ?? null,
    ]
  );

  return result.rows[0] ?? null;
};
