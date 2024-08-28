import { gql } from 'apollo-server'
import { GraphQLError } from 'graphql';
import pool from '../pool.js'
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw.js';
import 'dayjs/locale/en.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(localizedFormat);
dayjs.extend(utc)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
// The GraphQL schema
const typeDefs = gql`
    type Query {
        "取得店家可預約時間"
            getAvailableTime(merchantId: ID!): [String]!
    }
    type Query {
        "取得店家可預約日期"
            getAvailableDate(merchantId: ID!): [String]!
    }
`;

// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        getAvailableTime: async (root, input) => {
            try {
                const merchantId = input.merchantId;
                const [rows] = await pool.execute('SELECT openTime,closeTime,timezone FROM openingHours WHERE merchantId = ?', [merchantId]);
                if (!rows.length) {
                    throw new GraphQLError('Invalid argument value', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                        },
                    });
                }
                const { openTime, closeTime, timezone } = rows[0];

                const availableTime = [];
                const OFFSET = 5;
                const now = dayjs().tz(timezone)
                let start = dayjs.tz(openTime, "HH:mm:ss", timezone)
                const end = dayjs.tz(closeTime, "HH:mm:ss", timezone)
                while (start.isBefore(end)) {
                    if (start.isAfter(now)) availableTime.push(start.format())
                    start = start.add(OFFSET, 'minute')
                }

                return availableTime
            } catch (err) {
                return err
            }
        },
        getAvailableDate: async (root, input) => {
            try {
                const merchantId = input.merchantId;
                const [rows] = await pool.execute('SELECT * FROM openingHours WHERE merchantId = ?', [merchantId]);
                if (!rows.length) {
                    throw new GraphQLError('Invalid argument value', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                        },
                    });
                }
                const { closeTime, dayOff, dayLimit, timezone } = rows[0];

                const end = dayjs.tz(closeTime, "HH:mm:ss", timezone)
                const now = dayjs().tz(timezone)
                if (now.isAfter(end)) now = now.add(1, 'day')
                const dayOff_parsed = dayOff.split(',').map(day => parseInt(day))

                const availableDate = [];
                for (let i = 0; i < dayLimit; i++) {
                    const date = now.add(i, 'day')
                    if (dayOff_parsed.includes(date.day())) continue
                    availableDate.push(date.format())
                }
                return availableDate

            } catch (err) {
                return err
            }
        }
    },
};

export { typeDefs, resolvers };