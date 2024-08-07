/**
 * Making a simple RedisClient class
 * Creates a blue print that will allow me to work
 * with different Redis-server commands
 * Functions:
 *  @get: returns data from the redis Redis-server
 *  @set: sets new data to the Redis-server
 *  @del: deletes the data with the matching key from the database
 *
 * Error Handling:
 *  - All reids commands failure are captured by the `on('error event')`
 */

import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnected = false;

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to Redis server');
    });

    this.client.on('ready', () => {
      console.log('Redis client ready');
    });

    this.client.on('end', () => {
      console.log('Connection to Redis server ended');
      this.isConnected = false;
    });

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
      this.isConnected = false;
    });
  }

  set(key, value, duration) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Could not connect to the Redis server'));
    }
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, result) => {
        if (err) {
          console.error('Error setting key:', err);
          return reject(new Error('Error setting key'));
        }
        return resolve(result);
      });
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, result) => {
        if (err) {
          console.error('Error retrieving value:', err);
          return reject(new Error('Error retrieving value'));
        }
        return resolve(result);
      });
    });
  }

  del(key) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Could not connect to the Redis server'));
    }
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, result) => {
        if (err) {
          console.error('Error deleting key:', err);
          return reject(new Error('Error deleting key'));
        }
        return resolve(result);
      });
    });
  }

  isAlive() {
    return this.isConnected;
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
