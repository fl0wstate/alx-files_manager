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
    let result;
    if (key && typeof key === 'string') {
      try {
        result = await this.getAsync(key);
      } catch (err) {
        return err;
      }
    }
    return result;
  }

  async set(key, value, expirationInSeconds) {
    let result;
    if (key && value && typeof key === 'string') {
      try {
        if (expirationInSeconds) {
          result = await this.setAsync(key, value, 'EX', expirationInSeconds);
        }
      } catch (err) {
        console.log(err);
      }
    }
    return result;
  }

  async del(key) {
    let result;
    if (key && typeof key === 'string') {
      try {
        result = await this.delAsync(key);
      } catch (err) {
        console.log(err);
      }
    }
    return result;
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
