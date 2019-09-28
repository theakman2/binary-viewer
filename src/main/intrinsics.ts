export interface IntrinsicDefinition {
	name: string;
	value: (dataView: DataView, currentBitOffset: number) => number;
}

const allowed: ReadonlyArray<IntrinsicDefinition> = [
	{
		name: '__SIZE__',
		value: (dataView) => dataView.byteLength,
	},
	{
		name: '__LEFT__',
		value: (dataView, currentBitOffset) => dataView.byteLength - Math.ceil(currentBitOffset / 8),
	},
];

export { allowed };