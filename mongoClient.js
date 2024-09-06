import { MongoClient } from 'mongodb';
import 'dotenv/config'


export default function createClient() {
    try{
        const uri = process.env.MONGO_URI_DEV;

        const client = new MongoClient(uri);
        return client
    } catch (err) {
        console.log(err)
    }
}