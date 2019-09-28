start = ignorable s:StructStatement* d:RootStatement? {
	return {
		structs: s,
		root: d || "Main",
	};
}

multi_line_comment = "/*" (!"*/" .)* "*/"

single_line_comment = '//' [^\n]*

ignorable = (single_line_comment / multi_line_comment / [ \t\n\r])*

Struct = ident:StructIdentifier ignorable "{" ignorable stmts:FieldStatement+ ignorable "}" {
	return {
		type: 'Struct',
		identifier: ident,
		stmts: stmts,
	};
}

IntDataTypeShape = v:[sun] {
	switch (v) {
		case 's': return 'signed';
		case 'u': return 'unsigned';
		case 'n': return 'normal';
	}
}

IntDataTypeSize = v:([1-9][0-9]*) { return parseInt(v[0] + v[1].join(), 10); }

IntDataTypeMax = "int" / "norm"

IntDataType = s:IntDataTypeShape? m:IntDataTypeMax z:IntDataTypeSize {
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

FixedLengthStringDataType = 'string' ignorable '(' ignorable v:([0-9]+) ignorable ')' {
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

SinglePrimitiveVarStatement = ti:PrimitiveDataType ignorable i:Identifier ignorable ";" ignorable {
	return {
		type: 'SinglePrimitiveVarStatement',
		dataType: ti,
		identifier: i,
	};
}

SingleStructVarStatement = ti:StructIdentifier ignorable i:Identifier ignorable ";" ignorable {
	return {
		type: 'SingleStructVarStatement',
		dataType: ti,
		identifier: i,
	};
}

ArrayPrimitiveVarStatement = t:PrimitiveDataType ignorable i:Identifier ignorable "[" ignorable v:(Integer/Identifier/Intrinsic) ignorable "]" ignorable ";" ignorable {
	return {
		type: 'ArrayPrimitiveVarStatement',
		dataType: t,
		identifier: i,
		count: v,
	};
}

ArrayStructVarStatement = t:StructIdentifier ignorable i:Identifier ignorable "[" ignorable v:(Integer/Identifier/Intrinsic) ignorable "]" ignorable ";" ignorable {
	return {
		type: 'ArrayStructVarStatement',
		dataType: t,
		identifier: i,
		count: v,
	};
}

StructStatement = t:Struct ignorable ";" ignorable {
	return t;
}

RootStatement = "root" ignorable "=" ignorable i:Identifier ignorable ";" ignorable {
	return i;
}

Integer = v:[0-9]+ {
	return parseInt(v, 10);
}

FieldStatement = SinglePrimitiveVarStatement / SingleStructVarStatement / ArrayPrimitiveVarStatement / ArrayStructVarStatement
