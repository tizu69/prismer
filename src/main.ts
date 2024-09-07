// TODO: I use Bun.sleep from time to time here to have the terminal
//       update asap. Should probably replace that with something that
//       still rerenders the term, but doesn't block the thread?

import { cancel, intro, isCancel, outro } from "@clack/prompts";
import { join } from "path";
import color from "picocolors";
import convert from "./convert";
import {
	noPrismerDir,
	searchEdges,
	pickPacks,
	searchPacks,
	assumePlaytime,
} from "./listing";
import type { MCIType } from "./mcitype";
import { noteConfirmPrismization, noteDone } from "./notes";

export const exitel = (message: string) => {
	cancel(message);
	process.exit(1);
};
export type StatusList = { ok: string[]; fail: string[] };

const main = async () => {
	if (process.argv[2] && !process.argv[2].startsWith("."))
		exitel("Argument must be relative path");
	const curdir = process.argv[2]
		? join(process.cwd(), process.argv[2])
		: process.cwd();
	const normalizePath = (path: string) => path.slice(curdir.length + 1);

	console.log();
	intro(color.blue(color.inverse(" prismer ")) + color.dim(" " + curdir));

	let packNames: StatusList = { ok: [], fail: [] };
	let packs: Record<string, MCIType> = {};

	noPrismerDir(curdir);
	await searchPacks(packs, packNames, curdir);
	searchEdges(packNames, normalizePath);

	await assumePlaytime(packs);
	const toConv = await pickPacks(packs);
	if (isCancel(toConv)) exitel("Canceled");
	await noteConfirmPrismization(toConv);

	await convert(packs, toConv, curdir);

	noteDone(curdir);
	outro(
		color.blue(color.inverse(" prismer ")) +
			color.dim(` a tool by ${color.bold("tizu.dev")}`),
	);
};
await main();
