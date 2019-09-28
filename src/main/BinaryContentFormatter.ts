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

interface DataTypeResult {
	end: number;
	value: BinaryContentAst.PrimitiveValue;
}

export class BinaryContentFormatter {
	private readonly _formatStringAst: Readonly<FormatStringAst.Root>;
	private readonly _dataView: DataView;
	private readonly _structsByName: Readonly<StructsByName>;
	private readonly _intrinsicDefinitionsByName: Readonly<IntrinsicDefinitionsByName>;
	private _simpleValuesByStructIdentifier: ValuesByStructIdentifier;
	private _nodeStack: BinaryContentAst.Node[];
	private _bitOffset: number;

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
		this._bitOffset = 0;
		const intrinsicDefinitionsByName: IntrinsicDefinitionsByName = Object.create(null);
		for (const int of intrinsics.allowed) {
			intrinsicDefinitionsByName[int.name] = int;
		}
		this._intrinsicDefinitionsByName = intrinsicDefinitionsByName;
	}

	private _readFloatDataType(dataType: FormatStringAst.FloatDataType): DataTypeResult {
		const start = (this._bitOffset + 7) & ~7;
		let value: number;
		if (dataType.size === 64) {
			value = this._dataView.getFloat64(start / 8, true);
		} else {
			value = this._dataView.getFloat32(start / 8, true);
		}
		return {
			value: value,
			end: start + dataType.size,
		};
	}

	private _readVariableLengthStringDataType(dataType: FormatStringAst.VariableLengthStringDataType): DataTypeResult {
		let currOffset = ((this._bitOffset + 7) & ~7) / 8;
		let value: string = "";
		while (true) {
			const curr = this._dataView.getUint8(currOffset);
			currOffset++;
			if (!curr) {
				break;
			}
			value += String.fromCharCode(curr);
		}
		return {
			value: value,
			end: currOffset * 8,
		};
	}

	private _readFixedLengthStringDataType(dataType: FormatStringAst.FixedLengthStringDataType): DataTypeResult {
		const start = (this._bitOffset + 7) & ~7;
		const end = start + dataType.size * 8;
		let currOffset = start;
		let value: string = "";
		while (currOffset < end) {
			const curr = this._dataView.getUint8(currOffset / 8);
			if (!curr) {
				break;
			}
			currOffset += 8;
			value += String.fromCharCode(curr);
		}
		return {
			value: value,
			end: end,
		};
	}

	private _readIntDataType(dataType: FormatStringAst.IntDataType): DataTypeResult {
		const startOffset = (this._bitOffset & ~7) / 8;
		const lastOffset = ((this._bitOffset + dataType.size + 7) & ~7) / 8;
	  
		let curr = lastOffset - 1;
		let value = 0;
		while (curr >= startOffset) {
			value *= 256;
			value += this._dataView.getUint8(curr);
			curr--;
		}
		
		value >>>= this._bitOffset & 7;
		value = (value & ((2 ** dataType.size) - 1)) >>> 0;

		const signedMax = 2 ** (dataType.size - 1) - 1;
		
		if (dataType.shape === "signed") {
			if (value > signedMax) {
				value = -(2 ** dataType.size - value);
			}
		} else if (dataType.shape === "normal") {
			value -= (signedMax + 1);
		}
		
		const unsignedMax = 2 ** dataType.size - 1;

		if (dataType.max === "norm") {
			if (dataType.shape === "unsigned") {
				value /= unsignedMax;
			} else {
				value = Math.max(value / signedMax, -1.0);
			}
		}

		return {
			end: this._bitOffset + dataType.size,
			value: value,
		};
	}

	private _readPrimitiveField(field: FormatStringAst.PrimitiveVarStatement): BinaryContentAst.PrimitiveValue {
		let ret: DataTypeResult = {end:0, value:0};
		switch (field.dataType.type) {
			case "FloatDataType":
				ret = this._readFloatDataType(field.dataType);
				break;
			case "VariableLengthStringDataType":
				ret = this._readVariableLengthStringDataType(field.dataType);
				break;
			case "FixedLengthStringDataType":
				ret = this._readFixedLengthStringDataType(field.dataType);
				break;
			case "IntDataType":
				ret = this._readIntDataType(field.dataType);
				break;
		}
		this._bitOffset = ret.end;
		return ret.value;
	}

	private _getArrayCount(struct: FormatStringAst.Struct, field: FormatStringAst.ArrayVarStatement): number {
		let max: number;
		if (typeof field.count === "string") {
			if (field.count[0] === "_") {
				max = this._intrinsicDefinitionsByName[field.count].value(this._dataView, this._bitOffset);
			} else {
				max = Math.floor(this._simpleValuesByStructIdentifier[struct.identifier][field.count]);
			}
		} else {
			max = field.count;
		}
		return max;
	}

	private _readSinglePrimitiveField(struct: FormatStringAst.Struct, field: FormatStringAst.SinglePrimitiveVarStatement): BinaryContentAst.SinglePrimitiveFieldNode {
		const ret: BinaryContentAst.SinglePrimitiveFieldNode = {
			type: "SinglePrimitiveFieldNode",
			dataType: field.dataType,
			name: field.identifier,
			value: this._readPrimitiveField(field),
		};
		if (typeof ret.value === "number") {
			if (!this._simpleValuesByStructIdentifier[struct.identifier]) {
				this._simpleValuesByStructIdentifier[struct.identifier] = Object.create(null);
			}
			this._simpleValuesByStructIdentifier[struct.identifier][field.identifier] = Math.floor(ret.value);
		}
		return ret;
	}

	private _readArrayPrimitiveField(struct: FormatStringAst.Struct, field: FormatStringAst.ArrayPrimitiveVarStatement): BinaryContentAst.ArrayPrimitiveFieldNode {
		const children: BinaryContentAst.PrimitiveValue[] = [];
		let max: number = this._getArrayCount(struct, field);
		for (let i = 0; i < max; ++i) {
			children.push(this._readPrimitiveField(field));
		}
		return {
			type: "ArrayPrimitiveFieldNode",
			dataType: field.dataType,
			name: field.identifier,
			children: children,
		};
	}

	private _readSingleStructField(struct: FormatStringAst.Struct, field: FormatStringAst.SingleStructVarStatement): BinaryContentAst.SingleStructFieldNode {
		return {
			type: "SingleStructFieldNode",
			dataType: field.dataType,
			name: field.identifier,
			value: this._readStruct(this._structsByName[field.dataType]),
		};
	}

	private _readArrayStructField(struct: FormatStringAst.Struct, field: FormatStringAst.ArrayStructVarStatement): BinaryContentAst.ArrayStructFieldNode {
		const children: BinaryContentAst.StructNode[] = [];
		let max: number = this._getArrayCount(struct, field);
		for (let i = 0; i < max; ++i) {
			children.push(this._readStruct(this._structsByName[field.dataType]));
		}
		return {
			type: "ArrayStructFieldNode",
			dataType: field.dataType,
			name: field.identifier,
			children: children,
		};
	}

	private _readField(struct: FormatStringAst.Struct, field: FormatStringAst.FieldStatement): BinaryContentAst.FieldNode {
		switch (field.type) {
			case 'ArrayPrimitiveVarStatement':
				return this._readArrayPrimitiveField(struct, field);
			case 'ArrayStructVarStatement':
				return this._readArrayStructField(struct, field);
			case 'SinglePrimitiveVarStatement':
				return this._readSinglePrimitiveField(struct, field);
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
		this._bitOffset = 0;
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
