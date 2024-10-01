#!/usr/bin/env node
/**
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
 *
 *
 */
import { createHash } from 'crypto';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
// import dbClient from '../test';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const resultTest = await dbClient.nbFindUsers({ email });

    if (resultTest) {
      return res.status(400).send({ error: 'Already exist' });
    }

    const hashpass = createHash('sha1').update(password).digest('hex');
    const result = await dbClient.pnUser({ email, password: hashpass });

    if (!result) {
      return res.status(500).send({ Error: 'Internal Server Error' });
    }
    return res.status(201).send({ id: result, email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    let userId;
    let key;

    try {
      if (token) key = `auth_${token}`;
      userId = await redisClient.get(key);
    } catch (err) {
      console.log('Caught error: ', err);
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const result = await dbClient.nbFindUsers({ _id: new ObjectId(userId) });

    if (!result) {
      return res.status(404).send({ error: 'No user found' });
    }

    const { email } = result;

    return res.status(200).send({ id: userId, email });
  }
}

module.exports = UsersController;
