import { PubSub } from "@google-cloud/pubsub";
import { getIo, merchant_socket } from "../socket.js";

// const pubsub = new PubSub();
// async function listenForNewOrders() {
//   const subscriptionName = "zcorder-api-subscription";
//   const subscription = pubsub.subscription(subscriptionName, {
//     // flowControl: {
//     //   maxExtension: 20,
//     // },
//     // ackDeadline: 5,
//   });
//   function messageHandler(message) {
//     console.log(`Received message: ${message.id}`);
//     console.log(`Data: ${message.data}`);
//     console.log(`Attributes: ${message.attributes}`);
//     const io = getIo();
//     const data = JSON.parse(message.data);
//     const attr = message.attributes;
//     console.log(message.id);
//   }
//   subscription.on("message", messageHandler);
//   subscription.on("error", (error) => {
//     console.error(`ERROR: ${error}`);
//   });
// }
function notifyMerchant(order) {
  const io = getIo();
  const { merchantId } = order;
  if (merchant_socket[merchantId]) {
    io.to(merchant_socket[merchantId]).emit("newOrder", order);
  }
}

export { notifyMerchant };
