import sequelize from './db.js';
import '../models/associations.js';

export const runMigrations = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connected to PostgreSQL successfully.');

    // Synchronize models with the database schema
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Sequelize synchronization error:', error);
    throw error;
  }
};

export default runMigrations;
