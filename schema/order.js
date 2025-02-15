import { gql } from "apollo-server";
import pool from "../pool.js";
import createClient from "../mongoClient.js";
import { GraphQLError } from "graphql";
import dayjs from "dayjs";
// import { PubSub } from "@google-cloud/pubsub";
import { notifyMerchant } from "../handlers/newOrder.js";
import { sendLineMessageOnOrderCreate } from "../handlers/lineMessage.js";
import { customAlphabet } from "nanoid";
import { sendEmail } from "../handlers/email.js";

const client = createClient();

const typeDefs = gql`
  type Mutation {
    createOrder(input: OrderInput!): String!
  }

  input OptionInput {
    optionId: ID!
    optionName: String!
    optionDisplayName: String!
    optionDescription: String
    price: Int!
    status: Boolean!
  }

  input AttributeInput {
    attributeId: ID!
    attributeName: String!
    attributeDisplayName: String!
    attributeDescription: String
    status: Boolean!
    option: OptionInput!
  }

  input ProductInput {
    productId: ID!
    productName: String!
    productDisplayName: String!
    productDescription: String
    price: Int!
    status: Boolean!
    attributes: [AttributeInput!]!
  }

  input OrderItemInput {
    id: ID!
    product: ProductInput!
    amount: Int!
  }

  input CustomerInput {
    name: String!
    phone: String
    userId: String
  }

  input PriceItemInput {
    id: ID!
    name: String!
    price: Int!
  }

  input OrderInput {
    orderID: ID!
    merchantId: ID!
    content: [OrderItemInput!]!
    remark: String!
    tableware: Boolean!
    customer: CustomerInput!
    priceList: [PriceItemInput!]!
    amount: Int!
    totalPrice: Int!
    isLine: Boolean!
    pickUpDateTime: String!
  }

  type Query {
    getOrder(input: GetOrderInput!): [Order!]!
  }

  input GetOrderInput {
    merchantId: ID!
    status: [Status]
    orderID: ID
  }

  type Order {
    orderID: ID!
    merchantId: ID!
    content: [OrderItem!]!
    remark: String!
    tableware: Boolean!
    customer: Customer!
    priceList: [PriceItem!]!
    amount: Int!
    totalPrice: Int!
    isLine: Boolean!
    pickUpDateTime: String!
    status: Status!
    createTime: String!
    number: String
  }
  enum Status {
    PENDING
    CONFIRMED
    READY
    COMPLETED
  }

  type OrderItem {
    id: ID!
    product: ProductItem!
    amount: Int!
  }
  type AttributeItem {
    attributeId: ID!
    attributeName: String!
    attributeDisplayName: String!
    attributeDescription: String!
    status: Boolean!
    option: Option!
  }
  type ProductItem {
    productId: ID!
    productName: String!
    productDisplayName: String!
    productDescription: String!
    price: Float!
    status: Boolean!
    attributes: [AttributeItem!]!
  }

  type PriceItem {
    id: ID!
    name: String!
    price: Int!
  }

  type Customer {
    name: String!
    phone: String
    userId: String
  }

  type Mutation {
    updateStatus(input: updateStatusInput!): String!
  }
  input updateStatusInput {
    merchantId: ID!
    orderID: ID!
    status: Status!
  }
`;

const resolvers = {
  Query: {
    getOrder: async (root, { input }) => {
      try {
        const { merchantId, status, orderID } = input;
        const defaultStatus = ["PENDING", "CONFIRMED", "READY", "COMPLETED"];

        if (!merchantId) throw new Error("merchantId is required");
        const db = client.db("develop");
        const orders = db.collection("orders");
        const query = {
          merchantId: merchantId,
          status: { $in: status ? status : defaultStatus },
          orderID: orderID ? orderID : { $exists: true },
        };
        const options = {
          sort: { pickUpDateTime: 1 },
        };
        const orderList = await orders.find(query, options).toArray();

        return orderList;
      } catch (err) {
        console.log(err);
        throw new GraphQLError("查詢訂單失敗", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
    },
  },
  Mutation: {
    createOrder: async (root, { input }) => {
      try {
        const db = client.db("develop");
        const orders = db.collection("orders");
        const nanoid = customAlphabet('1234567890abcdefg', 4)
        const order = {
          ...input,
          status: "PENDING",
          createTime: dayjs().format(),
          number: nanoid()
        };
        await orders.insertOne(order);
        // async function publishNewOrder(order) {
        //   const data = JSON.stringify(order);
        //   const dataBuffer = Buffer.from(data);
        //   const topicName = "new-orders";
        //   const pubsub = new PubSub();
        //   pubsub.topic(topicName).publishMessage({data: dataBuffer, attributes: {merchantId: order.merchantId, orderID: order.orderID}});
        // }
        // await publishNewOrder(order);
        notifyMerchant(order);
        await sendLineMessageOnOrderCreate(order);
        sendEmail(order);

        return "Order created successfully";
      } catch (err) {
        switch (err.code) {
          case 11000:
            throw new GraphQLError("訂單已存在", {
              extensions: {
                code: "REPEAT_ORDER",
              },
            });
          default:
            console.log(err);
            throw new GraphQLError("創建訂單失敗", {
              extensions: {
                code: "BAD_USER_INPUT",
              },
            });
        }
      }
    },
    updateStatus: async (root, { input }) => {
      try {
        const db = client.db("develop");
        const orders = db.collection("orders");
        const { merchantId, orderID, status } = input;
        const filter = {
          merchantId,
          orderID,
        };
        const updateDoc = {
          $set: { status },
        };
        const options = {
          upsert: false,
        };
        const result = await orders.updateOne(filter, updateDoc, options);
        const updatedOrder = await orders.findOne(filter);
        console.log(updatedOrder);
        sendLineMessageOnOrderCreate(updatedOrder);
        return "orderStatus has been updated";
      } catch (err) {
        console.log(err);
        throw new GraphQLError("創建訂單失敗", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
    },
  },
};

export { typeDefs, resolvers };
