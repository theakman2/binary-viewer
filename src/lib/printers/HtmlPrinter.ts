const merge = require('deepmerge');

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

export interface Styles {
	color?: string;
	fontWeight?: string;
	fontStyle?: string;
	textDecoration?: string;
}

export interface StyleSettingSet {
	userDataType: Styles;
	builtinDataType: Styles;
	identifier: Styles;
}

export interface Settings {
	spacer: string;
	assignment: string;
	styles: StyleSettingSet;
}

const defaultSettings: Settings = {
	spacer: '\t',
	assignment: ' = ',
	styles: {
		userDataType: {
			color: 'grey',
			fontWeight: 'bold',
		},
		builtinDataType: {
			color: 'grey',
		},
		identifier: {
			color: 'purple',
			fontWeight: 'bold',
		},
	},
};

function cssifyPropName(match: string): string {
	return '-' + match[0].toLowerCase();
}

function toStyleString(obj: Styles): string {
	let ret = '';
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			const cssName = key.replace(/[A-Z]/g, cssifyPropName);
			ret += cssName + ':' + obj[key as keyof Styles] + ';';
		}
	}
	return ret;
}

export class HtmlPrinter {
	private _parsed: BinaryContentAst.Root;
	private _settings: Settings;

	constructor(parsed: BinaryContentAst.Root, opts: Partial<Settings>) {
		this._parsed = parsed;
		this._settings = merge(defaultSettings, opts || {});
	}

	private _printDataType(type: string): string {
		const isUserType = !!type.match(/^[A-Z]/);
		const styleString = toStyleString(isUserType ? this._settings.styles.userDataType : this._settings.styles.builtinDataType);
		return `<span style="${styleString}">${type}</span>`;
	}

	private _printIdentifier(ident: string): string {
		const styles = toStyleString(this._settings.styles.identifier);
		return `<span style="${styles}">${ident}</span>`;
	}

	private _printNode(node: BinaryContentAst.Node, indent: number): string {
		let ret: string = '';
		const assign = this._settings.assignment;
		const s = this._settings.spacer;
		const t = s.repeat(indent);
		const name = this._printIdentifier(node.name);
		if (node.type == 'simple') {
			const dt = this._printDataType(node.dataType);
			if (node.array === false) {
				ret = `${t}${dt} ${name}${assign}${printSimpleValue(node.dataType, node.value)};\n`;
			} else {
				ret = `${t}${dt} ${name}[${node.children.length}]${assign}[\n${t}${s}${node.children.map(v => printSimpleValue(node.dataType, v)).join(`,\n${t}${s}`)}\n${t}];\n`;
			}
		} else if (node.type == 'struct') {
			if (node.array === false) {
				let bits = ``
				for (const gc of node.value.children) {
					bits += this._printNode(gc, indent + 1);
				}
				const dt = this._printDataType(node.dataType);
				ret = `${t}${dt} ${name}${assign}{\n${bits}${t}};\n`;
			} else {
				let bits = '';
				for (const c of node.children) {
					const cn = this._printDataType(c.name);
					bits += `${t}${s}${cn}${assign}{\n`
					for (const gc of c.children) {
						bits += this._printNode(gc, indent + 2);
					}
					bits += `${t}${s}};\n`;
				}
				const dt = this._printDataType(node.dataType);
				ret = `${t}${dt} ${name}[${node.children.length}]${assign}[\n${bits}${t}];\n`;
			}
		} else if (node.type == "placeholder") {
			ret = `${t}${name}${assign}{\n${node.children.map(v => this._printNode(v, indent + 1)).join('')}${t}};\n`;
		}
		return ret;
	}

	public print(): string {
		return `<pre>${this._printNode(this._parsed, 0)}</pre>`;
	}
};
