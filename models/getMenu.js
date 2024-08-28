import pool from "../pool.js"

export default async function getMenu() {
    try {
        const query = `
  SELECT 
    menu.menuId, menu.menuName, menu.menuDescription,
    category.categoryId, category.categoryName, category.categoryDisplayName, category.categoryDescription,
    product.productId, product.productName, product.productDisplayName, product.productDescription, product.price, product.status as productStatus,
    attributes.attributeId, attributes.attributeName, attributes.attributeDisplayName, attributes.attributeDescription, attributes.status as attributeStatus,
    options.optionId, options.optionName, options.optionDisplayName, options.optionDescription, options.price AS optionPrice, options.status as optionStatus
  FROM 
    merchant
  JOIN 
    merchant_menu ON merchant.id = merchant_menu.merchantId
  JOIN 
    menu ON merchant_menu.menuId = menu.menuId
  JOIN 
    menu_category ON menu.menuId = menu_category.menuId
  JOIN 
    category ON menu_category.categoryId = category.categoryId
  JOIN 
    category_product ON category.categoryId = category_product.categoryId
  JOIN 
    product ON category_product.productId = product.productId
  JOIN 
    product_attributes ON product.productId = product_attributes.productId
  JOIN 
    attributes ON product_attributes.attributeId = attributes.attributeId
  JOIN 
    attribute_options ON attributes.attributeId = attribute_options.attributeId
  JOIN 
    options ON attribute_options.optionId = options.optionId
  WHERE 
    merchant.id = ?;
`;

        const [rows] = await pool.execute(query, [1])
        console.log(rows);
        // 整理數據
        const menuMap = new Map();

        rows.forEach(row => {
            const {
                menuId, menuName, menuDescription,
                categoryId, categoryName, categoryDisplayName, categoryDescription,
                productId, productName, productDisplayName, productDescription, price, productStatus,
                attributeId, attributeName, attributeDisplayName, attributeDescription, attributeStatus,
                optionId, optionName, optionDisplayName, optionDescription, optionPrice, optionStatus
            } = row;

            if (!menuMap.has(menuId)) {
                menuMap.set(menuId, {
                    menuId: menuId,
                    menuName: menuName,
                    menuDescription: menuDescription,
                    categories: []
                });
            }

            const menu = menuMap.get(menuId);

            let category = menu.categories.find(c => c.categoryId === categoryId);
            if (!category) {
                category = {
                    categoryId: categoryId,
                    categoryName: categoryName,
                    categoryDisplayName: categoryDisplayName,
                    categoryDescription: categoryDescription,
                    products: []
                };
                menu.categories.push(category);
            }

            let product = category.products.find(p => p.productId === productId);
            if (!product) {
                product = {
                    productId: productId,
                    productName: productName,
                    productDisplayName: productDisplayName,
                    productDescription: productDescription,
                    price: price,
                    status: productStatus,
                    attributes: []
                };
                category.products.push(product);
            }

            let attribute = product.attributes.find(a => a.attributeId === attributeId);
            if (!attribute) {
                attribute = {
                    attributeId: attributeId,
                    attributeName: attributeName,
                    attributeDisplayName: attributeDisplayName,
                    attributeDescription: attributeDescription,
                    status: attributeStatus,
                    options: [],
                };
                product.attributes.push(attribute);
            }

            const option = {
                optionId: optionId,
                optionName: optionName,
                optionDisplayName: optionDisplayName,
                optionDescription: optionDescription,
                price: optionPrice,
                status: optionStatus
            };

            attribute.options.push(option);
        });

        const formattedMenus = Array.from(menuMap.values());
        console.log(JSON.stringify(formattedMenus, null, 1));

        // //取得這個餐廳的所有menu
        // const [menu_rows] = await pool.execute(
        //     `
        //         SELECT * FROM merchant_menu
        //         JOIN menu ON merchant_menu.menuId = menu.menuId
        //         WHERE merchantId = 1
        //     `
        // )

        // // 取得每個menu中的所有category
        // for (const menu_row of menu_rows) {
        //     const [category_rows] = await pool.execute(
        //         `
        //             SELECT * FROM menu_category
        //             JOIN category ON menu_category.categoryId = category.categoryId
        //             WHERE menu_category.menuId = ?
        //         `,
        //         [menu_row.menuId]
        //     )
        //     menu_row.category = category_rows[0]
        //     // 取得每個category中的所有product
        //     for (const category_row of category_rows) {
        //         // console.log(category_row);

        //     }

        // }

        // return menu_rows
        return formattedMenus
    } catch (err) {
        console.log(err)
    }
    pool.end()
}
// console.log(await getMenu());


// SELECT * FROM merchant_menu //merchant_menu中記錄餐廳的menuId
// JOIN menu ON merchant_menu.menuId = menu.menuId //去menu表中找到所有 在merchant_menu與menu有著相同menuId的資料 並將其結合
// WHERE merchantId = 1 最後選擇merchantId = 1的資料