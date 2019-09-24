const merge = require('deepmerge');

import * as Rules from '../Rules';
import * as Ast from '../Ast';

function printSimpleValue(type: Rules.DataType, value: number) : string {
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
	private _parsed: Ast.Ast;
	private _settings: Settings;

	constructor(parsed: Ast.Ast, opts: Partial<Settings>) {
		this._parsed = parsed;
		this._settings = merge(defaultSettings, opts || {});
	}

	private _printNode(node: Ast.Node, indent: number): string {
		let ret: string = '';
		const assign = this._settings.assignment;
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		if (node.type == 'simple') {
			if (node.array === false) {
				ret = `${t}${node.dataType} ${node.name}${assign}${printSimpleValue(node.dataType, node.value)};\n`;
			} else {
				ret = `${t}${node.dataType} ${node.name}[${node.children.length}]${assign}[\n${t}${s}${node.children.map(v => printSimpleValue(node.dataType, v)).join(`,\n${t}${s}`)}\n${t}];\n`;
			}
		} else if (node.type == 'struct') {
			if (node.array === false) {
				let bits = ``
				for (const gc of node.value.children) {
					bits += this._printNode(gc, indent + 1);
				}
				ret = `${t}${node.dataType} ${node.name}${assign}{\n${bits}${t}};\n`;
			} else {
				let bits = '';
				for (const c of node.children) {
					bits += `${t}${s}${c.name}${assign}{\n`
					for (const gc of c.children) {
						bits += this._printNode(gc, indent + 2);
					}
					bits += `${t}${s}};\n`;
				}
				ret = `${t}${node.dataType} ${node.name}[${node.children.length}]${assign}[\n${bits}${t}];\n`;
			}
		} else if (node.type == "placeholder") {
			ret = `${t}${node.name}${assign}{\n${node.children.map(v => this._printNode(v, indent + 1)).join('')}${t}};\n`;
		}
		return ret;
	}

	public print(): string {
		return this._printNode(this._parsed, 0);
	}
};
