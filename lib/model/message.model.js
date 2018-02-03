/**
 * created by chenlei, 2017/04/27
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app_model_1 = require("./app.model");
var Header = (function (_super) {
    __extends(Header, _super);
    function Header() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.version = 0;
        _this.service = 0;
        _this.msgtype = 0;
        _this.topic = 0;
        _this.optslen = 0;
        _this.datalen = 0;
        return _this;
    }
    Header.prototype.toBuffer = function () {
        var buf = Buffer.alloc(Header.len, 0);
        var offset = 0;
        buf.writeUInt8(this.version, offset), offset += 1;
        buf.writeUInt8(this.service, offset), offset += 1;
        buf.writeUInt16LE(this.msgtype, offset), offset += 2;
        buf.writeUInt16LE(this.topic, offset);
        offset += 2;
        buf.writeUInt16LE(this.optslen, offset);
        offset += 2;
        buf.writeUInt32LE(this.datalen, offset);
        offset += 4;
        return buf;
    };
    Header.prototype.fromBuffer = function (buf, offset) {
        this.version = buf.readUInt8(offset), offset += 1;
        this.service = buf.readUInt8(offset), offset += 1;
        this.msgtype = buf.readUInt16LE(offset), offset += 2;
        this.topic = buf.readUInt16LE(offset), offset += 2;
        this.optslen = buf.readUInt16LE(offset), offset += 2;
        this.datalen = buf.readUInt32LE(offset), offset += 4;
        return offset;
    };
    return Header;
}(app_model_1.Message));
Header.len = 12;
exports.Header = Header;
var QTPMessage = (function (_super) {
    __extends(QTPMessage, _super);
    function QTPMessage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.header = new Header();
        _this.options = [];
        return _this;
    }
    QTPMessage.prototype.fromBuffer = function (buf, offset) {
        if (offset === void 0) { offset = 0; }
        var optlen = this.header.optslen;
        while (optlen > 0) {
            var option = new QtpMessageOption();
            offset = option.fromBuffer(buf, offset);
            this.options.push(option);
            optlen -= option.len + 4;
        }

        if (this.header.datalen > 0) {
            this.body = Buffer.from(buf.slice(offset, offset + this.header.datalen));
            offset += this.header.datalen;
        }
        return offset;
    };
    QTPMessage.prototype.toBuffer = function () {
        var offset = 0;
        var bodyBuf;
        if (this.body) {
            if (typeof this.body === "string")
                bodyBuf = Buffer.from(this.body);
            else
                bodyBuf = this.body;
            this.header.datalen = bodyBuf.byteLength;
        }

        var buf = Buffer.alloc(Header.len + this.header.optslen + this.header.datalen);
        this.header.toBuffer().copy(buf, offset);
        offset += Header.len;
        this.options.forEach(function (option) {
            option.toBuffer().copy(buf, offset);
            offset += option.len + 4;
        });

        if (this.body) {
            bodyBuf.copy(buf, offset);
        }
        return buf;
    };
    QTPMessage.prototype.addOption = function (option) {
        option.len = option.value.length;
        this.header.optslen += option.len + 4;
        this.options.push(option);
    };
    return QTPMessage;
}(app_model_1.Message));
exports.QTPMessage = QTPMessage;
var QtpMessageOption = (function () {
    function QtpMessageOption() {
    }
    QtpMessageOption.prototype.toBuffer = function () {
        var buf = Buffer.alloc(4 + this.len);
        buf.writeUInt16LE(this.id, 0);
        buf.writeUInt16LE(this.len, 2);
        this.value.copy(buf, 4);
        return buf;
    };
    QtpMessageOption.prototype.fromBuffer = function (buf, offset) {
        if (offset === void 0) { offset = 0; }
        this.id = buf.readUInt16LE(offset);
        offset += 2;
        this.len = buf.readUInt16LE(offset);
        offset += 2;
        this.value = buf.slice(offset, this.len + offset);
        offset += this.len;
        return offset;
    };
    return QtpMessageOption;
}());
exports.QtpMessageOption = QtpMessageOption;
var OptionType;
(function (OptionType) {
    OptionType[OptionType["kItemSize"] = 59901] = "kItemSize";
    OptionType[OptionType["kItemCnt"] = 59902] = "kItemCnt";
    OptionType[OptionType["kInstanceID"] = 59903] = "kInstanceID";
    OptionType[OptionType["kSessionID"] = 59904] = "kSessionID";
    OptionType[OptionType["kSubscribeKey"] = 59905] = "kSubscribeKey";
})(OptionType = exports.OptionType || (exports.OptionType = {}));
var FGS_MSG;
(function (FGS_MSG) {
    FGS_MSG[FGS_MSG["kFGSAns"] = 100] = "kFGSAns";
    FGS_MSG[FGS_MSG["kLogin"] = 101] = "kLogin";
    FGS_MSG[FGS_MSG["kLoginAns"] = 102] = "kLoginAns";
    FGS_MSG[FGS_MSG["kLogout"] = 103] = "kLogout";
    FGS_MSG[FGS_MSG["kLogoutAns"] = 104] = "kLogoutAns";
    FGS_MSG[FGS_MSG["kSubscribe"] = 105] = "kSubscribe";
    FGS_MSG[FGS_MSG["kUnSubscribe"] = 106] = "kUnSubscribe";
    FGS_MSG[FGS_MSG["kPublish"] = 107] = "kPublish";
    FGS_MSG[FGS_MSG["kComboSubscribe"] = 108] = "kComboSubscribe";
    FGS_MSG[FGS_MSG["kComboUnsubscribe"] = 109] = "kComboUnsubscribe";
    FGS_MSG[FGS_MSG["kComboPublish"] = 110] = "kComboPublish";
})(FGS_MSG = exports.FGS_MSG || (exports.FGS_MSG = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType[ServiceType["kCMS"] = 40] = "kCMS";
    ServiceType[ServiceType["kFGS"] = 0] = "kFGS";
})(ServiceType = exports.ServiceType || (exports.ServiceType = {}));
//# sourceMappingURL=message.model.js.map