/**
 * Making a connection to the mongodb database
 * How to make a simple mongodb client
 * How to connect to the mongodb database
 * How to count documents in a given collections
 */

// dbConnection.js
import { MongoClient } from 'mongodb';

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
}

const dbClient = new DBClient();
export default dbClient;
