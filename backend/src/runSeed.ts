import 'dotenv/config';
import { runMigrations } from './config/migrations.js';
import { seedDatabase } from './config/seed.js';

const run = async () => {
  try {
    await runMigrations();
    await seedDatabase();
    console.log('Seeding CLI script finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding CLI script failed:', error);
    process.exit(1);
  }
};

run();
