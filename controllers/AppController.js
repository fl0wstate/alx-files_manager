/*
 * Class AppController that will handle
 * getStatus returns the state of the two server
 * getStat returns the number of data stored in the database
 */

import redisClient from '../utils/redis';
import dbClient from '../utils/db';
// import dbClient from '../test';

class AppController {
  static getStatus(_, res) {
    const obj = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    return res.status(200).send(obj);
  }

  static async getStats(_, res) {
    const result = {
      users: await dbClient.numberOfUsers(),
      // testing purpose only
      // movies: await dbClient.numberOfMovies(),
      files: await dbClient.numberOfFiles(),
    };
    return res.status(200).send(result);
  }
}

module.exports = AppController;
