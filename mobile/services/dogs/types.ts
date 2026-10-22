export interface Dog {
  id: number;
  owner_id: number | null;
  owner_name: string;
  name: string;
  breed: string | null;
  age_years: number | null;
  notes: string | null;
  created_at: string;
}

export interface CreateDogInput {
  name: string;
  breed?: string;
  age_years?: number;
  notes?: string;
}

export interface GetDogsResponse {
  status: string;
  count: number;
  data: Dog[];
}

export interface CreateDogResponse {
  status: string;
  message: string;
  data: Dog;
}
