import { gql } from 'apollo-server'
import pool from '../pool.js'
import createClient from '../mongoClient.js'
import { GraphQLError } from 'graphql';

const client = createClient()


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
  note: String!
  customer: CustomerInput!
  priceList: [PriceItemInput!]!
  amount: Int!
  isLine: Boolean!
  pickUpDateTime: String!
}
`

const resolvers = {
    Mutation: {
        createOrder: async (root, { input }) => {
            console.log(input);
            try {
                const db = client.db('develop')
                const orders = db.collection('orders')
                const order = await orders.insertOne(input)
                return "Order created successfully";
            } catch (err) {
                switch (err.code) {
                    case 11000:
                        throw new GraphQLError('訂單已存在', {
                            extensions: {
                                code: 'REPEAT_ORDER',
                            },
                        });
                    default:
                        throw new GraphQLError('創建訂單失敗', {
                            extensions: {
                                code: 'BAD_USER_INPUT',
                            },
                        });
                }
            }
        }
    }
}

export { typeDefs, resolvers };
