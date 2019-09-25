import * as merge from 'deepmerge';

import * as FormatStringAst from '../FormatStringAst';
import * as BinaryContentAst from '../BinaryContentAst';

function printSimpleValue(type: FormatStringAst.DataType, value: number) : string {
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

export interface Settings {
	spacer: string;
	assignment: string;
}

const defaultSettings: Settings = {
	spacer: '\t',
	assignment: ' = ',
};

export class TextPrinter {
	private _parsed: BinaryContentAst.StructNode;
	private _settings: Settings;

	constructor(parsed: BinaryContentAst.StructNode, opts: Partial<Settings>) {
		this._parsed = parsed;
		this._settings = merge(defaultSettings, opts || {});
	}

	private _printSingleSimpleFieldNode(node: BinaryContentAst.SingleSimpleFieldNode, indent: number): string {
		const assign = this._settings.assignment;
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		return `${t}${node.dataType} ${node.name}${assign}${printSimpleValue(node.dataType, node.value)};\n`;
	}

	private _printArraySimpleFieldNode(node: BinaryContentAst.ArraySimpleFieldNode, indent: number): string {
		const assign = this._settings.assignment;
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		return `${t}${node.dataType} ${node.name}[${node.children.length}]${assign}[\n${t}${s}${node.children.map(v => printSimpleValue(node.dataType, v)).join(`,\n${t}${s}`)}\n${t}];\n`;
	}

	private _printSingleStructFieldNode(node: BinaryContentAst.SingleStructFieldNode, indent: number): string {
		const assign = this._settings.assignment;
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		let bits = ``
		for (const gc of node.value.children) {
			bits += this._printNode(gc, indent + 1);
		}
		return `${t}${node.dataType} ${node.name}${assign}{\n${bits}${t}};\n`;
	}

	private _printArrayStructFieldNode(node: BinaryContentAst.ArrayStructFieldNode, indent: number): string {
		const assign = this._settings.assignment;
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		let bits = '';
		for (const c of node.children) {
			bits += this._printNode(c, indent + 1);
		}
		return `${t}${node.dataType} ${node.name}[${node.children.length}]${assign}[\n${bits}${t}];\n`;
	}

	private _printStructNode(node: BinaryContentAst.StructNode, indent: number): string {
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		return `${t}${node.name} {\n${node.children.map(v => this._printNode(v, indent + 1)).join('')}${t}};\n`;
	}

	private _printNode(node: BinaryContentAst.Node, indent: number): string {
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

	public print(): string {
		return this._printNode(this._parsed, 0);
	}
};
