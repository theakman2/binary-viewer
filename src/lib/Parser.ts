import { Rules } from './Rules';
import {parse} from './parser.pegjs';

export class Parser {
	private _str: string;
	
	constructor(str: string) {
		this._str = str;
	}

	public parse(): Rules {
		return parse(this._str);
	}
};
