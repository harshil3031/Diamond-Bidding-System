import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';                  // note .js for ESM
import { checkDbConnection } from '../config/database.js';

const PORT = process.env.PORT || 5000;

await checkDbConnection();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
