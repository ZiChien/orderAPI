import createClient from '../mongoClient.js';
const client = createClient()
async function createIndex() {
    try {
        const database = client.db('develop');
        const collection = database.collection('orders');
        
        // 在 'orders' 集合中创建 orderId 索引
        // await collection.createIndex({ orderId: 1 });


        // 在 'orders' 集合中创建唯一的 orderId 索引
        await collection.createIndex({ orderID: 1 }, { unique: true });
        
        console.log('成功在 orders 集合中创建 orderId 索引');
        return;
    } catch (err) {
        console.log(err);
    }
}
createIndex()