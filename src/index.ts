import {Parser} from './lib/Parser';
import {Reader} from './lib/Reader';
import {Validator} from './lib/Validator';
import {HtmlPrinter} from './lib/printers/HtmlPrinter';
import {TextPrinter} from './lib/printers/TextPrinter';

export {
	Parser,
	Reader,
	Validator,
	HtmlPrinter,
	TextPrinter,
};

/*
const parser = require('./lib/parser.pegjs');

import Validator from './lib/Validator';
import Reader from './lib/Reader';
import HtmlPrinter from './lib/printers/HtmlPrinter';
import TextPrinter from './lib/printers/TextPrinter';

const str = `

Hello {
	u8 x;
	u8 y;
};

Vertex {
	Hello a;
	Hello b;
};

Thanks {
	norm id;
	u8 totalSize[8];
	u32 vertexCount;
	Vertex vertices[vertexCount];
	f32 finalOne;
	Vertex lol;
};

data = Thanks;

`;

const ret = parser.parse(str);
new Validator(ret).validate();

const ab = new ArrayBuffer(64);
const dataView = new DataView(ab);
dataView.setUint32(0, 1500, true);
dataView.setUint8(4, 10, true);
dataView.setUint8(5, 20, true);
dataView.setUint8(6, 30, true);
dataView.setUint8(7, 40, true);
dataView.setUint8(8, 50, true);
dataView.setUint8(9, 60, true);
dataView.setUint8(10, 70, true);
dataView.setUint8(11, 80, true);
dataView.setUint32(12, 2, true);
dataView.setUint8(16, 5, true);
dataView.setUint8(17, 15, true);
dataView.setUint8(18, 25, true);
dataView.setUint8(19, 35, true);
dataView.setUint8(20, 6, true);
dataView.setUint8(21, 16, true);
dataView.setUint8(22, 26, true);
dataView.setUint8(23, 36, true);
dataView.setFloat32(24, 7294.33, true);

const v = new Reader(ret, dataView).read();

const p = new TextPrinter(v, {spacer: '  ', assignment: ': '}).print();
const hp = new HtmlPrinter(v, {spacer: '  ', assignment: ': '}).print();

document.body.innerHTML += `<pre>${JSON.stringify(v, null, '    ')}</pre>`;
document.body.innerHTML += `<pre>${p}</pre>`;
document.body.innerHTML += hp;
*/
