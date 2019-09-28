import * as BinaryContentAst from '../../main/BinaryContentAst';
import * as FormatStringAst from '../../main/FormatStringAst';

import { TextPrinter } from '../../main/printers/TextPrinter';
import { nice } from '../common';

function uint32(): FormatStringAst.IntDataType {
	return {
		type: "IntDataType",
		shape: "unsigned",
		max: "int",
		size: 32,
	};
}

function int32(): FormatStringAst.IntDataType {
	return {
		type: "IntDataType",
		shape: "signed",
		max: "int",
		size: 32,
	};
}

function int16(): FormatStringAst.IntDataType {
	return {
		type: "IntDataType",
		shape: "signed",
		max: "int",
		size: 16,
	};
}

function int8(): FormatStringAst.IntDataType {
	return {
		type: "IntDataType",
		shape: "signed",
		max: "int",
		size: 8,
	};
}

function uint8(): FormatStringAst.IntDataType {
	return {
		type: "IntDataType",
		shape: "unsigned",
		max: "int",
		size: 8,
	};
}

function unorm8(): FormatStringAst.IntDataType {
	return {
		type: "IntDataType",
		shape: "unsigned",
		max: "norm",
		size: 8,
	};
}

function nint8(): FormatStringAst.IntDataType {
	return {
		type: "IntDataType",
		shape: "normal",
		max: "int",
		size: 8,
	};
}

function float(): FormatStringAst.FloatDataType {
	return {
		type: "FloatDataType",
		size: 32,
	};
}

function double(): FormatStringAst.FloatDataType {
	return {
		type: "FloatDataType",
		size: 64,
	};
}

describe(`simple fields`, () => {
	test(`one non-array simple field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SinglePrimitiveFieldNode",
					dataType: uint32(),
					name: "myint",
					value: 7,
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				uint32 myint = 7;
			};
		`));
	});

	test(`one non-array simple variable string field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SinglePrimitiveFieldNode",
					dataType: {
						type: "VariableLengthStringDataType"
					},
					name: "str",
					value: "ABC",
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				string str = ABC;
			};
		`));
	});

	test(`one non-array simple fixed string field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SinglePrimitiveFieldNode",
					dataType: {
						type: "FixedLengthStringDataType",
						size: 8,
					},
					name: "str",
					value: "ABC",
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				string(8) str = ABC;
			};
		`));
	});

	test(`multiple non-array simple fields`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SinglePrimitiveFieldNode",
					dataType: uint32(),
					name: "myint",
					value: 7,
				},
				{
					type: "SinglePrimitiveFieldNode",
					dataType: float(),
					name: "test",
					value: 9.5,
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				uint32 myint = 7;
				float test = 9.5;
			};
		`));
	});

	test(`one array simple field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayPrimitiveFieldNode",
					dataType: uint32(),
					name: "myints",
					children: [10, 20, 30],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				uint32 myints[3] = [
					10,
					20,
					30
				];
			};
		`));
	});

	test(`one array variable string field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayPrimitiveFieldNode",
					dataType: {
						type: "VariableLengthStringDataType",
					},
					name: "str",
					children: ["ABC", "def", "ggggg"],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				string str[3] = [
					ABC,
					def,
					ggggg
				];
			};
		`));
	});

	test(`one array fixed string field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayPrimitiveFieldNode",
					dataType: {
						type: "FixedLengthStringDataType",
						size: 6,
					},
					name: "str",
					children: ["ABC", "def", "ggggg"],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				string(6) str[3] = [
					ABC,
					def,
					ggggg
				];
			};
		`));
	});

	test(`multiple array simple fields`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayPrimitiveFieldNode",
					dataType: uint32(),
					name: "myints",
					children: [10, 20, 30],
				},
				{
					type: "ArrayPrimitiveFieldNode",
					dataType: int16(),
					name: "otherints",
					children: [-45],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				uint32 myints[3] = [
					10,
					20,
					30
				];
				int16 otherints[1] = [
					-45
				];
			};
		`));
	});

	test(`multiple mixed (array + non-array) simple fields`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayPrimitiveFieldNode",
					dataType: uint32(),
					name: "myints",
					children: [10, 20, 30],
				},
				{
					type: "SinglePrimitiveFieldNode",
					dataType: float(),
					name: "bar",
					value: 3.25,
				},
				{
					type: "ArrayPrimitiveFieldNode",
					dataType: nint8(),
					name: "otherints",
					children: [-9],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				uint32 myints[3] = [
					10,
					20,
					30
				];
				float bar = 3.25;
				nint8 otherints[1] = [
					-9
				];
			};
		`));
	});
});

describe(`struct fields`, () => {
	test(`one non-array struct field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SingleStructFieldNode",
					dataType: "MyStruct",
					name: "bar",
					value: {
						type: "StructNode",
						dataType: "MyStruct",
						children: [
							{
								type: "SinglePrimitiveFieldNode",
								dataType: double(),
								name: "bazA",
								value: 7.75,
							},
						]
					},
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				MyStruct bar = {
					double bazA = 7.75;
				};
			};
		`));
	});

	test(`multiple non-array struct fields`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SingleStructFieldNode",
					dataType: "MyStruct",
					name: "bar",
					value: {
						type: "StructNode",
						dataType: "MyStruct",
						children: [
							{
								type: "SinglePrimitiveFieldNode",
								dataType: float(),
								name: "bazA",
								value: 7.75,
							},
						]
					},
				},
				{
					type: "SingleStructFieldNode",
					dataType: "MyOtherStruct",
					name: "barB",
					value: {
						type: "StructNode",
						dataType: "MyOtherStruct",
						children: [
							{
								type: "SinglePrimitiveFieldNode",
								dataType: int16(),
								name: "bazB",
								value: 7,
							},
							{
								type: "SinglePrimitiveFieldNode",
								dataType: int16(),
								name: "bazC",
								value: -7,
							},
						]
					},
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				MyStruct bar = {
					float bazA = 7.75;
				};
				MyOtherStruct barB = {
					int16 bazB = 7;
					int16 bazC = -7;
				};
			};
		`));
	});

	test(`one array struct field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayStructFieldNode",
					dataType: "MyStruct",
					name: "bar",
					children: [
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: 7.75,
								},
							]
						},
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: 4.125,
								},
							]
						},
					],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				MyStruct bar[2] = [
					MyStruct {
						float bazA = 7.75;
					};
					MyStruct {
						float bazA = 4.125;
					};
				];
			};
		`));
	});

	test(`multiple array struct fields`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayStructFieldNode",
					dataType: "MyStruct",
					name: "bar",
					children: [
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: 7.75,
								},
							]
						},
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: 4.125,
								},
							]
						},
					],
				},
				{
					type: "ArrayStructFieldNode",
					dataType: "MyOtherStruct",
					name: "barB",
					children: [
						{
							type: "StructNode",
							dataType: "MyOtherStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: int8(),
									name: "bazA",
									value: -50,
								},
								{
									type: "SinglePrimitiveFieldNode",
									dataType: uint8(),
									name: "bazB",
									value: 200,
								},
							]
						},
					],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				MyStruct bar[2] = [
					MyStruct {
						float bazA = 7.75;
					};
					MyStruct {
						float bazA = 4.125;
					};
				];
				MyOtherStruct barB[1] = [
					MyOtherStruct {
						int8 bazA = -50;
						uint8 bazB = 200;
					};
				];
			};
		`));
	});

	test(`multiple mixed (array + non-array) struct fields`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayStructFieldNode",
					dataType: "MyStruct",
					name: "bar",
					children: [
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: 7.75,
								},
							]
						},
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: 4.125,
								},
							]
						},
					],
				},
				{
					type: "SingleStructFieldNode",
					dataType: "YetAnotherStruct",
					name: "yetAnother",
					value: {
						type: "StructNode",
						dataType: "YetAnotherStruct",
						children: [
							{
								type: "SinglePrimitiveFieldNode",
								dataType: float(),
								name: "testing",
								value: -0.5,
							},
						]
					},
				},
				{
					type: "ArrayStructFieldNode",
					dataType: "MyOtherStruct",
					name: "barB",
					children: [
						{
							type: "StructNode",
							dataType: "MyOtherStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: int8(),
									name: "bazA",
									value: -50,
								},
								{
									type: "SinglePrimitiveFieldNode",
									dataType: uint8(),
									name: "bazB",
									value: 200,
								},
							]
						},
					],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				MyStruct bar[2] = [
					MyStruct {
						float bazA = 7.75;
					};
					MyStruct {
						float bazA = 4.125;
					};
				];
				YetAnotherStruct yetAnother = {
					float testing = -0.5;
				};
				MyOtherStruct barB[1] = [
					MyOtherStruct {
						int8 bazA = -50;
						uint8 bazB = 200;
					};
				];
			};
		`));
	});
});

describe(`complex mixed`, () => {
	test(`mixed array and non-array simple and struct fields`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArrayStructFieldNode",
					dataType: "MyStruct",
					name: "bar",
					children: [
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: 7.75,
								},
							]
						},
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: 4.125,
								},
							]
						},
					],
				},
				{
					type: "SinglePrimitiveFieldNode",
					dataType: int32(),
					name: "someField",
					value: -100,
				},
				{
					type: "SingleStructFieldNode",
					dataType: "YetAnotherStruct",
					name: "yetAnother",
					value: {
						type: "StructNode",
						dataType: "YetAnotherStruct",
						children: [
							{
								type: "SinglePrimitiveFieldNode",
								dataType: float(),
								name: "testing",
								value: -0.5,
							},
						]
					},
				},
				{
					type: "ArrayPrimitiveFieldNode",
					dataType: int16(),
					name: "myArray",
					children: [1000, -2000],
				},
				{
					type: "ArrayStructFieldNode",
					dataType: "MyOtherStruct",
					name: "barB",
					children: [
						{
							type: "StructNode",
							dataType: "MyOtherStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: int8(),
									name: "bazA",
									value: -50,
								},
								{
									type: "SinglePrimitiveFieldNode",
									dataType: uint8(),
									name: "bazB",
									value: 200,
								},
							]
						},
					],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				MyStruct bar[2] = [
					MyStruct {
						float bazA = 7.75;
					};
					MyStruct {
						float bazA = 4.125;
					};
				];
				int32 someField = -100;
				YetAnotherStruct yetAnother = {
					float testing = -0.5;
				};
				int16 myArray[2] = [
					1000,
					-2000
				];
				MyOtherStruct barB[1] = [
					MyOtherStruct {
						int8 bazA = -50;
						uint8 bazB = 200;
					};
				];
			};
		`));
	});

	test(`nested structs`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SinglePrimitiveFieldNode",
					dataType: int32(),
					name: "placeholder",
					value: -100,
				},
				{
					type: "ArrayStructFieldNode",
					dataType: "MyStruct",
					name: "bar",
					children: [
						{
							type: "StructNode",
							dataType: "MyStruct",
							children: [
								{
									type: "SinglePrimitiveFieldNode",
									dataType: float(),
									name: "bazA",
									value: -7.75,
								},
								{
									type: "SingleStructFieldNode",
									dataType: "MyOtherStruct",
									name: "otherStruct",
									value: {
										type: "StructNode",
										dataType: "MyOtherStruct",
										children: [
											{
												type: "SinglePrimitiveFieldNode",
												dataType: unorm8(),
												name: "a",
												value: 185 / 255,
											},
											{
												type: "SinglePrimitiveFieldNode",
												dataType: uint8(),
												name: "b",
												value: 10,
											},
											{
												type: "ArrayStructFieldNode",
												dataType: "ThirdLevel",
												name: "third",
												children: [
													{
														type: "StructNode",
														dataType: "ThirdLevel",
														children: [
															{
																type: "SinglePrimitiveFieldNode",
																dataType: int8(),
																name: "x",
																value: 1,
															},
														],
													},
													{
														type: "StructNode",
														dataType: "ThirdLevel",
														children: [
															{
																type: "SinglePrimitiveFieldNode",
																dataType: int8(),
																name: "x",
																value: -1,
															},
														],
													},
												],
											},
										],
									},
								},
							],
						},
					],
				},
				{
					type: "SinglePrimitiveFieldNode",
					dataType: uint32(),
					name: "anotherField",
					value: 500,
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				int32 placeholder = -100;
				MyStruct bar[1] = [
					MyStruct {
						float bazA = -7.75;
						MyOtherStruct otherStruct = {
							unorm8 a = 0.725;
							uint8 b = 10;
							ThirdLevel third[2] = [
								ThirdLevel {
									int8 x = 1;
								};
								ThirdLevel {
									int8 x = -1;
								};
							];
						};
					};
				];
				uint32 anotherField = 500;
			};
		`));
	});
});