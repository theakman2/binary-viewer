import * as FormatStringAst from './FormatStringAst';
import * as BinaryContentAst from './BinaryContentAst';
import { Validator } from './Validator';
import * as intrinsics from './intrinsics';

interface ValuesByIdentifier {
	[s: string]: number;
}

interface ValuesByStructIdentifier {
	[s: string]: ValuesByIdentifier;
}

interface StructsByName {
	[s: string]: FormatStringAst.Struct;
}

interface IntrinsicDefinitionsByName {
	[s: string]: intrinsics.IntrinsicDefinition;
}

export class BinaryContentFormatter {
	private readonly _formatStringAst: Readonly<FormatStringAst.Root>;
	private readonly _dataView: DataView;
	private readonly _structsByName: Readonly<StructsByName>;
	private readonly _intrinsicDefinitionsByName: Readonly<IntrinsicDefinitionsByName>;
	private _simpleValuesByStructIdentifier: ValuesByStructIdentifier;
	private _nodeStack: BinaryContentAst.Node[];
	private _offset: number;

	constructor(formatStringAst: Readonly<FormatStringAst.Root>, dataView: DataView) {
		this._formatStringAst = formatStringAst;
		this._dataView = dataView;
		const structsByName = Object.create(null);
		for (const struct of formatStringAst.structs) {
			structsByName[struct.identifier] = struct;
		}
		this._structsByName = structsByName;
		this._simpleValuesByStructIdentifier = {};
		this._nodeStack = [];
		this._offset = 0;
		const intrinsicDefinitionsByName: IntrinsicDefinitionsByName = Object.create(null);
		for (const int of intrinsics.allowed) {
			intrinsicDefinitionsByName[int.name] = int;
		}
		this._intrinsicDefinitionsByName = intrinsicDefinitionsByName;
	}

	private _readSimpleField(field: FormatStringAst.FieldStatement): number {
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

	private _getArrayCount(struct: FormatStringAst.Struct, field: FormatStringAst.ArrayVarStatement): number {
		let max: number;
		if (typeof field.count === "string") {
			if (field.count[0] === "_") {
				max = this._intrinsicDefinitionsByName[field.count].value(this._dataView, this._offset);
			} else {
				max = Math.floor(this._simpleValuesByStructIdentifier[struct.identifier][field.count]);
			}
		} else {
			max = field.count;
		}
		return max;
	}

	private _readSingleSimpleField(struct: FormatStringAst.Struct, field: FormatStringAst.SingleSimpleVarStatement): BinaryContentAst.SingleSimpleFieldNode {
		const ret: BinaryContentAst.SingleSimpleFieldNode = {
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

	private _readArraySimpleField(struct: FormatStringAst.Struct, field: FormatStringAst.ArraySimpleVarStatement): BinaryContentAst.ArraySimpleFieldNode {
		const children: number[] = [];
		let max: number = this._getArrayCount(struct, field);
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

	private _readSingleStructField(struct: FormatStringAst.Struct, field: FormatStringAst.SingleStructVarStatement): BinaryContentAst.SingleStructFieldNode {
		return {
			type: "SingleStructFieldNode",
			dataType: field.kind,
			name: field.identifier,
			value: this._readStruct(this._structsByName[field.kind]),
		};
	}

	private _readArrayStructField(struct: FormatStringAst.Struct, field: FormatStringAst.ArrayStructVarStatement): BinaryContentAst.ArrayStructFieldNode {
		const children: BinaryContentAst.StructNode[] = [];
		let max: number = this._getArrayCount(struct, field);
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

	private _readField(struct: FormatStringAst.Struct, field: FormatStringAst.FieldStatement): BinaryContentAst.FieldNode {
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

	private _readStruct(struct: FormatStringAst.Struct): BinaryContentAst.StructNode {
		const node: BinaryContentAst.StructNode = {
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

	public read(): BinaryContentAst.StructNode {
		this._offset = 0;
		this._nodeStack = [];
		this._simpleValuesByStructIdentifier = Object.create(null);
		new Validator(
			this._formatStringAst,
			{
				allowedIntrinsics: Object.keys(this._intrinsicDefinitionsByName),
			}
		).validate();
		return this._readStruct(this._structsByName[this._formatStringAst.root]);
	}
};
