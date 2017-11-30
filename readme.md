# Description

- 接口列表

```
connect(port, host)

onConnect

onClose

send(msgtype, body, service=0)

sendWithOption(msgtype, options, body, service)

subscribe(topic, keys)

addSlot(..slots)

```

## 附录

- Slot 结构

```
 {
   service : number
   msgtype : number
   callback: Function
   context : optional
 }
```

- Option结构
```
  {
    id: number;
    value: Buffer;
  }
```

## Example
```
const qtpmodule = require('qtp-client');

let qtp = new qtpmodule.QtpService();
qtp.connect(6001, '172.24.13.23');
qtp.onConnect = () => {
  console.info(`onConnect`);
  qtp.send(101, JSON.stringify({ data: { user_id: 100101, password: "1223" } }), 10);
};

qtp.onClose = () => {
  console.info("onClose");
};

qtp.addSlot({
  service: 10,
  msgtype: 102,
  callback: (msg)=> {
    qtp.sendToCMS("getProduct", JSON.stringify({ data: { body: { user_id: 100101 } } }));
  }
});

qtp.addSlotOfCMS("getProduct", (arg) => {
  console.info("hello");
}, this);
```

## ChangLog
- version 1.0.6
  update

- version 1.0.5
  add CMS-special interface;


- version 1.0.4

  fix subscribe issue;