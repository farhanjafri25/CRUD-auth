import { createClient } from 'redis';
const redisURL = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
console.log({ redisURL }, process.env.REDIS_URL);

const client = createClient({
  url: redisURL,
});

client
  .connect()
  .then(() => {
    console.log(`<---------- redis connected ----------->`);
  })
  .catch((err: any) => {
    console.log(err);
  });

export default client;
