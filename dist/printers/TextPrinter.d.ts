import * as BinaryContentAst from '../BinaryContentAst';
export interface Settings {
    spacer: string;
    assignment: string;
}
export declare class TextPrinter {
    private _parsed;
    private _settings;
    constructor(parsed: BinaryContentAst.StructNode, opts?: Partial<Settings>);
    private _printSingleSimpleFieldNode;
    private _printArraySimpleFieldNode;
    private _printSingleStructFieldNode;
    private _printArrayStructFieldNode;
    private _printStructNode;
    private _printNode;
    print(): string;
}
