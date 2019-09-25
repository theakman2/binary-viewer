import * as FormatStringAst from './FormatStringAst';
import {parse} from './parser.pegjs';

export class FormatStringParser {
	private _str: string;
	
	constructor(str: string) {
		this._str = str;
	}

	public parse(): FormatStringAst.Root {
		return parse(this._str);
	}
};
