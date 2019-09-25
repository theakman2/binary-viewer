import * as FormatStringAst from './FormatStringAst';
export declare class FormatStringParser {
    private _str;
    constructor(str: string);
    parse(): FormatStringAst.Root;
}
