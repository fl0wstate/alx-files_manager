/**
 * Simple endpoint that adds users to the database
 * POST /users which creates a new user in the database
 * Error Handling:
 *  invalid email -> `Missing email` status Code 400
 *  invalid password -> `Missing password` status Code 400
 *  Email exists -> `Already exists` status Code 400
 * Valid users:
 *  Valid -> return new user with email and id status Code 201
 *  password -> must be hashed with SHA1
 *  users -> all users should be storeed in the users collection
 */
import { createHash } from 'crypto';
import dbClient from '../utils/db';
// import dbClient from '../test';

class UsersController {
  static async postNew(req, res) {
    if (!req.body.email) {
      return res.status(400).send({ error: 'Missing email' });
    }

    if (!req.body.password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    if (dbClient.isAlive()) {
      try {
        const hashpass = createHash('sha1');
        req.body.password = hashpass.update(req.body.password).digest('hex');
        const result = await dbClient.pnUser(req.body);
        res.status(201).send({ id: result._id, email: result.email });
      } catch (err) {
        res.status(400).send({ error: 'Already exist' });
      }
    }
    return res;
  }
}

module.exports = UsersController;
