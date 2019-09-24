import * as Rules from './Rules';
import * as Ast from './Ast';

interface ValuesByIdentifier {
	[s: string]: number;
}

interface ValuesByStructIdentifier {
	[s: string]: ValuesByIdentifier;
}

interface StructsByName {
	[s: string]: Rules.Struct;
}

export class Reader {
	_rules: Rules.Rules;
	_dataView: DataView;
	_structsByName: StructsByName;
	_simpleValuesByStructIdentifier: ValuesByStructIdentifier;
	_nodeStack: Ast.Node[];
	_offset: number;

	constructor(rules: Rules.Rules, dataView: DataView) {
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

	_readSimpleField(field: Rules.FieldStatement) : number {
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

	_readNonArraySimpleField(struct: Rules.Struct, field: Rules.SimpleVarStatement) : Ast.NonArraySimpleNode {
		const ret: Ast.NonArraySimpleNode = {
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

	_readArraySimpleField(struct: Rules.Struct, field: Rules.ArraySimpleVarStatement) : Ast.ArraySimpleNode {
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

	_readNonArrayStructField(struct: Rules.Struct, field: Rules.StructVarStatement) : Ast.NonArrayStructNode {
		return {
			type: "struct",
			array: false,
			dataType: field.kind,
			name: field.identifier,
			value: this._readStruct(this._structsByName[field.kind]),
		};
	}

	_readArrayStructField(struct: Rules.Struct, field: Rules.ArrayStructVarStatement) : Ast.ArrayStructNode {
		const children: Ast.PlaceholderNode[] = [];
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

	_readField(struct: Rules.Struct, field: Rules.FieldStatement) : Ast.NonPlaceholderNode {
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

	_readStruct(struct: Rules.Struct) : Ast.PlaceholderNode {
		const node: Ast.PlaceholderNode = {
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

	read() : Ast.Ast {
		this._offset = 0;
		this._nodeStack = [];
		this._simpleValuesByStructIdentifier = Object.create(null);
		return this._readStruct(this._structsByName[this._rules.data]);
	}
};
