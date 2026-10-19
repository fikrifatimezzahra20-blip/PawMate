import pool from '../config/db.js';

export interface Dog {
  id: number;
  owner_name: string;
  name: string;
  breed: string | null;
  age_years: number | string | null;
  notes: string | null;
  created_at: Date;
}

interface CreateDogInput {
  owner_name: string;
  name: string;
  breed?: string;
  age_years?: number;
  notes?: string;
}

export const getAllDogs = async (): Promise<Dog[]> => {
  const result = await pool.query<Dog>(`
    SELECT id, owner_name, name, breed, age_years, notes, created_at
    FROM dogs
    ORDER BY id DESC
  `);

  return result.rows;
};

export const createDog = async (
  dog: CreateDogInput
): Promise<Dog> => {
  const result = await pool.query<Dog>(
    `INSERT INTO dogs
      (owner_name, name, breed, age_years, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, owner_name, name, breed, age_years, notes, created_at`,
    [
      dog.owner_name,
      dog.name,
      dog.breed ?? null,
      dog.age_years ?? null,
      dog.notes ?? null,
    ]
  );

  return result.rows[0];
};
