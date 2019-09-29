import * as bv from '../../main/index';
import { nice } from '../common';

function parse(formatString: string, binaryData: DataView): string {
	const formatStringAst = new bv.FormatStringParser(formatString).parse();
	const binaryContentAst = new bv.BinaryContentFormatter(formatStringAst, binaryData).read();
	return new bv.TextPrinter(binaryContentAst, {spacer: '\t', assignment: ' = '}).print();
}

function getView(): DataView {
	const ab = new ArrayBuffer(64);
	return new DataView(ab);
}

let dv: DataView = getView();

beforeEach(() => {
	dv = getView();
});

describe(`primitive types`, () => {
	test("regular-sized types", () => {
		dv.setUint32(0, 1234567890, true);
		dv.setUint8(4, 123);
		dv.setInt8(5, -34);
		dv.setInt16(6, 2345, true);
		dv.setFloat32(8, 445.6, true);
		dv.setFloat64(12, -927.287353, true);

		// myString
		dv.setInt8(20, 65);
		dv.setInt8(21, 65);
		dv.setInt8(22, 66);
		dv.setInt8(23, 67);
		dv.setInt8(24, 67);
		dv.setInt8(25, 0); // null terminator

		// anotherString
		dv.setInt8(26, 75);
		dv.setInt8(27, 76);
		dv.setInt8(28, 77);
		dv.setInt8(29, 0); // null terminator

		// str1
		dv.setInt8(30, 70);
		dv.setInt8(31, 71);
		dv.setInt8(32, 0);
		dv.setInt8(33, 72);
		dv.setInt8(34, 73);

		// str2
		dv.setInt8(38, 69);
		dv.setInt8(39, 68);
		dv.setInt8(40, 67);
		dv.setInt8(41, 0);
	
		expect(parse(
			`
				Main {
					uint32 v1; // unsigned 32-bit integer
					uint8 v2; // unsigned 8-bit int
					int8 v3; // signed 8-bit int
					sint16 v4; // signed 16-bit int - the 's' prefix is optional
					float f; // 32-bit float
					double d; // 64-bit double

					/**
					 * Read bytes until the first null-terminator, and store the result as an ascii string.
					 **/
					string myString;
					string anotherString;

					/**
					 * Read bytes until the first null-terminator OR 8 bytes have been read, and store the result as an ascii string.
					 * The cursor is placed 8 bytes after the start of the string (even if a null terminator is found earlier).
					 **/
					string(8) str1;
					string(8) str2;
				};
			`,
			dv
		)).toBe(nice(`
			Main {
				uint32 v1 = 1234567890;
				uint8 v2 = 123;
				int8 v3 = -34;
				int16 v4 = 2345;
				float f = 445.6;
				double d = -927.287;
				string myString = AABCC;
				string anotherString = KLM;
				string(8) str1 = FG;
				string(8) str2 = EDC;
			};
		`));
	});
	
	test("arbitrarily-sized ints", () => {
		let value:number;

		value = 0;
		value |= 1 << 4;
		value |= 1 << 13;
		value |= 1 << 20;
		value |= 1 << 28;
		value |= 1 << 31;
		dv.setUint32(0, value, true);

		value = 0;
		value |= 1 << 2;
		value |= 1 << 5;
		value |= 1 << 12;
		value |= 1 << 15;

		dv.setUint16(4, value, true);

		dv.setUint16(6, 1234, true);

		dv.setInt16(8, -12345, true);
		dv.setInt16(10, 22110, true);

		expect(parse(
			`
				// Structs may be freely defined and subsequently used.
				// Structs may be nested arbitrarily deep.
				Normal {
					uint10 r; // unsigned 10-bit integer in bits 0-9 (values from 0 to 1023)
					uint10 g; // unsigned 10-bit integer in bits 10-19 (values from 0 to 1023)
					int10 b; // signed 10-bit integer in bits 20-29 (values from -512 to 511, twos-complement)
					uint2 a; // unsigned 2-bit integer in bits 30-31 (values from 0 to 3)
				};

				Main {
					Normal myNormal;

					/**
					 * Normalized 7-bit integer.
					 * The values 0 to 127 (the minimum and maximum for a 7-bit integer) are mapped to 0.0 to 1.0 respectively.
					 **/
					unorm7 x;

					/**
					 * 'Normal' 9-bit integer.
					 * The value is given by double(U) - (2 ** (B - 1)), where:
					 * B is the bit-width (in this case, 9)
					 * U is the value when treated as an unsigned integer of bit-width B.
					 **/
					nint9 y;

					/**
					 * Normalized 'normal' 8-bit integer.
					 * The value is given by: Math.max(-1.0, (double(U) - X) / (X - 1))
					 * Where:
					 * B is the bitwidth (in this case, 16)
					 * U is the value when treated as an unsigned integer of bit-width B.
					 * X = 2 ** (B - 1)
					 **/
					nnorm16 z;

					/**
					 * Scales the 16-bit signed integer using the following formula:
					 * 
					 * S * Math.max(V / M, -1.0)
					 * 
					 * V is the value when treated as signed integer of bit-width 16.
					 * S = 1 << 12
					 * M is the highest signed value of a twos-complement integer of bit-width 16.
					 * In this case, M = 32767
					 * 
					 * So: -4096.0 <= t <= 4096.0
					 **/
					s12scale16 t;

					/**
					 * Scales the 16-bit unsigned integer using the following formula:
					 * 
					 * V * S / M
					 * 
					 * V is the value when treated as signed integer of bit-width 16.
					 * S = 1 << 6
					 * M is the highest value of a 16-bit unsigned integer.
					 * In this case, M = 65535
					 * 
					 * So: 0 <= t <= 64.0
					 **/
					u6scale16 u;
				};
			`,
			dv
		)).toBe(nice(`
			Main {
				Normal myNormal = {
					uint10 r = 16;
					uint10 g = 8;
					int10 b = 257;
					uint2 a = 2;
				};
				unorm7 x = 0.283;
				nint9 y = 32;
				nnorm16 z = -0.962;
				s12scale16 t = -1543.172;
				u6scale16 u = 21.592;
			};
		`));
	});
});

describe(`array types`, () => {
	test(`arrays`, () => {
		dv.setUint32(0, 4, true);
		dv.setUint8(4, 10);
		dv.setUint8(5, 20);
		dv.setUint8(6, 30);
		dv.setUint8(7, 40);

		dv.setInt8(8, -30);
		dv.setInt8(9, -40);
		dv.setInt8(10, -50);

		dv.setInt8(11, 50);
		dv.setInt8(12, 51);
		dv.setInt8(13, 60);
		dv.setInt8(14, 61);

		expect(parse(
			`
				Foo {
					int8 a[1];
					int8 b;
				};

				Main {
					uint32 count;

					// Any primitive type can be an array.
					// The number of array elements can be dynamic - here it refers to the value of the 'count' variable.
					uint8 values[count];

					// This is an array of 3 int8s.
					int8 moreValues[3];

					// Array of structs.
					Foo theFoos[2];
				};
			`,
			dv
		)).toBe(nice(`
			Main {
				uint32 count = 4;
				uint8 values[4] = [
					10,
					20,
					30,
					40
				];
				int8 moreValues[3] = [
					-30,
					-40,
					-50
				];
				Foo theFoos[2] = [
					Foo {
						int8 a[1] = [
							50
						];
						int8 b = 51;
					};
					Foo {
						int8 a[1] = [
							60
						];
						int8 b = 61;
					};
				];
			};
		`));
	});
});

describe(`attributes`, () => {
	test(`@hide`, () => {
		dv.setUint8(0, 50);
		dv.setUint8(1, 51);
		dv.setUint8(2, 52);
		dv.setUint8(3, 53);

		expect(parse(
			`
				Main {
					uint8 a;
					uint8 b;

					// This field will be consumed but not displayed.
					@hide uint8 c;

					uint8 d;
				};
			`,
			dv
		)).toBe(nice(`
			Main {
				uint8 a = 50;
				uint8 b = 51;
				uint8 d = 53;
			};
		`));
	});
});

describe(`intrinsics`, () => {
	test(`__LEFT__`, () => {
		const shortDv = new DataView(dv.buffer, 0, 9);
		shortDv.setUint32(0, 123, true);
		shortDv.setInt8(4, 100);
		shortDv.setInt8(5, 101);
		shortDv.setInt8(6, 102);
		shortDv.setInt8(7, 103);
		shortDv.setInt8(8, 104);
	
		expect(parse(
			`
				Main {
					uint32 foo;

					// __LEFT__ is the number of bytes remaining until the end of the buffer.
					uint8 theRest[__LEFT__];
				};
			`,
			shortDv
		)).toBe(nice(`
			Main {
				uint32 foo = 123;
				uint8 theRest[5] = [
					100,
					101,
					102,
					103,
					104
				];
			};
		`));
	});
	test(`__SIZE__`, () => {
		const shortDv = new DataView(dv.buffer, 0, 3);
		shortDv.setInt8(0, 100);
		shortDv.setInt8(1, 101);
		shortDv.setInt8(2, 102);
	
		expect(parse(
			`
				Main {
					// __SIZE__ is the total size of the buffer in bytes.
					uint8 everything[__SIZE__];
				};
			`,
			shortDv
		)).toBe(nice(`
			Main {
				uint8 everything[3] = [
					100,
					101,
					102
				];
			};
		`));
	});
});