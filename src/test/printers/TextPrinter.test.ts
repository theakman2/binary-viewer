import * as BinaryContentAst from '../../lib/BinaryContentAst';

import {TextPrinter} from '../../lib/printers/TextPrinter';

function nice(str: string): string {
	const parts = str.split(`\n`);
	const matches = parts[1].match(`^\t+`);
	const indentToRemove = matches ? matches[0].length : 0;
	const r = new RegExp(`^${'\t'.repeat(indentToRemove)}`);
	return str.trim().split(`\n`).map(v => v.replace(r, '')).join('\n') + '\n';
}

describe(`simple fields`, () => {
	test(`one non-array simple field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SingleSimpleFieldNode",
					dataType: "u32",
					name: "myint",
					value: 7,
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				u32 myint = 7;
			};
		`));
	});
	
	test(`multiple non-array simple fields`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "SingleSimpleFieldNode",
					dataType: "u32",
					name: "myint",
					value: 7,
				},
				{
					type: "SingleSimpleFieldNode",
					dataType: "f32",
					name: "test",
					value: 9.5,
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				u32 myint = 7;
				f32 test = 9.5;
			};
		`));
	});
	
	test(`one array simple field`, () => {
		const ast: BinaryContentAst.StructNode = {
			type: "StructNode",
			dataType: "Foo",
			children: [
				{
					type: "ArraySimpleFieldNode",
					dataType: "u32",
					name: "myints",
					children: [10, 20, 30],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				u32 myints[3] = [
					10,
					20,
					30
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
					type: "ArraySimpleFieldNode",
					dataType: "u32",
					name: "myints",
					children: [10, 20, 30],
				},
				{
					type: "ArraySimpleFieldNode",
					dataType: "i16",
					name: "otherints",
					children: [-45],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				u32 myints[3] = [
					10,
					20,
					30
				];
				i16 otherints[1] = [
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
					type: "ArraySimpleFieldNode",
					dataType: "u32",
					name: "myints",
					children: [10, 20, 30],
				},
				{
					type: "SingleSimpleFieldNode",
					dataType: "f32",
					name: "bar",
					value: 3.25,
				},
				{
					type: "ArraySimpleFieldNode",
					dataType: "i16",
					name: "otherints",
					children: [-45],
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				u32 myints[3] = [
					10,
					20,
					30
				];
				f32 bar = 3.25;
				i16 otherints[1] = [
					-45
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
								type: "SingleSimpleFieldNode",
								dataType: "f32",
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
					f32 bazA = 7.75;
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
								type: "SingleSimpleFieldNode",
								dataType: "f32",
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
								type: "SingleSimpleFieldNode",
								dataType: "i16",
								name: "bazB",
								value: 7,
							},
							{
								type: "SingleSimpleFieldNode",
								dataType: "i16",
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
					f32 bazA = 7.75;
				};
				MyOtherStruct barB = {
					i16 bazB = 7;
					i16 bazC = -7;
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
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
						f32 bazA = 7.75;
					};
					MyStruct {
						f32 bazA = 4.125;
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
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
									type: "SingleSimpleFieldNode",
									dataType: "i8",
									name: "bazA",
									value: -50,
								},
								{
									type: "SingleSimpleFieldNode",
									dataType: "u8",
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
						f32 bazA = 7.75;
					};
					MyStruct {
						f32 bazA = 4.125;
					};
				];
				MyOtherStruct barB[1] = [
					MyOtherStruct {
						i8 bazA = -50;
						u8 bazB = 200;
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
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
								type: "SingleSimpleFieldNode",
								dataType: "f32",
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
									type: "SingleSimpleFieldNode",
									dataType: "i8",
									name: "bazA",
									value: -50,
								},
								{
									type: "SingleSimpleFieldNode",
									dataType: "u8",
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
						f32 bazA = 7.75;
					};
					MyStruct {
						f32 bazA = 4.125;
					};
				];
				YetAnotherStruct yetAnother = {
					f32 testing = -0.5;
				};
				MyOtherStruct barB[1] = [
					MyOtherStruct {
						i8 bazA = -50;
						u8 bazB = 200;
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
									name: "bazA",
									value: 4.125,
								},
							]
						},
					],
				},
				{
					type: "SingleSimpleFieldNode",
					dataType: "i32",
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
								type: "SingleSimpleFieldNode",
								dataType: "f32",
								name: "testing",
								value: -0.5,
							},
						]
					},
				},
				{
					type: "ArraySimpleFieldNode",
					dataType: "i16",
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
									type: "SingleSimpleFieldNode",
									dataType: "i8",
									name: "bazA",
									value: -50,
								},
								{
									type: "SingleSimpleFieldNode",
									dataType: "u8",
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
						f32 bazA = 7.75;
					};
					MyStruct {
						f32 bazA = 4.125;
					};
				];
				i32 someField = -100;
				YetAnotherStruct yetAnother = {
					f32 testing = -0.5;
				};
				i16 myArray[2] = [
					1000,
					-2000
				];
				MyOtherStruct barB[1] = [
					MyOtherStruct {
						i8 bazA = -50;
						u8 bazB = 200;
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
					type: "SingleSimpleFieldNode",
					dataType: "i32",
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
									type: "SingleSimpleFieldNode",
									dataType: "f32",
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
												type: "SingleSimpleFieldNode",
												dataType: "norm",
												name: "a",
												value: ((0 << 30) | (1023 << 20) | (511 << 10) | (511 << 0)),
											},
											{
												type: "SingleSimpleFieldNode",
												dataType: "u8",
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
																type: "SingleSimpleFieldNode",
																dataType: "i8",
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
																type: "SingleSimpleFieldNode",
																dataType: "i8",
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
					type: "SingleSimpleFieldNode",
					dataType: "u32",
					name: "anotherField",
					value: 500,
				},
			],
		};
		const text = new TextPrinter(ast).print();
		expect(text).toBe(nice(`
			Foo {
				i32 placeholder = -100;
				MyStruct bar[1] = [
					MyStruct {
						f32 bazA = -7.75;
						MyOtherStruct otherStruct = {
							norm a = (x=1.000, y=-0.001, z=-0.001, w=0.000);
							u8 b = 10;
							ThirdLevel third[2] = [
								ThirdLevel {
									i8 x = 1;
								};
								ThirdLevel {
									i8 x = -1;
								};
							];
						};
					};
				];
				u32 anotherField = 500;
			};
		`));
	});
});