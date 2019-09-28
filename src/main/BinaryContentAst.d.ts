import * as FormatStringAst from "./FormatStringAst";

export type Type = "simple" | "struct";

export type PrimitiveValue = number | string;

export interface SinglePrimitiveFieldNode {
	type: "SinglePrimitiveFieldNode";
	dataType: FormatStringAst.PrimitiveDataType;
	name: string;
	value: PrimitiveValue;
}

export interface ArrayPrimitiveFieldNode {
	type: "ArrayPrimitiveFieldNode";
	dataType: FormatStringAst.PrimitiveDataType;
	name: string;
	children: PrimitiveValue[];
}

export type PrimitiveFieldNode = SinglePrimitiveFieldNode | ArrayPrimitiveFieldNode;

export interface SingleStructFieldNode {
	type: "SingleStructFieldNode";
	dataType: string;
	name: string;
	value: StructNode;
}

export interface ArrayStructFieldNode {
	type: "ArrayStructFieldNode";
	dataType: string;
	name: string;
	children: StructNode[];
}

export type StructFieldNode = SingleStructFieldNode | ArrayStructFieldNode;

export type FieldNode = PrimitiveFieldNode | StructFieldNode;

export interface StructNode {
	type: "StructNode";
	dataType: string;
	children: FieldNode[];
}

export type Node = StructNode | FieldNode;
