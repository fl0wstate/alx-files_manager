/*
 * Simple endpoint that adds users to the database
 * POST /users which creates a new user in the database
 *
 *Error Handling:
 *  invalid email -> `Missing email` status Code 400
 *  invalid password -> `Missing password` status Code 400
 *  Email exists -> `Already exists` status Code 400
 *
 *Valid users:
 *  Valid -> return new user with email and id status Code 201
 *  password -> must be hashed with SHA1
 *  users -> all users should be stored in the users collection
 */

import { createHash } from 'crypto';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
// import dbClient from '../test';

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) return res.status(400).send({ error: 'Missing email' });

      if (!password) return res.status(400).send({ error: 'Missing password' });

      const resultTest = await dbClient.findUser({ email });

      if (resultTest) return res.status(400).send({ error: 'Already exist' });

      const hashpass = createHash('sha1').update(password).digest('hex');

      const result = await dbClient.postNewUser({ email, password: hashpass });

      return res.status(201).send({ id: result, email });
    } catch (err) {
      // console.log(err);
      return res.status(500).send('Internal server error while posting new user to the database: ', err);
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];

      if (!token) return res.status(404).send({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) return res.status(401).send({ error: 'Unauthorized' });

      const result = await dbClient.nbFindUsers({ _id: new ObjectId(userId) });

      if (!result) return res.status(404).send({ error: 'No user found' });

      const { email } = result;

      return res.status(200).send({ id: userId, email });
    } catch (err) {
      // console.log(err);
      return res.status(500).send('Internal server error while retriving user from the database: ', err);
    }
  }
}

export defualt UsersController;
