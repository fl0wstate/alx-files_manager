import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import redisClient from '../utils/redis';
// import dbClient from '../utils/db';
import dbClient from '../test';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    // const [email, password] = decodedCredentials.split(':');
    // for testing use this method
    const { email, password } = JSON.parse(decodedCredentials);
    // Allows me to use JSON to extract the string object into a javascript object

    if (!email || !password) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Logging the results

    if (!dbClient.isAlive()) {
      return res.status(500).send({ error: 'No Database Found' });
    }

    const hashpass = createHash('sha1').update(password).digest('hex');
    const user = await dbClient.nbFindUsers({ email, password: hashpass });

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const token = uuidv4();

    // Store the token generated for 24hrs only
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

    return res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    await redisClient.del(key);
    return res.status(204).send();
  }
}

module.exports = AuthController;
