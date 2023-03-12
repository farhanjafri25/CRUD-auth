const redis = require('redis');
import * as dotenv from 'dotenv';
import * as path from 'path';
const envPath = path.join(
  process.cwd(),
  process.env.NODE_ENV ? `envs/.env.${process.env.NODE_ENV}` : `/.env`,
);
dotenv.config({
  path: envPath,
});

const client = redis.createClient({
  host: `127.0.0.1`,
  port: `6379`,
});

client
  .connect()
  .then(() => {
    console.log(`<---------- redis connected ----------->`);
  })
  .catch((err: any) => {
    console.log(err);
  });

module.exports = client;
