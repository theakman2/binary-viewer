import * as FormatStringAst from "./FormatStringAst";

export type Type = "simple" | "struct";

export interface SingleSimpleFieldNode {
	type: "SingleSimpleFieldNode";
	dataType: FormatStringAst.DataType;
	name: string;
	value: number;
}

export interface ArraySimpleFieldNode {
	type: "ArraySimpleFieldNode";
	dataType: FormatStringAst.DataType;
	name: string;
	children: number[];
}

export type SimpleFieldNode = SingleSimpleFieldNode | ArraySimpleFieldNode;

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

export type FieldNode = SimpleFieldNode | StructFieldNode;

export interface StructNode {
	type: "StructNode";
	name: string;
	children: FieldNode[];
}

export type Node = StructNode | FieldNode;
