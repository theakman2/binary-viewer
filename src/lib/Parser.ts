import { Rules } from './Rules';
import {parse} from './parser.pegjs';

export class Parser {
	_str: string;
	
	constructor(str: string) {
		this._str = str;
	}

	parse(): Rules {
		return parse(this._str);
	}
};
