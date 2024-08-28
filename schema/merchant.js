import { gql } from 'apollo-server'
import pool from '../pool.js'

// The GraphQL schema
const typeDefs = gql`
    type Merchant {
        "店家ID"
            id: ID!
        "店家名稱"
            name: String!
        "店家顯示名稱"
            displayName: String! 
        "店家地址"
            address: String!
        "店家電話"
            phone: String!
    }
    type Query {
        "取得店家資料"
            merchant(name: String!): Merchant!
    }
    type Query {
        "取得所有店家資料"
            getAllMerchants: [Merchant!]!
    }
`;

// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        merchant: async (root, input) => {
            try {
                const name = input.name;
                const [rows] = await pool.execute('SELECT * FROM merchant WHERE name = ?', [name]);
                return rows[0];
            } catch (err) {
                console.log(err);
            }
        },
        getAllMerchants: async () => {
            try {
                const [rows] = await pool.execute('SELECT * FROM merchant');
                return rows;
            } catch (err) {
                console.log(err);
            }
        }
    },
};

export { typeDefs, resolvers };