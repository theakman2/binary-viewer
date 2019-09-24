start = ws s:StructStatement* ws d:DataStatement ws {
	return {
		structs: s,
		data: d,
	};
}

ws "whitespace" = [ \t\n\r]*

Struct = ident:StructIdentifier ws "{" ws stmts:FieldStatement+ ws "}" {
	return {
		type: 'Struct',
		identifier: ident,
		stmts: stmts,
	};
}

StructIdentifier = ident:([A-Z][a-zA-Z0-9_]*) { return ident[0] + ident[1].join(''); }

Identifier = ident:([a-zA-Z][a-zA-Z0-9_]*) { return ident[0] + ident[1].join(''); }

SimpleVarStatement = ti:DataType ws i:Identifier ws ";" ws {
	return {
		type: 'SimpleVarStatement',
		kind: ti,
		identifier: i,
	};
}

StructVarStatement = ti:StructIdentifier ws i:Identifier ws ";" ws {
	return {
		type: 'StructVarStatement',
		kind: ti,
		identifier: i,
	};
}

ArraySimpleVarStatement = t:DataType ws i:Identifier ws "[" ws v:(Integer/Identifier) ws "]" ws ";" ws {
	return {
		type: 'ArraySimpleVarStatement',
		kind: t,
		identifier: i,
		count: v,
	};
}

ArrayStructVarStatement = t:StructIdentifier ws i:Identifier ws "[" ws v:(Integer/Identifier) ws "]" ws ";" ws {
	return {
		type: 'ArrayStructVarStatement',
		kind: t,
		identifier: i,
		count: v,
	};
}

StructStatement = t:Struct ws ";" ws {
	return t;
}

DataStatement = "data" ws "=" ws i:Identifier ws ";" ws {
	return i;
}

Integer = v:[0-9]+ {
	return parseInt(v, 10);
}

FieldStatement = SimpleVarStatement / StructVarStatement / ArraySimpleVarStatement / ArrayStructVarStatement

Statement = FieldStatement / StructStatement / DataStatement

DataType = "u8" / "u16" / "u32" / "i8" / "i16" / "i32" / "f32" / "f64" / "norm"
