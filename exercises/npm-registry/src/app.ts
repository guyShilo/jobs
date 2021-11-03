import * as express from 'express';
import { getPackage } from './package';

import cors = require('cors');
/**
 * Bootstrap the application framework
 */
export function createApp() {
  const app = express();

  app.use(cors())
  app.use(express.json());

  app.get('/package/:name/:version', getPackage);

  return app;
}
