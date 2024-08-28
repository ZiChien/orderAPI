import client from '../mongoClient.js';
function createIndex() {
    try {
        const database = client.db('develop');
        database.collection('menu').createIndex({ merchantId: 1 }, { unique: true });
        return;
    } catch (err) {
        console.log(err);
    }
}
createIndex()