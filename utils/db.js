import { MongoClient } from 'mongodb';

/*
 * Making a connection to the mongodb database
 * How to make a simple mongodb client
 * How to connect to the mongodb database
 * How to count documents in a given collections
 */

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    this.database = database;
    this.url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(this.url, { useUnifiedTopology: true });
    this.isConnected = false;

    this.connect()
      .catch((err) => console.error('Initial connection error:', err));
  }

  connect() {
    return this.client.connect()
      .then(() => {
        this.isConnected = true;
      })
      .catch((err) => {
        this.isConnected = false;
        console.error('Connection error:', err);
        return Promise.reject(err);
      });
  }

  isAlive() {
    return this.isConnected;
  }

  nbUsers() {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }
    return this.client.db(this.database).collection('users').countDocuments({}, { hint: '_id_' })
      .then((userCount) => userCount)
      .catch((err) => {
        console.error('Error counting users:', err);
        return Promise.reject(new Error('Error counting users'));
      });
  }

  numberOfMovies() {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }
    return this.client.db(this.database).collection('movies').countDocuments({}, { hint: '_id_' })
      .then((fileCount) => fileCount)
      .catch((err) => {
        console.error('Error counting files:', err);
        return Promise.reject(new Error('Error counting files'));
      });
  }

  nbFiles() {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }
    return this.client.db(this.database).collection('files').countDocuments({}, { hint: '_id_' })
      .then((fileCount) => fileCount)
      .catch((err) => {
        console.error('Error counting files:', err);
        return Promise.reject(new Error('Error counting files'));
      });
  }

  postNewUser(userDetails) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }
    return this.client.db(this.database).collection('users').insertOne(userDetails)
      .then((res) => res.insertedId)
      .catch((err) => Promise.reject(new Error('Error adding new user:', err)));
  }

  findUser(userDetails) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }
    return this.client.db(this.database).collection('users').findOne(userDetails)
      .then((res) => res)
      .catch((err) => Promise.reject(new Error('No user found:', err)));
  }

  findFile(fileDetails) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }
    return this.client.db(this.database).collection('files').findOne(fileDetails)
      .then((res) => res)
      .catch((err) => Promise.reject(new Error('No user found:', err)));
  }

  createNewFile(fileDetails) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }
    return this.client.db(this.database).collection('files').insertOne(fileDetails)
      .then((res) => res.insertedId)
      .catch((err) => Promise.reject(new Error('Creating new file failed: ', err)));
  }

  countMatchingFiles(doc) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }
    return this.client.db(this.database).collection('files').countDocuments({ parentId: doc })
      .then((res) => res)
      .catch((err) => Promise.reject(new Error('No document found matching parentId: ', err)));
  }

  publishFile(doc) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }

    return this.client.db(this.database).collection('files')
      .updateOne({ _id: doc._id }, { $set: { isPublic: true } })
      .then((res) => res)
      .catch((err) => Promise.reject(new Error(`Error updating the document. Error: ${err.message}`)));
  }

  unPublishFile(doc) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to the database'));
    }

    return this.client.db(this.database).collection('files')
      .updateOne({ _id: doc._id }, { $set: { isPublic: false } })
      .then((res) => res)
      .catch((err) => Promise.reject(new Error(`Error updating the document. Error: ${err.message}`)));
  }

  async findFolders(folderDetails) {
    if (!this.isConnected) {
      return new Error('Not connected to the database');
    }

    try {
      const limit = 20;
      const { parentId, page } = folderDetails;
      const totalDocuments = await this.countMatchingFiles(parentId);
      const totalPages = Math.ceil(totalDocuments / limit);

      if (page < 0 || page >= totalPages) return [];

      const skip = page * limit;

      const pipeline = [
        { $match: { parentId: `${parentId}` } },
        { $skip: skip },
        { $limit: limit },
      ];

      const result = await this.client.db(this.database).collection('files').aggregate(pipeline).toArray();
      return result;
    } catch (err) {
      return new Error('Not connected to the database', err);
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
