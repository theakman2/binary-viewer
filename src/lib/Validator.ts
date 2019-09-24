import { Rules } from "./Rules";

export class Validator {
	private _input: Rules;
	
	constructor(input: Rules) {
		this._input = input;
	}

	public validate() {
		const structsByName = Object.create(null);
		for (const struct of this._input.structs) {
			if (structsByName[struct.identifier]) {
				throw new Error(`Struct '${struct.identifier}' already defined.`);
			}
			const t = {
				orig: struct,
				identifiers: Object.create(null),
				types: Object.create(null),
			};
			structsByName[struct.identifier] = t;
			for (const field of struct.stmts) {
				if (t.identifiers[field.identifier]) {
					throw new Error(`Identifier '${field.identifier}' already used in struct '${struct.identifier}'.`);
				}
				if (field.type == "ArraySimpleVarStatement" || field.type == "ArrayStructVarStatement") {
					if (typeof field.count === "string") {
						if (!t.identifiers[field.count]) {
							throw new Error(`Field identifier '${field.count}' not found in struct '${struct.identifier}'.`);
						}
						if (t.identifiers[field.count].type !== "SimpleVarStatement") {
							throw new Error(`Field identifier '${field.count}' must be a non-array field in struct '${struct.identifier}'.`);
						}
					}
					if ((typeof field.count === "number") && (field.count <= 0)) {
						throw new Error(`Array count for field '${field.identifier}' must be greater than 0 in struct '${struct.identifier}'.`);
					}
				}
				if (field.kind.match(/^[A-Z]/) && !structsByName[field.kind]) {
					throw new Error(`Field type '${field.kind}' not found in struct '${struct.identifier}'.`);
				}
				t.identifiers[field.identifier] = field;
				t.types[field.kind] = field;
			}
		}
		if (!structsByName[this._input.data]) {
			throw new Error(`Struct '${this._input.data}' not found.`);
		}
	}
};
