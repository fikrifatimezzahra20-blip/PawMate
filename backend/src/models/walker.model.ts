import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db.js';

export interface WalkerAttributes {
  id: number;
  user_id?: number | null;
  name: string;
  photo_url: string | null;
  bio: string | null;
  rating: number;
  review_count: number;
  distance_km: number | null;
  price_per_hour: number;
  available: boolean;
}

export type WalkerCreationAttributes = Optional<
  WalkerAttributes,
  'id' | 'user_id' | 'photo_url' | 'bio' | 'rating' | 'review_count' | 'distance_km' | 'available'
>;

export class Walker
  extends Model<WalkerAttributes, WalkerCreationAttributes>
  implements WalkerAttributes
{
  declare id: number;
  declare user_id: number | null;
  declare name: string;
  declare photo_url: string | null;
  declare bio: string | null;
  declare rating: number;
  declare review_count: number;
  declare distance_km: number | null;
  declare price_per_hour: number;
  declare available: boolean;
}

Walker.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 5.0,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    distance_km: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    price_per_hour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'walkers',
    timestamps: false,
  }
);

export type WalkerType = WalkerAttributes;

export const getAllWalkers = async (): Promise<WalkerAttributes[]> => {
  const walkers = await Walker.findAll({
    where: { available: true },
    order: [
      ['rating', 'DESC'],
      ['id', 'ASC'],
    ],
  });

  return walkers.map((w: Walker) => w.get({ plain: true }));
};

export const getWalkerById = async (
  id: number
): Promise<WalkerAttributes | null> => {
  const walker = await Walker.findByPk(id);
  return walker ? walker.get({ plain: true }) : null;
};

export default Walker;
