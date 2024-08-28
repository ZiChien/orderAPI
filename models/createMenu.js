import client from '../mongoClient.js';
import pool from '../pool.js';
const newMenu = [
    {
        categoryId: '1',
        category: 'summer',
        categoryDisplayName: '夏季商品',
        categoryDescription: '夏季限定...',
        products: [
            {
                productId: '1',
                productName: 'beamFlowerIce',
                productDisplayName: '(冰)手工豆花',
                productDescription: '手工豆花搭配黑糖冰沙',
                price: 50,
                image: 'https://www.google.com',
                status: true,
                attributes: [
                    {
                        attrId: '1',
                        attrName: 'firstMtl',
                        attrDisplayName: '第一種配料',
                        attrDescription: '%%##@@配料',
                        status: true,
                        options: [
                            {
                                optionId: '1',
                                optionName: 'redBean',
                                optionDisplayName: '紅豆',
                                optionDescription: '使用萬丹紅豆',
                                price: 0,
                                status: true,
                            },
                            {
                                optionId: '2',
                                optionName: 'greenBean',
                                optionDisplayName: '綠豆',
                                optionDescription: '產地:台南',
                                price: 0,
                                status: true,
                            },
                            {
                                optionId: '3',
                                optionName: 'bubble',
                                optionDisplayName: '珍珠',
                                optionDescription: '產地:wwww',
                                price: 0,
                                status: true,
                            },

                        ]

                    }
                ]
            },
        ],
    },
]
const createMenu = async (menu) => {
    try {
        const database = client.db('develop');
        const menu = database.collection('menu');
        const result = await menu.insertOne(newMenu);
        console.log(result);

    }
    catch (err) {
        console.log(err);
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
// createMenu()
async function createMenuToMySQL() {
    try {

        for (const category of newMenu) {
            const [categoryResult] = await pool.execute(
                'INSERT INTO categories (categoryId, category, categoryDisplayName, categoryDescription) VALUES (?, ?, ?, ?)',
                [category.categoryId, category.category, category.categoryDisplayName, category.categoryDescription]
            );

            // 插入 Product 資料
            for (const product of category.products) {
                const [productResult] = await pool.execute(
                    'INSERT INTO products (productId, categoryId, productName, productDisplayName, productDescription, price, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [product.productId, category.categoryId, product.productName, product.productDisplayName, product.productDescription, product.price, product.image, product.status]
                );

                // 插入 Attribute 資料
                for (const attribute of product.attributes) {
                    const [attrResult] = await pool.execute(
                        'INSERT INTO attributes (attrId, productId, attrName, attrDisplayName, attrDescription, status) VALUES (?, ?, ?, ?, ?, ?)',
                        [attribute.attrId, product.productId, attribute.attrName, attribute.attrDisplayName, attribute.attrDescription, attribute.status]
                    );

                    // 插入 Option 資料
                    for (const option of attribute.options) {
                        await pool.execute(
                            'INSERT INTO options (optionId, attrId, optionName, optionDisplayName, optionDescription, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [option.optionId, attribute.attrId, option.optionName, option.optionDisplayName, option.optionDescription, option.price, option.status]
                        );
                    }
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
    return pool.end()
}
createMenuToMySQL()