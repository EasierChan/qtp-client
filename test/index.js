const qtpmodule = require('../lib/qtp.service');

let qtp = new qtpmodule.QtpService();
qtp.connect(8001, '139.159.224.13');
qtp.onConnect = (e) => {
  console.info(`onConnect`, e);
  qtp.send(101, JSON.stringify({ data: { user_id: 19999, password: "2cb6703cc7cb7d564008ddbfaad68eE2" } }), 10);
};

qtp.onTopic(5002, (key, body)=> {
  console.info(body.toString());
}, this);

qtp.onClose = () => {
  console.info("onClose");
};

qtp.addSlot({
  service: 10,
  msgtype: 102,
  callback: (msg) => {
    console.info("logined", msg.toString())
    // qtp.sendToCMS("getProduct", JSON.stringify({ data: { body: { userid: 100101 } } }));
    qtp.send(1010, JSON.stringify({"data":{"body":{"acid":1000002},"head":{"reqsn":32,"userid":19999},"serviceid":40,"msgtype":1010}}), 40, 1);
    // qtp.subscribe(5002, [1114113], false, 50);
  }
});

qtp.addSlot({
  service: 0,
  msgtype: 100,
  callback: (msg)=> {
    console.info(msg.toString());
  }
})

qtp.addSlotOfCMS("getProduct", (arg) => {
  // setTimeout(() => {
  //   qtp.dispose();
  //   qtp.connect(6001, '172.24.13.23');
  // }, 10000);
}, this);

qtp.addSlot({
  service: 40,
  msgtype: 1010,
  callback: (msg) => {
    console.info(msg.toString());
  }
});