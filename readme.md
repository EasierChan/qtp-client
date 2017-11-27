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