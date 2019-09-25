import * as FormatStringAst from "./FormatStringAst";
export declare class Validator {
    private _input;
    constructor(input: FormatStringAst.Root);
    validate(): void;
}
