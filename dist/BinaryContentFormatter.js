"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BinaryContentFormatter {
    constructor(rules, dataView) {
        this._rules = rules;
        this._dataView = dataView;
        const structsByName = Object.create(null);
        for (const struct of rules.structs) {
            structsByName[struct.identifier] = struct;
        }
        this._structsByName = structsByName;
        this._simpleValuesByStructIdentifier = {};
        this._nodeStack = [];
        this._offset = 0;
    }
    _readSimpleField(field) {
        switch (field.kind) {
            case 'i8': {
                const v = this._dataView.getInt8(this._offset);
                this._offset += 1;
                return v;
            }
            case 'i16': {
                const v = this._dataView.getInt16(this._offset, true);
                this._offset += 2;
                return v;
            }
            case 'i32': {
                const v = this._dataView.getInt32(this._offset, true);
                this._offset += 4;
                return v;
            }
            case 'u8': {
                const v = this._dataView.getUint8(this._offset);
                this._offset += 1;
                return v;
            }
            case 'u16': {
                const v = this._dataView.getUint16(this._offset, true);
                this._offset += 2;
                return v;
            }
            case 'norm':
            case 'u32': {
                const v = this._dataView.getUint32(this._offset, true);
                this._offset += 4;
                return v;
            }
            case 'f32': {
                const v = this._dataView.getFloat32(this._offset, true);
                this._offset += 4;
                return v;
            }
            case 'f64': {
                const v = this._dataView.getFloat64(this._offset, true);
                this._offset += 8;
                return v;
            }
        }
        throw new Error(`Unknown field kind: ${field.kind}`);
    }
    _readSingleSimpleField(struct, field) {
        const ret = {
            type: "SingleSimpleFieldNode",
            dataType: field.kind,
            name: field.identifier,
            value: this._readSimpleField(field),
        };
        if (!this._simpleValuesByStructIdentifier[struct.identifier]) {
            this._simpleValuesByStructIdentifier[struct.identifier] = Object.create(null);
        }
        this._simpleValuesByStructIdentifier[struct.identifier][field.identifier] = ret.value;
        return ret;
    }
    _readArraySimpleField(struct, field) {
        const children = [];
        let max;
        if (typeof field.count === "string") {
            max = Math.floor(this._simpleValuesByStructIdentifier[struct.identifier][field.count]);
        }
        else {
            max = field.count;
        }
        for (let i = 0; i < max; ++i) {
            children.push(this._readSimpleField(field));
        }
        return {
            type: "ArraySimpleFieldNode",
            dataType: field.kind,
            name: field.identifier,
            children: children,
        };
    }
    _readSingleStructField(struct, field) {
        return {
            type: "SingleStructFieldNode",
            dataType: field.kind,
            name: field.identifier,
            value: this._readStruct(this._structsByName[field.kind]),
        };
    }
    _readArrayStructField(struct, field) {
        const children = [];
        let max;
        if (typeof field.count === "string") {
            max = Math.floor(this._simpleValuesByStructIdentifier[struct.identifier][field.count]);
        }
        else {
            max = field.count;
        }
        for (let i = 0; i < max; ++i) {
            children.push(this._readStruct(this._structsByName[field.kind]));
        }
        return {
            type: "ArrayStructFieldNode",
            dataType: field.kind,
            name: field.identifier,
            children: children,
        };
    }
    _readField(struct, field) {
        switch (field.type) {
            case 'ArraySimpleVarStatement':
                return this._readArraySimpleField(struct, field);
            case 'ArrayStructVarStatement':
                return this._readArrayStructField(struct, field);
            case 'SingleSimpleVarStatement':
                return this._readSingleSimpleField(struct, field);
            case 'SingleStructVarStatement':
                return this._readSingleStructField(struct, field);
        }
    }
    _readStruct(struct) {
        const node = {
            type: "StructNode",
            dataType: struct.identifier,
            children: [],
        };
        this._nodeStack.push(node);
        for (const field of struct.stmts) {
            node.children.push(this._readField(struct, field));
        }
        this._nodeStack.pop();
        return node;
    }
    read() {
        this._offset = 0;
        this._nodeStack = [];
        this._simpleValuesByStructIdentifier = Object.create(null);
        return this._readStruct(this._structsByName[this._rules.root]);
    }
}
exports.BinaryContentFormatter = BinaryContentFormatter;
;