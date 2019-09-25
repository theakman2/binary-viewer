# Binary Viewer

A NodeJS module to pretty view binary content.

Requires NodeJS 10.3+.

Example usage:

```js
const {FormatStringParser, Validator, BinaryContentFormatter, TextPrinter} = require('binary-viewer');

// A format string describing the binary data.
const formatString = `

Hello {
	u8 x;
	u8 y;
};

Vertex {
	Hello a;
	Hello b;
};

Main {
	u32 count;
	u8 values[count];
	i32 foo;
	Vertex data[2];
	f32 myfloat;
};

root = Main;

`;

// Parse the format string into an AST. Syntactic validation is performed here.
const formatStringAst = new FormatStringParser(formatString).parse();

// Perform semantic validation (e.g. do referenced structs all exist?). Throws on error.
new Validator(formatStringAst).validate();

// Create a binary blob. In a real application this might e.g. be obtained from an API.
const ab = new ArrayBuffer(64);
const dataView = new DataView(ab);
dataView.setUint32(0, 8, true);
dataView.setUint8(4, 10, true);
dataView.setUint8(5, 20, true);
dataView.setUint8(6, 30, true);
dataView.setUint8(7, 40, true);
dataView.setUint8(8, 50, true);
dataView.setUint8(9, 60, true);
dataView.setUint8(10, 70, true);
dataView.setUint8(11, 80, true);
dataView.setInt32(12, 2, true);
dataView.setUint8(16, 5, true);
dataView.setUint8(17, 15, true);
dataView.setUint8(18, 25, true);
dataView.setUint8(19, 35, true);
dataView.setUint8(20, 6, true);
dataView.setUint8(21, 16, true);
dataView.setUint8(22, 26, true);
dataView.setUint8(23, 36, true);
dataView.setFloat32(24, 7294.33, true);

// Interpret the binary blob using the format AST we parsed earlier.
const binaryContentAst = new BinaryContentFormatter(formatStringAst, dataView).read();

// Return the interpreted binary blob as a nicely indented text string.
const textContent = new TextPrinter(binaryContentAst, {spacer: '    ', assignment: ': '}).print();

/*
`textContent` is a string with the following content:

Main {
    u32 count: 8;
    u8 values[8]: [
        10,
        20,
        30,
        40,
        50,
        60,
        70,
        80
    ];
    i32 foo: 2;
    Vertex data[2]: [
        Vertex {
            Hello a: {
                u8 x: 5;
                u8 y: 15;
            };
            Hello b: {
                u8 x: 25;
                u8 y: 35;
            };
        };
        Vertex {
            Hello a: {
                u8 x: 6;
                u8 y: 16;
            };
            Hello b: {
                u8 x: 26;
                u8 y: 36;
            };
        };
    ];
    f32 myfloat: 7294.330078125;
};

*/
```

## Building

If the pegjs grammar file (`src/main/parser.pegjs`) hasn't been changed, run the following:

	$ npm run build

If the pegjs grammar file has been changed, run the following:

	$ npm run pegjs
	$ npm run build

## Tests

Run the unit tests as follows:

	$ npm run test