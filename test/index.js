// import { QtpMessageOption } from "../lib/model/message.model";

const { QtpService, QtpMessageOption } = require('../index');
const { readFileSync } = require('fs');

// // const net = require("net");
// // net.createServer((client)=> {
// //   client.on("connect", ()=> {
// //     console.info("new connect");
// //   });

// //   client.on("close", ()=> {
// //     console.info("close client");
// //   });

// //   setTimeout(()=> {
// //     client.end();
// //   }, 5000);
// // }).listen(8001);

let qtp = new QtpService();
qtp.onConnect = (e) => {
  console.info(`onConnect`, e);
  let options = [];
  let userOpt = new QtpMessageOption();
  userOpt.id = 111;
  userOpt.value = Buffer.from("1213");
  options.push(userOpt);
  // qtp.sendWithOption(101, options, "", 0);
  qtp.send(101, JSON.stringify({
    data: {
      "user_id": 9999, "password": "c356042e4df23f932957ed9b9fa904E0", "dsn": "*", "cpuid": "*", "mac": "507b9dcd5b44", "ip": "172.16.1.36", "app_name": "cms", "app_version": "1.0.9.28", "app_md5": "3732d4516b1328d4fb5141be8fb97473"
    }
  }), 10);
};

// qtp.onTopic(5002, (key, body)=> {
//   console.info(body.toString());
// }, this);

// qtp.onClose = (addr) => {
//   console.info("onClose", addr);
// };
// // qtp.dispose();
// // qtp.connect(8001, '139.159.228.13');

// qtp.onError = ()=> {
//   console.info("onError");
// }

qtp.addSlot({
  service: 10,
  msgtype: 102,
  callback: (msg) => {
    console.info("logined", msg.toString())
    // qtp.sendToCMS("getProduct", JSON.stringify({ data: { head: {}, body: { } } }));
    // setTimeout(()=> {
    //   qtp.dispose();
    // }, 5000);
    // qtp.send(1010, JSON.stringify({"data":{"body":{"acid":1000002},"head":{"reqsn":32,"userid":19999},"serviceid":40,"msgtype":1010}}), 40, 1);
    // qtp.subscribe(5002, [1114113], false, 50);
    console.info(qtp.sendToCMS("saveTradeAccountPosition", JSON.stringify({ data: { body: { acid: 11111, excelDat: readFileSync("D:\\zDoc\\11111.csv", "utf8") } } })));
    console.info(qtp.sendToCMS("saveTradeAccountPosition", JSON.stringify({ data: { body: { acid: 11111, excelDat: readFileSync("D:\\zDoc\\11111.csv", "utf8") } } })));
    console.info(qtp.sendToCMS("saveTradeAccountPosition", JSON.stringify({ data: { body: { acid: 11111, excelDat: readFileSync("D:\\zDoc\\11111.csv", "utf8") } } })));
    console.info(qtp.sendToCMS("saveTradeAccountPosition", JSON.stringify({ data: { body: { acid: 11111, excelDat: readFileSync("D:\\zDoc\\11111.csv", "utf8") } } })));
    console.info(qtp.sendToCMS("saveTradeAccountPosition", JSON.stringify({ data: { body: { acid: 11111, excelDat: readFileSync("D:\\zDoc\\11111.csv", "utf8") } } })));

    setTimeout(()=> {
      console.info(qtp.sendToCMS("saveTradeAccountPosition", JSON.stringify({ data: { body: { acid: 11111, excelDat: readFileSync("D:\\zDoc\\11111.csv", "utf8") } } })));
    }, 1000);
  }
});

qtp.addSlotOfCMS("saveTradeAccountPosition", (msg) => {
  console.info(msg.toString());
}, this);
qtp.connect(8001, '139.159.224.13');
// qtp.addSlot({
//   service: 0,
//   msgtype: 100,
//   callback: (msg)=> {
//     console.info(msg.toString());
//   }
// })

//   setTimeout(() => {
//     qtp.dispose();

//     setTimeout(()=> {
//       qtp.connect(8001, '172.24.13.10', false);
//     }, 1000)
//   }, 5000);
// qtp.addSlotOfCMS("getProduct", (arg) => {
//   // setTimeout(() => {
//   //   qtp.dispose();
//   //   qtp.connect(8001, '127.0.0.1');
//   // }, 5000);
// }, this);

// qtp.addSlot({
//   service: 40,
//   msgtype: 1010,
//   callback: (msg) => {
//     console.info(msg.toString());
//   }
// });