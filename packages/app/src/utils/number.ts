export const truncateNumbers = (value: number, maxDecimalDigits: number) => {
	if (value.toString().includes('.')) {
		const parts = value.toString().split('.')
		return parts[0] + '.' + parts[1].slice(0, maxDecimalDigits)
	}
	return value.toString()
}