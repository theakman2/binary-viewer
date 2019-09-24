import * as FormatStringAst from "./FormatStringAst";

export type Type = "simple" | "struct";

export interface NonArraySimpleNode {
	type: "simple";
	dataType: FormatStringAst.DataType;
	name: string;
	array: false;
	value: number;
}

export interface ArraySimpleNode {
	type: "simple";
	dataType: FormatStringAst.DataType;
	name: string;
	array: true;
	children: number[];
}

export type SimpleNode = NonArraySimpleNode | ArraySimpleNode;

export interface NonArrayStructNode {
	type: "struct";
	dataType: string;
	name: string;
	array: false;
	value: PlaceholderNode;
}

export interface ArrayStructNode {
	type: "struct";
	dataType: string;
	name: string;
	array: true;
	children: PlaceholderNode[];
}

export type StructNode = NonArrayStructNode | ArrayStructNode;

export type NonPlaceholderNode = SimpleNode | StructNode;

export interface PlaceholderNode {
	type: "placeholder";
	name: string;
	children: NonPlaceholderNode[];
}

export type Node = PlaceholderNode | NonPlaceholderNode;

export type Root = PlaceholderNode;