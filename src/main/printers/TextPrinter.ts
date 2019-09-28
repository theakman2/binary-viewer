import * as merge from 'deepmerge';

import * as BinaryContentAst from '../BinaryContentAst';
import * as FormatStringAst from '../FormatStringAst';

export interface Settings {
	spacer: string;
	assignment: string;
	floatPrecision: number;
}

const defaultSettings: Settings = {
	spacer: '\t',
	assignment: ' = ',
	floatPrecision: 3,
};

function printPrimitiveDataType(dataType: FormatStringAst.PrimitiveDataType): string {
	switch (dataType.type) {
		case "IntDataType": {
			let ret = '';
			switch (dataType.shape) {
				case 'normal':
					ret += 'n';
					break;
				case 'unsigned':
					ret += 'u';
					break;
			}
			ret += dataType.max;
			ret += dataType.size.toString();
			return ret;
		}
		case "FloatDataType":
			return dataType.size === 32 ? 'float' : 'double';
		case "FixedLengthStringDataType":
			return `string(${dataType.size.toString()})`;
		case "VariableLengthStringDataType":
			return `string`;
	}
}

export class TextPrinter {
	private readonly _parsed: Readonly<BinaryContentAst.StructNode>;
	private readonly _settings: Readonly<Settings>;

	constructor(parsed: Readonly<BinaryContentAst.StructNode>, opts?: Readonly<Partial<Settings>>) {
		this._parsed = parsed;
		this._settings = merge(defaultSettings, opts || {});
	}

	private _printPrimitiveValue(value: BinaryContentAst.PrimitiveValue): string {
		if (typeof value === "string") {
			return value;
		}
		if (Number.isInteger(value)) {
			return value.toString();
		}
		const v = value.toFixed(this._settings.floatPrecision).replace(/0+$/, '');
		if (v[v.length - 1] === '.') {
			return v + '0';
		}
		return v;
	}

	private _printSinglePrimitiveFieldNode(node: BinaryContentAst.SinglePrimitiveFieldNode, indent: number): string {
		return [
			this._settings.spacer.repeat(indent), // opening indentation
			printPrimitiveDataType(node.dataType),
			' ',
			node.name,
			this._settings.assignment,
			this._printPrimitiveValue(node.value), // the node's actual value
			';\n',
		].join('');
	}

	private _printArrayPrimitiveFieldNode(node: BinaryContentAst.ArrayPrimitiveFieldNode, indent: number): string {
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		return [
			t, // opening indentation
			printPrimitiveDataType(node.dataType),
			' ',
			node.name,
			'[' + node.children.length + ']', // array count
			this._settings.assignment,
			`[\n${t}${s}`, // open array
			node.children.map(v => this._printPrimitiveValue(v)).join(`,\n${t}${s}`), // print comma-separated array values
			`\n${t}];\n`, // close array
		].join('');
	}

	private _printSingleStructFieldNode(node: BinaryContentAst.SingleStructFieldNode, indent: number): string {
		const assign = this._settings.assignment;
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		const bits = node.value.children.map(v => this._printNode(v, indent + 1)).join('');
		return `${t}${node.dataType} ${node.name}${assign}{\n${bits}${t}};\n`;
	}

	private _printArrayStructFieldNode(node: BinaryContentAst.ArrayStructFieldNode, indent: number): string {
		const assign = this._settings.assignment;
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		const bits = node.children.map(v => this._printNode(v, indent + 1)).join('');
		return `${t}${node.dataType} ${node.name}[${node.children.length}]${assign}[\n${bits}${t}];\n`;
	}

	private _printStructNode(node: BinaryContentAst.StructNode, indent: number): string {
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		return `${t}${node.dataType} {\n${node.children.map(v => this._printNode(v, indent + 1)).join('')}${t}};\n`;
	}

	private _printNode(node: BinaryContentAst.Node, indent: number): string {
		switch (node.type) {
			case "SinglePrimitiveFieldNode":
				return this._printSinglePrimitiveFieldNode(node, indent);
			case "ArrayPrimitiveFieldNode":
				return this._printArrayPrimitiveFieldNode(node, indent);
			case "SingleStructFieldNode":
				return this._printSingleStructFieldNode(node, indent);
			case "ArrayStructFieldNode":
				return this._printArrayStructFieldNode(node, indent);
			case "StructNode":
				return this._printStructNode(node, indent);
		}
	}

	public print(): string {
		return this._printNode(this._parsed, 0);
	}
};
