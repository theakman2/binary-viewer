export type DataType = "u8" | "u16" | "u32" | "i8" | "i16" | "i32" | "f32" | "f64" | "norm";

export interface SingleSimpleVarStatement {
	type: 'SingleSimpleVarStatement';
	kind: DataType;
	identifier: string;
}

export interface SingleStructVarStatement {
	type: 'SingleStructVarStatement';
	kind: string;
	identifier: string;
}

export type SingleVarStatement = SingleSimpleVarStatement | SingleStructVarStatement;

export interface ArraySimpleVarStatement {
	type: 'ArraySimpleVarStatement';
	kind: DataType;
	identifier: string;
	count: number | string;
}

export interface ArrayStructVarStatement {
	type: 'ArrayStructVarStatement';
	kind: string;
	identifier: string;
	count: number | string;
}

export type ArrayVarStatement = ArraySimpleVarStatement | ArrayStructVarStatement;

export type FieldStatement = SingleVarStatement | ArrayVarStatement;

export interface Struct {
	type: "struct";
	identifier: string;
	stmts: FieldStatement[];
}

export interface Root {
	structs: Struct[];
	root: string;
}