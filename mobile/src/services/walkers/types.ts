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
  playtime_price?: number | string | null;
  specialty_tag?: string | null;
  badge_type?: string | null;
  experience?: string | null;
  walks_completed?: string | null;
  safety_cert?: string | null;
  tags?: string[] | null;
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
