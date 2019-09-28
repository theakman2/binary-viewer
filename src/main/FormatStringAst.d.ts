export type IntDataShape = "signed" | "unsigned" | "normal";

export type IntDataMax = "int" | "norm";

export interface IntDataType {
	type: "IntDataType";
	shape: IntDataShape;
	max: IntDataMax;
	size: number;
}

export interface FloatDataType {
	type: "FloatDataType";
	size: number;
}

export interface FixedLengthStringDataType {
	type: "FixedLengthStringDataType";
	size: number;
}

export interface VariableLengthStringDataType {
	type: "VariableLengthStringDataType";
}

export type PrimitiveDataType = IntDataType | FloatDataType | FixedLengthStringDataType | VariableLengthStringDataType;

export interface SinglePrimitiveVarStatementTmpl<T> {
	type: 'SinglePrimitiveVarStatement';
	dataType: T;
	identifier: string;
	attributes: string[];
}

export type SinglePrimitiveVarStatement = SinglePrimitiveVarStatementTmpl<PrimitiveDataType>;

export interface SingleStructVarStatement {
	type: 'SingleStructVarStatement';
	dataType: string;
	identifier: string;
	attributes: string[];
}

export type SingleVarStatement = SinglePrimitiveVarStatement | SingleStructVarStatement;

export interface ArrayPrimitiveVarStatementTmpl<T> {
	type: 'ArrayPrimitiveVarStatement';
	dataType: T;
	identifier: string;
	count: number | string;
	attributes: string[];
}

export type ArrayPrimitiveVarStatement = ArrayPrimitiveVarStatementTmpl<PrimitiveDataType>;

export interface ArrayStructVarStatement {
	type: 'ArrayStructVarStatement';
	dataType: string;
	identifier: string;
	count: number | string;
	attributes: string[];
}

export type ArrayVarStatement = ArrayPrimitiveVarStatement | ArrayStructVarStatement;

export type PrimitiveVarStatementTmpl<T> = SinglePrimitiveVarStatementTmpl<T> | ArrayPrimitiveVarStatementTmpl<T>;
export type PrimitiveVarStatement = PrimitiveVarStatementTmpl<PrimitiveDataType>;

export type StructVarStatement = SingleStructVarStatement | ArrayStructVarStatement;

export type FieldStatement = SingleVarStatement | ArrayVarStatement;

export interface Struct {
	type: "struct";
	identifier: string;
	stmts: FieldStatement[];
	attributes: string[];
}

export interface Root {
	structs: Struct[];
	root: string;
}