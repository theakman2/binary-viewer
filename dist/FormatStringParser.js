"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_pegjs_1 = require("./parser.pegjs");
class FormatStringParser {
    constructor(str) {
        this._str = str;
    }
    parse() {
        return parser_pegjs_1.parse(this._str);
    }
}
exports.FormatStringParser = FormatStringParser;
;
