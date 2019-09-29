start = Ignorable s:StructStatement* d:RootStatement? {
	return {
		structs: s,
		root: d || "Main",
	};
}

MultiLineComment = "/*" (!"*/" .)* "*/"

SingleLineComment = '//' [^\n]*

Ignorable = (SingleLineComment / MultiLineComment / [ \t\n\r])*

Attr = "@" i:Identifier Ignorable {
	return i;
}

Struct = a:Attr* ident:StructIdentifier Ignorable "{" Ignorable stmts:FieldStatement+ Ignorable "}" {
	return {
		type: 'Struct',
		identifier: ident,
		stmts: stmts,
		attributes: a,
	};
}

IntDataTypeShape = v:[sun] {
	switch (v) {
		case 's': return 'signed';
		case 'u': return 'unsigned';
		case 'n': return 'normal';
	}
}

IntDataTypeMaxScale = v:Integer "scale" { return v; }

IntDataTypeMax = "int" / "norm" / IntDataTypeMaxScale

IntDataType = s:IntDataTypeShape? m:IntDataTypeMax z:Integer {
	return {
		type: 'IntDataType',
		shape: s || 'signed',
		max: m,
		size: z,
	};
}

FloatDataType = v:('float' / 'double') {
	return {
		type: 'FloatDataType',
		size: (v === 'float') ? 32 : 64,
	};
}

FixedLengthStringDataType = 'string' Ignorable '(' Ignorable v:([0-9]+) Ignorable ')' {
	return {
		type: 'FixedLengthStringDataType',
		size: parseInt(v, 10),
	};
}

VariableLengthStringDataType = 'string' {
	return {
		type: 'VariableLengthStringDataType',
	};
}

PrimitiveDataType = IntDataType / FloatDataType / FixedLengthStringDataType / VariableLengthStringDataType

StructIdentifier = ident:([A-Z][a-zA-Z0-9_]*) { return ident[0] + ident[1].join(''); }

Identifier = ident:([a-zA-Z][a-zA-Z0-9_]*) { return ident[0] + ident[1].join(''); }

Intrinsic = v:("__" [A-Z0-9]+ "__") { return v[0] + v[1].join('') + v[2]; }

SinglePrimitiveVarStatement = ti:PrimitiveDataType Ignorable i:Identifier Ignorable ";" Ignorable {
	return {
		type: 'SinglePrimitiveVarStatement',
		dataType: ti,
		identifier: i,
	};
}

SingleStructVarStatement = ti:StructIdentifier Ignorable i:Identifier Ignorable ";" Ignorable {
	return {
		type: 'SingleStructVarStatement',
		dataType: ti,
		identifier: i,
	};
}

ArrayPrimitiveVarStatement = t:PrimitiveDataType Ignorable i:Identifier Ignorable "[" Ignorable v:(Integer/Identifier/Intrinsic) Ignorable "]" Ignorable ";" Ignorable {
	return {
		type: 'ArrayPrimitiveVarStatement',
		dataType: t,
		identifier: i,
		count: v,
	};
}

ArrayStructVarStatement = t:StructIdentifier Ignorable i:Identifier Ignorable "[" Ignorable v:(Integer/Identifier/Intrinsic) Ignorable "]" Ignorable ";" Ignorable {
	return {
		type: 'ArrayStructVarStatement',
		dataType: t,
		identifier: i,
		count: v,
	};
}

StructStatement = t:Struct Ignorable ";" Ignorable {
	return t;
}

RootStatement = "root" Ignorable "=" Ignorable i:Identifier Ignorable ";" Ignorable {
	return i;
}

Integer = v:([0-9]+) {
	return parseInt(v.join(''), 10);
}

FieldStatement = a:Attr* f:(SinglePrimitiveVarStatement / SingleStructVarStatement / ArrayPrimitiveVarStatement / ArrayStructVarStatement) {
	return {...f, attributes: a};
}
