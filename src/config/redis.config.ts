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
  host: `${process.env.REDIS_HOST}`,
  port: `${process.env.REDIS_PORT}`,
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
