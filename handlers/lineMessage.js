import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import "dayjs/locale/zh-tw.js"
import 'dotenv/config';
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('zh-tw')
const sendLineMessageOnOrderCreate = async (order) => {
  const LINE_ACCESS_TOKEN =
    "iS7aH5uxMprnxzDgqWB/HIfLxTMv3pr07tXT3eZKvSIwLfyMQES3FWf/pgKCj1pYraO2BqK2vqIPVD6I4EoDjD4p6r0Z2gQXwSjRs6fW6gsrmwnjkiVcKlM61hqmJUnfcnhN3gq0YtJ/pw48kj6KpwdB04t89/1O/w1cDnyilFU=";

const statusMap = new Map([
    ["PENDING", {text:"確認中",altText:"訂單已送出，待餐廳確認中"}],
    ["CONFIRMED", {text:"準備中", altText:"餐廳已接受您的訂單，等待餐點製作"}],
    ["READY", {text:"待取餐", altText:"您的餐點已準備完成，等待取餐"}],
    ["COMPLETED", {text:"已完成", altText:"您的訂單已完成"}],
]);

const altText = statusMap.get(order.status).altText;
const statusText = statusMap.get(order.status).text;

const pickUpTime = dayjs.utc(order.pickUpDateTime).tz("Asia/Taipei").format("YYYY年M月D日(dd) HH:mm");


const number = order.number;
const totalPrice = order.totalPrice;
const confirmUrl = `${process.env.ZCORDER_CUS_BASE_URL}/ThompsonDessert/confirm/${order.orderID}`;


  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: order.customer.userId,
      messages: [
        {
          type: "flex",
          altText: altText,
          contents: {
            type: "bubble",
            size: "kilo",
            hero: {
              type: "image",
              url: "https://order-customer-alpha.vercel.app/assets/item1-xDP9z16j.jpeg",
              size: "full",
              aspectRatio: "1.91:1",
              aspectMode: "cover",
              backgroundColor: "#FFFFFF",
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: altText,
                  weight: "bold",
                  size: "md",
                  wrap: true,
                },
                {
                  type: "text",
                  text: `訂單狀態: ${statusText}`,
                  size: "xs",
                  color: "#666666",
                  wrap: true,
                  offsetTop: "10px",
                },
                {
                  type: "text",
                  text: `取餐時間: ${pickUpTime}`,
                  size: "xs",
                  color: "#666666",
                  wrap: true,
                  offsetTop: "10px",
                },
                {
                  type: "text",
                  text: `取餐號碼: ${number}`,
                  size: "xs",
                  color: "#666666",
                  wrap: true,
                  offsetTop: "10px",
                },
                {
                  type: "text",
                  text: `訂單金額: ${totalPrice}`,
                  size: "xs",
                  color: "#666666",
                  wrap: true,
                  offsetTop: "10px",
                },
              ],
            },
            footer: {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "button",
                  action: {
                    type: "uri",
                    label: "查看訂單資訊",
                    uri: confirmUrl,
                  },
                  style: "primary",
                  color: "#83684e",
                },
              ],
            },
          },
        },
      ],
    }),
  })
    .then(async (response) => {
      if (response.status !== 200) {
        throw new Error(JSON.stringify(await response.json()));
      }
      return response.json();
    })
    .catch((error) => console.error("發送失敗:", error));
};
export { sendLineMessageOnOrderCreate };
