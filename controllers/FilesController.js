/*
 * First file downloading
 * PostUpload:
 *  - Check the token if is valid
 *  - Aquire the userId from the redis server
 *  - Validate key found if not throw an error
 *  - Aquire all the set data from the post field
 *  - Create the file if all validation passed
 *  - If folder create a new folder withouth the localpath
 *  - For files you will need to provide the localfolder
 */

import { ObjectId } from 'mongodb';
import { mkdir, writeFile } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
// import dbClient from '../test';

class FileController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) res.status(401).send({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) return res.status(401).send({ error: 'Unauthorized' });

      const {
        name, type, parentId = 0, isPublic = false, data,
      } = req.body;

      if (!name) return res.status(400).send({ error: 'Missing name' });

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).send({ error: 'Missing type' });
      }

      if (!data && type !== 'folder') return res.status(400).send({ error: 'Missing data' });

      if (parentId && parentId !== '0') {
        const parentObject = await dbClient.findFile({ _id: new ObjectId(parentId) });

        if (!parentObject) return res.status(400).send({ error: 'Parent not found' });
        if (parentObject.type !== 'folder') return res.status(400).send({ error: 'Parent is not a folder' });
      }

      // eslint-disable-next-line prefer-const
      let fileData = {
        userId,
        name,
        type,
        parentId,
        isPublic,
      };

      if (type === 'file' || type === 'image') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        mkdir(folderPath, { recursive: true }, (err) => {
          if (err) res.status(500).send({ error: `Internal server error: ${err}` });
        });

        const localPath = join(folderPath, uuidv4());
        writeFile(localPath, Buffer.from(data, 'base64'), (err) => {
          if (err) {
            res.status(500).send({ error: `Internal server error: ${err}` });
          }
        });

        fileData.localPath = localPath;
      }

      const fileId = await dbClient.createNewFile({ ...fileData });

      if (!fileId) return res.status(500).send({ error: 'Error creating new document' });

      return res.status(201).send({ id: fileId, ...fileData });
    } catch (err) {
      // console.log(err);
      return res.status(500).send({ error: 'Internal server error Failed to upload to database' });
    }
  }

  static async getIndex(req, res) {
    try {
      const token = req.headers['x-token'];
      const { parentId = 0, page = 0 } = req.query;

      if (!token) return res.status(401).send({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) return res.status(404).send({ error: 'Unauthorized' });

      const folderFiles = await dbClient.findFolders({ parentId, page });

      return res.status(200).send(folderFiles || []);
    } catch (err) {
      // console.log(err);
      return res.status(500).send({ error: 'Internal Server Error: Failed to fetch folder files' });
    }
  }

  static async getShow(req, res) {
    try {
      const token = req.headers['x-token'];
      const { id } = req.params;

      if (!token) return res.status(401).send({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) return res.status(401).send({ error: 'Unauthorized' });

      const result = await dbClient.findFile({ _id: new ObjectId(id), userId });

      if (!result) return res.status(404).send({ error: 'Not found' });

      return res.status(200).send(result);
    } catch (err) {
      // console.log('error: ', err);
      return res.status(500).send({ error: 'Internal Server Error: Failed to fetch file' });
    }
  }
}

module.exports = FileController;
