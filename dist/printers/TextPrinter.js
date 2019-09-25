"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("deepmerge");
function printSimpleValue(type, value) {
    if (type === 'norm') {
        const v = value;
        const a = (v >> 30) / 3.0;
        const r = (((v >> 20) & 1023) / 1023.0) * 2 - 1;
        const g = (((v >> 10) & 1023) / 1023.0) * 2 - 1;
        const b = (((v >> 0) & 1023) / 1023.0) * 2 - 1;
        return `(x=${r.toFixed(3)}, y=${g.toFixed(3)}, z=${b.toFixed(3)}, w=${a.toFixed(3)})`;
    }
    return value.toString();
}
const defaultSettings = {
    spacer: '\t',
    assignment: ' = ',
};
class TextPrinter {
    constructor(parsed, opts) {
        this._parsed = parsed;
        this._settings = merge(defaultSettings, opts || {});
    }
    _printSingleSimpleFieldNode(node, indent) {
        const assign = this._settings.assignment;
        const s = this._settings.spacer;
        const t = s.repeat(indent);
        return `${t}${node.dataType} ${node.name}${assign}${printSimpleValue(node.dataType, node.value)};\n`;
    }
    _printArraySimpleFieldNode(node, indent) {
        const assign = this._settings.assignment;
        const s = this._settings.spacer;
        const t = s.repeat(indent);
        return `${t}${node.dataType} ${node.name}[${node.children.length}]${assign}[\n${t}${s}${node.children.map(v => printSimpleValue(node.dataType, v)).join(`,\n${t}${s}`)}\n${t}];\n`;
    }
    _printSingleStructFieldNode(node, indent) {
        const assign = this._settings.assignment;
        const s = this._settings.spacer;
        const t = s.repeat(indent);
        let bits = ``;
        for (const gc of node.value.children) {
            bits += this._printNode(gc, indent + 1);
        }
        return `${t}${node.dataType} ${node.name}${assign}{\n${bits}${t}};\n`;
    }
    _printArrayStructFieldNode(node, indent) {
        const assign = this._settings.assignment;
        const s = this._settings.spacer;
        const t = s.repeat(indent);
        let bits = '';
        for (const c of node.children) {
            bits += this._printNode(c, indent + 1);
        }
        return `${t}${node.dataType} ${node.name}[${node.children.length}]${assign}[\n${bits}${t}];\n`;
    }
    _printStructNode(node, indent) {
        const s = this._settings.spacer;
        const t = s.repeat(indent);
        return `${t}${node.dataType} {\n${node.children.map(v => this._printNode(v, indent + 1)).join('')}${t}};\n`;
    }
    _printNode(node, indent) {
        switch (node.type) {
            case "SingleSimpleFieldNode":
                return this._printSingleSimpleFieldNode(node, indent);
            case "ArraySimpleFieldNode":
                return this._printArraySimpleFieldNode(node, indent);
            case "SingleStructFieldNode":
                return this._printSingleStructFieldNode(node, indent);
            case "ArrayStructFieldNode":
                return this._printArrayStructFieldNode(node, indent);
            case "StructNode":
                return this._printStructNode(node, indent);
        }
    }
    print() {
        return this._printNode(this._parsed, 0);
    }
}
exports.TextPrinter = TextPrinter;
;
