import { createClient } from "redis";

export const client = createClient({
  // ... (see https://github.com/redis/node-redis/blob/master/docs/client-configuration.md)
});
client.connect();
