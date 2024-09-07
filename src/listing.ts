import { isCancel, note, spinner } from "@clack/prompts";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import color from "picocolors";
import { exitel, type StatusList } from "./main";
import type { MCIType } from "./mcitype";
import { multiselect, text } from "./prompts";
import { accessSync } from "fs";
import { notePlaytime } from "./notes";
import { parseMillis, formatMillis } from "./millis";

export const searchPacks = async (
	packs: Record<string, MCIType>,
	packNames: StatusList,
	curdir: string,
) => {
	const s = spinner();
	s.start("Looking for packs");

	const cfjson = "minecraftinstance.json";
	for await (const pack of readdirSync(curdir, { withFileTypes: true })) {
		if (!pack.isDirectory()) continue;

		const itemPath = join(curdir, pack.name);
		try {
			const fileBuf = readFileSync(join(itemPath, cfjson));
			packs[pack.name] = JSON.parse(fileBuf.toString());
			packNames.ok.push(itemPath);
		} catch {
			packNames.fail.push(itemPath);
		}

		await Bun.sleep(1);
	}

	s.stop("Successfully found " + packNames.ok.length + " packs");
};

export const assumePlaytime = async (packs: Record<string, MCIType>) => {
	notePlaytime();

	const paytime = (await text({
		message: "How long do you usually play per session?",
		defaultValue: "0",
		initialValue: "1.5 h",
		validate(value) {
			try {
				const millis = parseMillis(value);
				if (Number.isNaN(millis)) throw new Error("nan :3");
			} catch {
				return "Cannot parse time span";
			}
		},
		hint(value) {
			try {
				const seconds = parseMillis(value) / 1000;
				const rounded = Math.round(seconds);

				if (seconds != rounded) return "rounded to " + rounded + "s";
				return rounded + "s";
			} catch {}
		},
	})) as string;
	if (isCancel(paytime)) exitel("Canceled");

	Object.entries(packs).forEach(
		([_, data]) =>
			(data._playtime =
				Math.round(parseMillis(paytime) / 1000) * data.playedCount),
	);
};

export const pickPacks = async (packs: Record<string, MCIType>) =>
	(await multiselect({
		message: `Which packs would you like to convert? ${color.dim(
			`Press ${color.gray(color.bgWhite(color.inverse(" space ")))} to select, ` +
				`${color.gray(color.bgWhite(color.inverse(" enter ")))} to submit`,
		)}`,
		maxItems: 7,
		initialValues: Object.keys(packs), // [Object.keys(packs)[1]],
		options: Object.entries(packs).map(([name, data]) => ({
			value: name,
			label: data.name,
			hint: `${formatMillis(data._playtime * 1000)} played, ${data.playedCount} times) (${data.gameVersion}, ${data.baseModLoader?.name ?? "Vanilla"}) ("${name}"`,
		})),
		required: false,
	})) as string[];

export const searchEdges = (
	packNames: StatusList,
	normalizePath: (path: string) => string,
) => {
	if (packNames.fail.length > 0)
		note(
			packNames.fail.map(normalizePath).join(", "),
			"Failed to read these packs",
		);
	if (packNames.ok.length < 1)
		exitel(
			"No readable packs found in current working directory. " +
				(process.argv[2]
					? "Did you specify the Instances directory?"
					: "Did you forget to supply a path as an argument?"),
		);
};

export const noPrismerDir = (curdir: string) => {
	try {
		accessSync(join(curdir, "../Prismer"));
		exitel(
			"Please remove the directory that Prismer generated last time. " +
				"Note that unsaved progress will be lost in those packs!",
		);
	} catch {}
};
