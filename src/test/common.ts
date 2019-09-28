export function nice(str: string): string {
	const parts = str.split(`\n`);
	const matches = parts[1].match(`^\t+`);
	const indentToRemove = matches ? matches[0].length : 0;
	const r = new RegExp(`^${'\t'.repeat(indentToRemove)}`);
	return str.trim().split(`\n`).map(v => v.replace(r, '')).join('\n') + '\n';
}