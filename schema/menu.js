import { gql } from "apollo-server";
import pool from "../pool.js";
import client from "../mongoClient.js";

// The GraphQL schema
const typeDefs = gql`
  # 定義產品選項型態
  type Option {
    optionId: ID!
    optionName: String!
    optionDisplayName: String!
    optionDescription: String!
    price: Float!
    status: Boolean!
  }

  # 定義產品屬性型態
  type Attribute {
    attributeId: ID!
    attributeName: String!
    attributeDisplayName: String!
    attributeDescription: String!
    status: Boolean!
    options: [Option!]!
  }

  # 定義產品型態
  type Product {
    productId: ID!
    productName: String!
    productDisplayName: String!
    productDescription: String!
    price: Float!
    status: Boolean!
    attributes: [Attribute!]!
  }

  # 定義分類型態
  type Category {
    categoryId: ID!
    categoryName: String!
    categoryDisplayName: String!
    categoryDescription: String!
    products: [Product!]!
  }

  # 定義菜單型態
  type Menu {
    menuId: ID!
    menuName: String!
    menuDescription: String!
    categories: [Category!]!
  }
  # 定義查詢
  type Query {
    getMenu(merchantId: ID!): [Menu]!
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    getMenu: async (root, input) => {
      try {
        // const merchantId = input.merchantId;

        // const database = client.db("develop");
        // const menu = database.collection("menu");
        // const filter = { merchantId };
        // const res = await menu.findOne(filter);
        // console.log(res.menu[0].products[0].attributes);

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
              LEFT JOIN 
                product_attributes ON product.productId = product_attributes.productId
              LEFT JOIN 
                attributes ON product_attributes.attributeId = attributes.attributeId
              LEFT JOIN 
                attribute_options ON attributes.attributeId = attribute_options.attributeId
              LEFT JOIN 
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
          if(!attributeId) return;
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
        console.log(err);
      }
    },
  },
};

export { typeDefs, resolvers };
