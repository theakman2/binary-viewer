import * as FormatStringAst from './FormatStringAst';
import * as BinaryContentAst from './BinaryContentAst';
export declare class BinaryContentFormatter {
    private _rules;
    private _dataView;
    private _structsByName;
    private _simpleValuesByStructIdentifier;
    private _nodeStack;
    private _offset;
    constructor(rules: FormatStringAst.Root, dataView: DataView);
    private _readSimpleField;
    private _readSingleSimpleField;
    private _readArraySimpleField;
    private _readSingleStructField;
    private _readArrayStructField;
    private _readField;
    private _readStruct;
    read(): BinaryContentAst.StructNode;
}
