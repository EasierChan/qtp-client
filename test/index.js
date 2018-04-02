const qtpmodule = require('../lib/qtp.service');

// const net = require("net");
// net.createServer((client)=> {
//   client.on("connect", ()=> {
//     console.info("new connect");
//   });

//   client.on("close", ()=> {
//     console.info("close client");
//   });

//   setTimeout(()=> {
//     client.end();
//   }, 5000);
// }).listen(8001);

let qtp = new qtpmodule.QtpService();
qtp.connect(8001, '139.159.224.13');
qtp.onConnect = (e) => {
  console.info(`onConnect`, e);
  
  qtp.send(101, JSON.stringify({ data: { user_id: 19999, password: "2cb6703cc7cb7d564008ddbfaad68eE2", ip: "123", mac: "123",
  app_md5: "89d59beea4dc61b057bdb094fa47969f", app_version: "1.0.3.5", app_name: "chronos-ui"  } }), 10);
};

qtp.onTopic(5002, (key, body)=> {
  console.info(body.toString());
}, this);

qtp.onClose = (addr) => {
  console.info("onClose", addr);
};
// qtp.dispose();
// qtp.connect(8001, '139.159.228.13');

qtp.onError = ()=> {
  console.info("onError");
  qtp.dispose();
  qtp.connect(8001, '139.159.224.13');
}

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
  }
});

qtp.addSlot({
  service: 0,
  msgtype: 100,
  callback: (msg)=> {
    console.info(msg.toString());
  }
})

  setTimeout(() => {
    qtp.dispose();
    i= 1000;
    
    setTimeout(()=> {
      qtp.connect(8001, '139.159.224.13');
    }, 1000)
  }, 5000);
qtp.addSlotOfCMS("getProduct", (arg) => {
  // setTimeout(() => {
  //   qtp.dispose();
  //   qtp.connect(8001, '127.0.0.1');
  // }, 5000);
}, this);

qtp.addSlot({
  service: 40,
  msgtype: 1010,
  callback: (msg) => {
    console.info(msg.toString());
  }
});