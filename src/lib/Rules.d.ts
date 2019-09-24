export type DataType = "u8" | "u16" | "u32" | "i8" | "i16" | "i32" | "f32" | "f64" | "norm";

export interface SimpleVarStatement {
	type: 'SimpleVarStatement';
	kind: DataType;
	identifier: string;
}

export interface StructVarStatement {
	type: 'StructVarStatement';
	kind: string;
	identifier: string;
}

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

export type FieldStatement = SimpleVarStatement | StructVarStatement | ArraySimpleVarStatement | ArrayStructVarStatement;

export interface Struct {
	type: "struct";
	identifier: string;
	stmts: FieldStatement[];
}

export interface Rules {
	structs: Struct[];
	data: string;
}