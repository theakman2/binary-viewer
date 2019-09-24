import * as FormatStringAst from './FormatStringAst';
import * as BinaryContentAst from './BinaryContentAst';

interface ValuesByIdentifier {
	[s: string]: number;
}

interface ValuesByStructIdentifier {
	[s: string]: ValuesByIdentifier;
}

interface StructsByName {
	[s: string]: FormatStringAst.Struct;
}

export class BinaryContentFormatter {
	private _rules: FormatStringAst.Root;
	private _dataView: DataView;
	private _structsByName: StructsByName;
	private _simpleValuesByStructIdentifier: ValuesByStructIdentifier;
	private _nodeStack: BinaryContentAst.Node[];
	private _offset: number;

	constructor(rules: FormatStringAst.Root, dataView: DataView) {
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

	private _readSimpleField(field: FormatStringAst.FieldStatement) : number {
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

	private _readNonArraySimpleField(struct: FormatStringAst.Struct, field: FormatStringAst.SimpleVarStatement) : BinaryContentAst.NonArraySimpleNode {
		const ret: BinaryContentAst.NonArraySimpleNode = {
			type: "simple",
			array: false,
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

	private _readArraySimpleField(struct: FormatStringAst.Struct, field: FormatStringAst.ArraySimpleVarStatement) : BinaryContentAst.ArraySimpleNode {
		const children: number[] = [];
		let max: number;
		if (typeof field.count === "string") {
			max = Math.floor(this._simpleValuesByStructIdentifier[struct.identifier][field.count]);
		} else {
			max = field.count;
		}
		for (let i = 0; i < max; ++i) {
			children.push(this._readSimpleField(field));
		}
		return {
			type: "simple",
			dataType: field.kind,
			name: field.identifier,
			array: true,
			children: children,
		};
	}

	private _readNonArrayStructField(struct: FormatStringAst.Struct, field: FormatStringAst.StructVarStatement) : BinaryContentAst.NonArrayStructNode {
		return {
			type: "struct",
			array: false,
			dataType: field.kind,
			name: field.identifier,
			value: this._readStruct(this._structsByName[field.kind]),
		};
	}

	private _readArrayStructField(struct: FormatStringAst.Struct, field: FormatStringAst.ArrayStructVarStatement) : BinaryContentAst.ArrayStructNode {
		const children: BinaryContentAst.PlaceholderNode[] = [];
		let max: number;
		if (typeof field.count === "string") {
			max = Math.floor(this._simpleValuesByStructIdentifier[struct.identifier][field.count]);
		} else {
			max = field.count;
		}
		for (let i = 0; i < max; ++i) {
			children.push(this._readStruct(this._structsByName[field.kind]));
		}
		return {
			type: "struct",
			dataType: field.kind,
			name: field.identifier,
			array: true,
			children: children,
		};
	}

	private _readField(struct: FormatStringAst.Struct, field: FormatStringAst.FieldStatement) : BinaryContentAst.NonPlaceholderNode {
		switch (field.type) {
			case 'ArraySimpleVarStatement':
				return this._readArraySimpleField(struct, field);
			case 'ArrayStructVarStatement':
				return this._readArrayStructField(struct, field);
			case 'SimpleVarStatement':
				return this._readNonArraySimpleField(struct, field);
			case 'StructVarStatement':
				return this._readNonArrayStructField(struct, field);
		}
	}

	private _readStruct(struct: FormatStringAst.Struct) : BinaryContentAst.PlaceholderNode {
		const node: BinaryContentAst.PlaceholderNode = {
			type: "placeholder",
			name: struct.identifier,
			children: [],
		};
		this._nodeStack.push(node);
		for (const field of struct.stmts) {
			node.children.push(this._readField(struct, field));
		}
		this._nodeStack.pop();
		return node;
	}

	public read() : BinaryContentAst.Root {
		this._offset = 0;
		this._nodeStack = [];
		this._simpleValuesByStructIdentifier = Object.create(null);
		return this._readStruct(this._structsByName[this._rules.data]);
	}
};
