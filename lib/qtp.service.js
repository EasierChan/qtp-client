/**
 * chenlei 2017/04/27
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tcpclient_1 = require("./base/tcpclient");
var parser_1 = require("./base/parser");
var message_model_1 = require("./model/message.model");
var logger = console;
var QTPParser = (function (_super) {
    __extends(QTPParser, _super);
    function QTPParser(_oPool) {
        var _this = _super.call(this, _oPool) || this;
        _this._curHeader = null;
        return _this;
    }
    QTPParser.prototype.processRead = function () {
        while (this.processMsgHeader() && this.processMsg()) {
            this._curHeader = null;
            if (!this._oPool || this._oPool.length === 0)
                break;
            logger.info("pool length: " + this._oPool.length);
        }
    };
    /**
     * process message head.
     */
    QTPParser.prototype.processMsgHeader = function () {
        if (!this._oPool || this._oPool.length === 0)
            return false;
        if (this._curHeader !== null) {
            logger.warn("curHeader: " + JSON.stringify(this._curHeader) + ", poolLen=" + this._oPool.length);
            return true;
        }
        var ret = false;
        var bufCount = 0;
        var buflen = 0;
        var restLen = 0;
        var peekBuf = null;
        for (; bufCount < this._oPool.length; ++bufCount) {
            peekBuf = this._oPool.peek(bufCount + 1);
            buflen += peekBuf[bufCount].byteLength;
            if (buflen >= message_model_1.Header.len) {
                this._curHeader = new message_model_1.Header();
                this._curHeader.fromBuffer(bufCount >= 1 ? Buffer.concat(peekBuf, buflen) : peekBuf[0], 0);
                ret = true;
                break;
            }
        }
        restLen = null;
        buflen = null;
        bufCount = null;
        return ret;
    };
    /**
     * process msg body
     */
    QTPParser.prototype.processMsg = function () {
        var ret = false;
        var bufCount = 0;
        var buflen = 0;
        var restLen = 0;
        var peekBuf = null;
        for (; bufCount < this._oPool.length; ++bufCount) {
            peekBuf = this._oPool.peek(bufCount + 1);
            buflen += peekBuf[bufCount].byteLength;
            if (buflen >= this._curHeader.datalen + message_model_1.Header.len) {
                var tempBuffer = Buffer.concat(this._oPool.remove(bufCount + 1), buflen);
                console.info("processMsg: service=" + this._curHeader.service + ", msgtype=" + this._curHeader.msgtype + ", msglen=" + this._curHeader.datalen);

                try {
                    this.emit(this._curHeader.service.toString(), this._curHeader, tempBuffer);
                }
                catch (err) {
                    console.error(err);
                }
                finally {
                    restLen = buflen - message_model_1.Header.len - this._curHeader.datalen - this._curHeader.optslen;
                    if (restLen > 0) {
                        var restBuf = Buffer.alloc(restLen);
                        tempBuffer.copy(restBuf, 0, buflen - restLen);
                        this._oPool.prepend(restBuf);
                        restBuf = null;
                        logger.warn("restLen=" + restLen + ", tempBuffer=" + tempBuffer.length);
                    }
                    this._curHeader = null;
                    tempBuffer = null;
                    ret = true;
                    break;
                }
            }
        }
        restLen = null;
        buflen = null;
        bufCount = null;
        return ret;
    };
    return QTPParser;
}(parser_1.Parser));
var QTPMessageParser = (function (_super) {
    __extends(QTPMessageParser, _super);
    function QTPMessageParser(_client) {
        var _this = _super.call(this, _client.bufferQueue) || this;
        _this._client = _client;
        // _this.init();
        return _this;
    }
    QTPMessageParser.prototype.init = function () {
        var _this = this;
        this._intervalRead = setInterval(function () {
            _this.processRead();
        }, 500);
    };
    QTPMessageParser.prototype.processQtpMsg = function (args) {
        var header = args[0], all = args[1];
        var msg = new message_model_1.QTPMessage();
        msg.header = header;
        msg.fromBuffer(all, message_model_1.Header.len);
        this._client.emit("data", msg);
    };
    QTPMessageParser.prototype.dispose = function () {
        if (this._intervalRead || this._intervalRead !== null) {
            clearInterval(this._intervalRead);
        }
        _super.prototype.dispose.call(this);
    };
    return QTPMessageParser;
}(QTPParser));
var QTPClient = (function (_super) {
    __extends(QTPClient, _super);
    function QTPClient() {
        var _this = _super.call(this) || this;
        _this._parsers = [];
        return _this;
    }
    QTPClient.prototype.addParser = function (parser) {
        this._parsers.push(parser);
    };
    QTPClient.prototype.sendMessage = function (msg) {
        this.send(msg.toBuffer());
    };
    QTPClient.prototype.sendHeartBeat = function (appid, interval) {
        var _this = this;
        if (interval === void 0) { interval = 10; }
        var header = new message_model_1.Header();
        header.msgtype = 255;
        header.optslen = 0;
        header.datalen = 0;
        this._intervalHeart = setInterval(function () {
            _this.send(header.toBuffer());
        }, interval * 1000);
    };
    QTPClient.prototype.dispose = function () {
        if (this._intervalHeart !== null) {
            clearInterval(this._intervalHeart);
            this._intervalHeart = null;
        }
        this._parsers.forEach(function (parser) {
            parser.dispose();
        });
        _super.prototype.dispose.call(this);
    };
    return QTPClient;
}(tcpclient_1.TcpClient));
var QtpService = (function () {
    function QtpService() {
        var _this = this;
        this._messageMap = {};
        this._topicMap = {};
        this._cmsMap = {};
        this._client = new QTPClient();
        this._client.useSelfBuffer = true;
        this._parser = new QTPMessageParser(this._client);
        this._client.addParser(this._parser);
        var self = this;
        this._client.on("buffer", function () { self._parser.processRead(); });
        this._client.on("data", function (msgarr) {
            var msg = msgarr[0];
            if (msg.header.service === message_model_1.ServiceType.kFGS && msg.header.msgtype === message_model_1.FGS_MSG.kPublish) {
                console.info("topic: " + msg.header.topic);
                for (var i = 0; i < msg.options.length; ++i) {
                    if (msg.options[i].id === message_model_1.OptionType.kSubscribeKey) {
                        var key = msg.options[i].value.readIntLE(0, 8);
                        if (self._topicMap[msg.header.topic].context)
                            self._topicMap[msg.header.topic].callback.call(self._topicMap[msg.header.topic].context, key, msg.body);
                        else
                            self._topicMap[msg.header.topic].callback(key, msg.body);
                        break;
                    }
                }
                return;
            }
            if (self._messageMap.hasOwnProperty(msg.header.service) && self._messageMap[msg.header.service].hasOwnProperty(msg.header.msgtype)) {
                if (self._messageMap[msg.header.service][msg.header.msgtype].context)
                    self._messageMap[msg.header.service][msg.header.msgtype].callback.call(self._messageMap[msg.header.service][msg.header.msgtype].context, msg.body, msg.options);
                else
                    self._messageMap[msg.header.service][msg.header.msgtype].callback(msg.body, msg.options);
            }
            else
                console.warn("unknown message appid = " + msg.header.service);
        });
        this._client.on("close", function () {
            console.info("remote closed");
            if (_this._timer) {
                clearTimeout(_this._timer);
                _this._timer = null;
            }
            _this._timer = setTimeout(function () {
                _this._client.connect(_this._port, _this._host);
            }, 10000);
            if (_this.onClose)
                _this.onClose();
        });
        this._client.on("connect", function () {
            if (_this._timer) {
                clearTimeout(_this._timer);
                _this._timer = null;
            }
            if (_this.onConnect)
                _this.onConnect();
        });
    }
    ;
    QtpService.prototype.connect = function (port, host) {
        if (host === void 0) { host = "127.0.0.1"; }
        this._port = port;
        this._host = host;
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        this._client.connect(port, host);
    };
    QtpService.prototype.send = function (msgtype, body, service, version) {
        var msg = new message_model_1.QTPMessage();
        msg.header.msgtype = msgtype;
        if (service)
            msg.header.service = service;
        if (version)
            msg.header.version = version;
        msg.body = body;
        this._client.sendMessage(msg);
    };
    QtpService.prototype.sendWithOption = function (msgtype, options, body, service, version) {
        var msg = new message_model_1.QTPMessage();
        msg.header.msgtype = msgtype;
        options.forEach(function (option) {
            msg.addOption(option);
        });
        if (service)
            msg.header.service = service;
        if (version)
            msg.header.version = version;
        msg.body = body;
        this._client.sendMessage(msg);
    };
    QtpService.prototype.subscribe = function (topic, keys, opposite) {
        if (opposite === void 0) { opposite = false; }
        var msg = new message_model_1.QTPMessage();
        msg.header.msgtype = opposite ? message_model_1.FGS_MSG.kUnSubscribe : message_model_1.FGS_MSG.kSubscribe;
        msg.header.topic = topic;
        var optCount = new message_model_1.QtpMessageOption();
        optCount.id = message_model_1.OptionType.kItemCnt;
        optCount.value = Buffer.alloc(4, 0);
        optCount.value.writeUInt32LE(keys.length, 0);
        msg.addOption(optCount);
        var optSize = new message_model_1.QtpMessageOption();
        optSize.id = message_model_1.OptionType.kItemSize;
        optSize.value = Buffer.alloc(4, 0);
        optSize.value.writeUInt32LE(8, 0);
        msg.addOption(optSize);
        msg.body = Buffer.alloc(keys.length * 8);
        var offset = 0;
        keys.forEach(function (key) {
            msg.body.writeIntLE(key, offset, 8);
            offset += 8;
        });
        this._client.sendMessage(msg);
    };
    QtpService.prototype.onTopic = function (topic, callback, context) {
        this._topicMap[topic] = { callback: callback, context: context };
    };
    /**
     *
     */
    QtpService.prototype.addSlot = function () {
        var _this = this;
        var slots = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            slots[_i] = arguments[_i];
        }
        slots.forEach(function (slot) {
            if (!_this._messageMap.hasOwnProperty(slot.service)) {
                _this._messageMap[slot.service] = new Object();
                _this._parser.registerMsgFunction(slot.service, _this._parser, _this._parser.processQtpMsg);
            }
            _this._messageMap[slot.service][slot.msgtype] = {
                callback: slot.callback,
                context: slot.context
            };
        });
    };
    QtpService.prototype.sendToCMS = function (recActor, body) {
        var recOpt = new message_model_1.QtpMessageOption();
        recOpt.id = 12;
        recOpt.value = Buffer.from(recActor);
        var reqOpt = new message_model_1.QtpMessageOption();
        reqOpt.id = 14;
        reqOpt.value = Buffer.alloc(4, 0);
        reqOpt.value.writeInt32LE(1, 0);
        var sendOpt = new message_model_1.QtpMessageOption();
        sendOpt.id = 13;
        sendOpt.value = Buffer.from(recActor);
        this.sendWithOption(12, [recOpt, reqOpt, sendOpt], body, message_model_1.ServiceType.kCMS);
    };
    QtpService.prototype.addSlotOfCMS = function (name, cb, context) {
        var _this = this;
        this._cmsMap[name] = { callback: cb, context: context };
        this.addSlot({
            service: message_model_1.ServiceType.kCMS,
            msgtype: 12,
            callback: function (body, options) {
                for (var i = 0; i < options.length; ++i) {
                    if (options[i].id === 12) {
                        _this._cmsMap[options[i].value.toString()].callback.call(context, body);
                        break;
                    }
                }
            }
        });
    };
    QtpService.prototype.dispose = function () {
        if(this._timer){
            clearTimeout(this._timer);
            this._timer = null;
        }

        this._client.dispose();
    };
    return QtpService;
}());
exports.QtpService = QtpService;
var QTPFactory = (function () {
    function QTPFactory() {
    }
    Object.defineProperty(QTPFactory, "instance", {
        get: function () {
            if (!QTPFactory.qtp)
                QTPFactory.qtp = new QtpService();
            return QTPFactory.qtp;
        },
        enumerable: true,
        configurable: true
    });
    return QTPFactory;
}());
exports.QTPFactory = QTPFactory;
//# sourceMappingURL=qtp.service.js.map