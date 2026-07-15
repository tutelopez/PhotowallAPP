import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
import { checkEnv } from './config/env.check';
import { startCleanupJob } from './jobs/cleanup.job';

const PORT = process.env.PORT || 3000;
dotenv.config();

async function main() {
  await connectDB();
  await checkEnv();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startCleanupJob();
  });
}

main();
