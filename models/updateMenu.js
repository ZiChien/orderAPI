import client from '../mongoClient.js';
async function updateMenu() {
    try {
        const database = client.db('develop');
        const menu = database.collection('menu')
        const filter = { merchantId: '1' };
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
        const updateDoc = {
            $set: { menu: newMenu },
        }
        const result = await menu.updateOne(filter, updateDoc);
        console.log(result);

        return;
    } catch (err) {
        console.log(err);
    }
}
// updateMenu()
