/**
 * RedisClient
 */

import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnected = false;
    this.setAsycn = promisify(this.client.set).bind(this.client);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    // handle the connection events
    this.connectionPromise = this.setUpConnection();
  }

  setUpConnection() {
    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('Connection to redis-server success');
        resolve();
      });
      this.client.on('error', (err) => {
        this.isConnected = false;
        console.log('Error while connection to the redis-server', err);
        reject(err);
      });
    });
  }

  async waitForConnection() {
    await this.connectionPromise;
  }

  async get(getKey) {
    try {
      if (typeof getKey === 'string') {
        await this.getAsync(getKey);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async set(setKey, value, duration) {
    try {
      await this.setAsycn(setKey, value, 'EX', duration);
    } catch (err) {
      console.log(err);
    }
  }

  async del(targetKey) {
    if (this.isConnected) {
      try {
        if (typeof targetKey === 'string') await this.delAsync(targetKey);
      } catch (err) {
        console.log(err);
      }
    }
  }

  isAlive() {
    // i tried implementing all i could but ended up with this conclusion
    return this.isConnected;
  }
}

// we need an instance of the redis class
const redisClient = new RedisClient();
module.exports = redisClient;
