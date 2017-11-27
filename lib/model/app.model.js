"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Message = (function () {
    function Message() {
    }
    Message.prototype.toString = function () {
        var props = Object.getOwnPropertyNames(this);
        var rets = "|";
        for (var i in props) {
            if ((typeof this[props[i]] === "function") || (typeof this[props[i]] === "undefined") || props[i] === "len")
                continue;
            rets = rets.concat(props[i], "=", this[props[i]], "|");
        }
        return rets;
    };
    return Message;
}());
exports.Message = Message;
var BufferUtil = (function () {
    function BufferUtil() {
    }
    /**
     * @desc
     * according to fmt string, parse the buffer into Message.
     * i - integer
     * c - string
     * u - unsigned
     * f - float
     * d - double
     * p - padding
     * @param buf  source buffer.
     * @param fmt a format string.
     */
    BufferUtil.format = function (buf, offset, fmt, msg) {
        var props = Object.getOwnPropertyNames(msg);
        var marr = fmt.match(/\d+[bBwWiIlLspfd]/g);
        var len = 0;
        var iprop = 0;
        marr.forEach(function (item) {
            len = parseInt(item.substr(0, item.length - 1));
            switch (item[item.length - 1]) {
                case "b":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readUInt8(offset);
                        offset += 1;
                    }
                    break;
                case "w":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readUInt16LE(offset);
                        offset += 2;
                    }
                    break;
                case "i":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readUInt32LE(offset);
                        offset += 4;
                    }
                    break;
                case "l":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = BufferUtil.readInt64LE(buf, offset);
                        offset += 8;
                    }
                    break;
                case "B":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readInt8(offset);
                        offset += 1;
                    }
                    break;
                case "W":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readInt16LE(offset);
                        offset += 2;
                    }
                    break;
                case "I":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readInt32LE(offset);
                        offset += 4;
                    }
                    break;
                case "L":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = BufferUtil.readInt64LE(buf, offset);
                        offset += 8;
                    }
                    break;
                case "s":
                    msg[props[iprop++]] = buf.toString("utf-8", offset, buf.indexOf(0, offset));
                    offset += len;
                    break;
                case "p":
                    offset += len;
                    break;
                case "f":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readFloatLE(offset);
                        offset += 4;
                    }
                    break;
                case "d":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readDoubleLE(offset);
                        offset += 8;
                    }
                    break;
                default:
                    console.error("unknown format identifier " + item);
                    return -1;
            }
        });
        return offset;
    };
    BufferUtil.readInt64LE = function (buffer, offset) {
        var low = buffer.readInt32LE(offset);
        offset += 4;
        var n = buffer.readInt32LE(offset) * 4294967296 + low;
        offset += 4;
        if (low < 0)
            n += 4294967296;
        return n;
    };
    return BufferUtil;
}());
exports.BufferUtil = BufferUtil;
//# sourceMappingURL=app.model.js.map