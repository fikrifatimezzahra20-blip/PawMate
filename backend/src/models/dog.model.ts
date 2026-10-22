import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.model.js';

export interface DogAttributes {
  id: number;
  owner_id: number | null;
  owner_name: string;
  name: string;
  breed: string | null;
  age_years: number | string | null;
  notes: string | null;
  created_at?: Date;
}

export type DogCreationAttributes = Optional<
  DogAttributes,
  'id' | 'owner_id' | 'breed' | 'age_years' | 'notes' | 'created_at'
>;

export class Dog
  extends Model<DogAttributes, DogCreationAttributes>
  implements DogAttributes
{
  declare id: number;
  declare owner_id: number | null;
  declare owner_name: string;
  declare name: string;
  declare breed: string | null;
  declare age_years: number | string | null;
  declare notes: string | null;
  declare created_at: Date;
}

Dog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    owner_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    breed: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    age_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'dogs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export type DogType = DogAttributes;

export interface CreateDogInput {
  owner_id: number;
  name: string;
  breed?: string;
  age_years?: number;
  notes?: string;
}

export const getAllDogs = async (ownerId: number): Promise<DogAttributes[]> => {
  const dogs = await Dog.findAll({
    where: { owner_id: ownerId },
    order: [['id', 'DESC']],
  });

  return dogs.map((d: Dog) => d.get({ plain: true }));
};

export const createDog = async (
  dogInput: CreateDogInput
): Promise<DogAttributes | null> => {
  const owner = await User.findOne({
    where: { id: dogInput.owner_id, role: 'owner' },
  });

  if (!owner) {
    return null;
  }

  const created = await Dog.create({
    owner_id: owner.id,
    owner_name: owner.full_name,
    name: dogInput.name,
    breed: dogInput.breed ?? null,
    age_years: dogInput.age_years ?? null,
    notes: dogInput.notes ?? null,
  });

  return created.get({ plain: true });
};

export default Dog;
