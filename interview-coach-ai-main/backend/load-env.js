// This file must be the FIRST thing loaded.
// Use: node --import ./load-env.js server.js
// Or:  import './load-env.js' as the first line of server.js (works in Node 18+)
import { config } from 'dotenv';
config();
