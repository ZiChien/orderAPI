import { MongoClient } from 'mongodb';
import 'dotenv/config'

const uri = process.env.MONGO_URI_DEV;

const client = new MongoClient(uri);

export default client;