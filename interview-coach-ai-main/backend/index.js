// Entry point — loads .env BEFORE any other module is imported.
// This solves the ESM hoisting problem where import statements run
// before dotenv.config() when everything is in a single file.

import { config } from 'dotenv';
config(); // process.env is now populated

// Dynamically import server AFTER env vars are loaded
await import('./server.js');
