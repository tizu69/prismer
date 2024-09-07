export const truncateString = (str: string, num: number) =>
	str.length <= num ? str : str.slice(0, num) + "...";
