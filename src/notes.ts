import { note, isCancel, confirm } from "@clack/prompts";
import dedent from "dedent";
import { exitel } from "./main";
import color from "picocolors";
import { join } from "path";

export const noteConfirmPrismization = async (toConv: string[]) => {
	note(
		dedent`
			Prismer is provided "as is," with no warranties of any kind.
			I am not liable for any damage that may occur to your CF or
			Prism packs as a result of using this utility. By proceeding,
			you accept full responsibility for any potential issues or
			consequences arising from its use. If you do not agree to
			these terms, please select "No." Got it? Very neat. :3
		`,
		"Beware!",
	);

	const ok = await confirm({
		message: `Yo, ready to convert ${color.blue(toConv.length)} packs?`,
	});
	if (isCancel(ok) || !ok) exitel("Canceled");
};

export const noteDone = (curdir: string) =>
	note(
		dedent`
			Very neat! Your packs should be migrated now.
			However, there's still some setup. Point Prism for
			- instances towards ${join(curdir, "../Prismer")}
			- icons towards ${join(curdir, "../Prismer/_icons")}
		`,
		"Next steps",
	);

export const notePlaytime = () =>
	note(
		dedent`
			Unlike Prism, CurseForge App does not store playtime.
			However, it stores how often you started the pack, so
			we can assume playtime based on how long you usually
			play per session. You can use 0 if you wish to opt out.
		`,
		"Assuming playtime",
	);
