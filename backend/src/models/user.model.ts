import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db.js';
import Walker from './walker.model.js';

export interface UserAttributes {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: 'owner' | 'walker';
  phone: string | null;
  profile_photo_url: string | null;
  created_at?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'phone' | 'profile_photo_url' | 'created_at'
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare full_name: string;
  declare email: string;
  declare password_hash: string;
  declare role: 'owner' | 'walker';
  declare phone: string | null;
  declare profile_photo_url: string | null;
  declare created_at: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('owner', 'walker'),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    profile_photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export type UserWithoutPassword = Omit<UserAttributes, 'password_hash'>;

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
): Promise<UserAttributes | undefined> => {
  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });

  return user ? user.get({ plain: true }) : undefined;
};

export const findUserById = async (
  id: number
): Promise<UserWithoutPassword | undefined> => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
  });

  return user ? (user.get({ plain: true }) as UserWithoutPassword) : undefined;
};

export const createUser = async (
  input: CreateUserInput
): Promise<UserWithoutPassword> => {
  const user = await User.create({
    full_name: input.full_name.trim(),
    email: input.email.toLowerCase().trim(),
    password_hash: input.password_hash,
    role: input.role,
    phone: input.phone ?? null,
    profile_photo_url: input.profile_photo_url ?? null,
  });

  const plain = user.get({ plain: true });
  const { password_hash: _pass, ...safeUser } = plain;
  return safeUser;
};

export const createWalkerUser = async (
  userInput: CreateUserInput,
  walkerId?: number | null
): Promise<UserWithoutPassword | null> => {
  return await sequelize.transaction(async (t) => {
    // If walkerId is provided, link to that existing walker profile
    if (walkerId) {
      const walker = await Walker.findOne({
        where: {
          id: walkerId,
          user_id: null,
          available: true,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!walker) {
        return null;
      }

      const newUser = await User.create(
        {
          full_name: userInput.full_name.trim(),
          email: userInput.email.toLowerCase().trim(),
          password_hash: userInput.password_hash,
          role: 'walker',
          phone: userInput.phone ?? null,
          profile_photo_url: userInput.profile_photo_url ?? null,
        },
        { transaction: t }
      );

      walker.user_id = newUser.id;
      await walker.save({ transaction: t });

      const plain = newUser.get({ plain: true });
      const { password_hash: _pass, ...safeUser } = plain;
      return safeUser;
    }

    // If walkerId is NOT provided, create the User and create their Walker profile
    const newUser = await User.create(
      {
        full_name: userInput.full_name.trim(),
        email: userInput.email.toLowerCase().trim(),
        password_hash: userInput.password_hash,
        role: 'walker',
        phone: userInput.phone ?? null,
        profile_photo_url: userInput.profile_photo_url ?? null,
      },
      { transaction: t }
    );

    await Walker.create(
      {
        user_id: newUser.id,
        name: newUser.full_name,
        photo_url: newUser.profile_photo_url ?? null,
        bio: 'Dedicated and caring dog walker ready to provide fun, safe walks for your pets.',
        rating: 5.0,
        review_count: 0,
        price_per_hour: 20.0,
        available: true,
      },
      { transaction: t }
    );

    const plain = newUser.get({ plain: true });
    const { password_hash: _pass, ...safeUser } = plain;
    return safeUser;
  });
};

export const createWalkerAccountAndLink = createWalkerUser;

export default User;
