#!/usr/bin/env node
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
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.connected = false;

    this.client.on('error', (err) => {
      console.error('Redis client not connected to the server:', err);
    });

    this.client.on('connect', () => {
      this.connected = true;
      console.log('Redis client connected to the server');
    });

    this.connected = this.client.on('ready', () => {
      console.log('Redis client ready');
    });

    this.client.on('end', () => {
      console.log('Redis client disconnected');
    });

    this.setAsync = promisify(this.client.setex).bind(this.client);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  async set(key, value, duration) {
    await this.setAsync(key, value, duration);
  }

  async get(key) {
    this.result = await this.getAsync(key);
    return this.result;
  }

  async del(key) {
    await this.delAsync(key);
  }

  isAlive() {
    return this.connected;
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
