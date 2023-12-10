import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.db = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}/${this.db}`;
    this.isConnected = true;

    this.client = new MongoClient(this.url, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return (this.client.topology.isConnected());
  }

  async nbUsers() {
    const usersCount = this.client.db().collection('users').countDocuments();
    return (usersCount);
  }

  async nbFiles() {
    const filesCount = this.client.db().collection('files').countDocuments();

    return (filesCount);
  }

  async findFile(data) {
    const files = this.client.db().collection('files').find(data).toArray();

    return (files);
  }

  async addFile(data) {
    this.client.db().collection('files').insertOne(data);
  }

  async addUser(data) {
    this.client.db().collection('users').insertOne(data);
  }

  async findUser(data) {
    const user = this.client.db().collection('users').find(data).toArray();

    return user;
  }
}

export const dbClient = new DBClient();
export default dbClient;
