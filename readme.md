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
qtp.connect(22, '172.24.54.1');
qtp.onConnect = ()=> {
  console.info(`onConnect`);
};

qtp.onClose = ()=> {
  console.info("onClose");
};

qtp.sendToCMS("getProduct", JSON.stringify({}));

qtp.addSlotOfCMS("getProduct", (body)=> {
  console.info(body.toString());
}, this);
```

## ChangLog

- version 1.0.5
  add CMS-special interface;


- version 1.0.4

  fix subscribe issue;