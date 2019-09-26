export interface IntrinsicDefinition {
	name: string;
	value: (dataView: DataView, currentOffset: number) => number;
}

const allowed: ReadonlyArray<IntrinsicDefinition> = [
	{
		name: '__SIZE__',
		value: (dataView) => dataView.byteLength,
	},
	{
		name: '__LEFT__',
		value: (dataView, currentOffset) => dataView.byteLength - currentOffset,
	},
];

export { allowed };