/*
 * Making a simple RedisClient class
 * Creates a blue print that will allow me to work
 * with different Redis-server commands
 * Functions:
 *  @get: async func that retrives data from the redis Redis-server
 *  @set: sets new data to the Redis-server
 *  @del: deletes the data with the matching key from the database
 *
 * Error Handling:
 *  - All reids commands failure are captured by the `on('error event')`
 */

import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.isConnected = false;
    this.client = createClient();
    this.setUpConnection();
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  setUpConnection() {
    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('Connection to redis-server success');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      console.log('Error while connecting to the redis-server', err);
    });

    this.client.on('end', () => {
      this.isConnected = false;
      console.log('Connection to redis-server ended');
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    if (key && typeof key === 'string') {
      try {
        return this.getAsync(key);
      } catch (err) {
        return err;
      }
    }
  }

  async set(key, value, expirationInSeconds) {
    if (key && value && typeof key === 'string') {
      try {
        if (expirationInSeconds) {
          return this.setAsync(key, value, 'EX', expirationInSeconds);
        }
        console.log('you are now using SET redis function');
        return this.setAsync(key, value);
      } catch (err) {
        console.log(err);
      }
    }
  }

  async del(key) {
    if (key && typeof key === 'string') {
      try {
        return this.delAsync(key);
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
