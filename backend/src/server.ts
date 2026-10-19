import 'dotenv/config';
import app from './app.js';
import { runMigrations } from './config/migrations.js';

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();