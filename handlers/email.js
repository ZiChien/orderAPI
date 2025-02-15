import nodemailer from "nodemailer";
import 'dotenv/config';
import dayjs from "dayjs";

function sendEmail(order) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "zcorder.system@gmail.com",
      pass: process.env.GMAIL_PASSWORD,
    },
  });
const mailOptions = {
    from: 'zcorder.system@gmail.com',   // 發件人
    to: 'tanyeee226@gmail.com',     // 收件人
    subject: '你有新訂單！',
    text: '這是一封來自 Node.js 的測試郵件！',
    html: `
        <h2>你有新訂單！</h2>
        <p>訂單編號: ${order.orderID}</p>
        <p>訂單號碼: ${order.number}</p>
        <p>顧客姓名: ${order.customer.name}</p>
        <p>總價: ${order.totalPrice}</p>
        <p>下單時間: ${dayjs(order.createTime).format('YYYY-MM-DD (ddd) HH:mm:ss')}</p>
        <p>取餐時間: ${dayjs(order.pickUpDateTime).format('YYYY-MM-DD (ddd) HH:mm:ss')}</p>
        <h3>訂單內容:</h3>
        <ul>
            ${order.content.map(item => `
                <li>
                    ${item.amount}X ${item.product.productDisplayName} - ${item.product.price}元
                    <ul>
                        ${item.product.attributes.map(attr => `
                            <li>${attr.attributeDisplayName}: ${attr.option.optionDisplayName}</li>
                        `).join('')}
                    </ul>
                </li>
            `).join('')}
        </ul>
        <p>備註: ${order.remark ? order.remark : '無'}</p>
    `,
};

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("郵件發送失敗:", error);
    }
    console.log("郵件發送成功:", info.response);
  });
}
export { sendEmail };