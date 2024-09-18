import 'dotenv/config';

import assert from 'assert';

import Database from '@netsocks/classes/Database';

process.env.TZ = 'UTC';

if (process.env.NODE_ENV === 'dev') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const {
  DATABASE_URL,
  PORT,
  BIND_IP
} = process.env;

const bootstrap = async () => {

  if (DATABASE_URL) {
    await Database.connect(DATABASE_URL);
  }

  assert(PORT, 'Please set a listening PORT in .env');

  const app = (await import('./app')).default;

  app.listen(PORT as unknown as number, BIND_IP);
};


export default bootstrap;
