import * as FormatStringAst from './FormatStringAst';
import { parse } from './parser.dist';

export class FormatStringParser {
	private readonly _str: string;

	constructor(str: string) {
		this._str = str;
	}

	public parse(): FormatStringAst.Root {
		return parse(this._str);
	}
};
