export interface Walker {
  id: number;
  user_id?: number | null;
  name: string;
  photo_url: string | null;
  bio: string | null;
  rating: number;
  review_count: number;
  distance_km: number | null;
  price_per_hour: number | string;
  available: boolean;
}

export interface GetWalkersResponse {
  status: string;
  count: number;
  data: Walker[];
}

export interface GetWalkerDetailsResponse {
  status: string;
  data: Walker;
}
