import { spinner } from "@clack/prompts";
import { $ } from "bun";
import dedent from "dedent";
import { createWriteStream } from "fs";
import { join } from "path";
import pLimit from "p-limit";
import fs from "fs/promises";
import type { MCIType } from "./mcitype";
import { formatMillis } from "./millis";

export default async (
	packs: Record<string, MCIType>,
	toConv: string[],
	curdir: string,
) => {
	const s = spinner();
	s.start("Preparing to convert");

	let count = 0;
	const convPacks = Object.entries(packs).filter(([n]) => toConv.includes(n));
	const totalTasks = convPacks.length;
	const startTime = Date.now();

	const ipath = join(curdir, "../Prismer/_icons");
	await $`mkdir -p ${ipath}`;

	const running: Record<string, true> = {};
	let percentage: number, est: number;
	const updateRunning = (as: string) => {
		if (running[as]) delete running[as];
		else running[as] = true;
		const completedTasks = count;
		percentage = Math.round((completedTasks / totalTasks) * 100);
		const elapsedTime = (Date.now() - startTime) / 1000;
		const taskTime = elapsedTime / (completedTasks || 1);
		const remainingTasks = totalTasks - completedTasks;
		est = Math.round(remainingTasks * taskTime);

		/* s.message(
			`[${percentage}%, ${percentage != 0 ? formatMillis(est * 1000) : "∞"}] ` +
				Object.keys(running).join(", "),
		); */
	};

	const limit = pLimit(1); // TODO: running multiple IO operations at once can actually slow this down :(
	const tasks = convPacks.map(([name, data]) =>
		limit(async () => {
			updateRunning(name);

			try {
				// TODO: remove
				const now = async (rn: string) => {
					s.message(
						`[${percentage}%, ${percentage != 0 ? formatMillis(est * 1000) : "∞"}] "${name}": ${rn}`,
					);
					await Bun.sleep(1);
				};

				const path = join(curdir, "../Prismer", name);
				const mcpath = join(path, ".minecraft");
				const cfpath = join(curdir, name);
				const p = (to: string) => join(mcpath, to);
				const ip = (to: string) => join(path, to);

				await stepCopy(now, path, cfpath, mcpath);
				const iconName = await stepModpackIcon(
					now,
					data,
					mcpath,
					ipath,
				);
				await stepDeleteCurseFiles(now, p);
				await stepCreateInstanceMetadata(now, iconName, data, ip);
				await stepBuildModIndex(now, data, mcpath);

				await Bun.sleep(1);
			} catch (e) {
				// @ts-expect-error
				console.error(e.stack ?? e);
			}

			updateRunning(name);
			count++;
		}),
	);
	await Promise.all(tasks);

	s.stop(
		`Converted all in ${formatMillis(Date.now() - startTime)} (${(Date.now() - startTime) / 1000}s)`,
	);
};

const stepCopy = async (
	now: (happening: string) => Promise<void>,
	path: string,
	cfpath: string,
	mcpath: string,
) => {
	await now("Creating directory");
	await $`mkdir -p ${path}`;

	/* TODO: streaming - await now("Copying: [?]");
    for await (let l of $`cp -rv ${cfpath + "/."} ${mcpath}`.lines())
        await now(`Copying: ${l.replace(/'.*?([^/]+)' ->.+/, "$1")}`); */
	await now("Copying files");
	await $`cp -r ${cfpath} ${mcpath}`;

	await now("Creating mod directory");
	await $`mkdir -p ${join(path, ".minecraft", "mods", ".index")}`;
};

const stepModpackIcon = async (
	now: (happening: string) => Promise<void>,
	data: MCIType,
	mcpath: string,
	ipath: string,
) => {
	await now("Building icon library");
	let iconName = "";
	if (data.profileImagePath) {
		iconName = `prismer_${data.profileImagePath.match(/profileImage.(.*)\..{3,4}/)![1]}`;
		await $`cp ${join(
			mcpath,
			"profileImage",
			data.profileImagePath.match(/profileImage.(.*)/)![1],
		)} ${join(ipath, iconName)}`;
	} else if (data.installedModpack)
		try {
			const response = await fetch(data.installedModpack.thumbnailUrl);
			if (!response.ok) throw new Error(response.statusText);

			iconName = `prismer_cf_${data.installedModpack.addonID}`;
			const fileStream = createWriteStream(join(ipath, iconName));

			const reader = response.body?.getReader();
			if (reader) {
				const pump = async (): Promise<void> => {
					const { done, value } = await reader.read();
					if (done) {
						fileStream.end();
						return;
					}
					fileStream.write(value);
					await pump();
				};
				await pump();
			} else {
				throw new Error("oop");
			}
		} catch {}
	return iconName;
};

const stepDeleteCurseFiles = async (
	now: (happening: string) => Promise<void>,
	p: (to: string) => string,
) => {
	await now("Deleting files no one asked for");
	await $`rm -rf ${p(".curseclient")} ${p("manifest.json")} ${p("minecraftinstance.json")} ${p("modlist.html")}`;
};

const stepCreateInstanceMetadata = async (
	now: (happening: string) => Promise<void>,
	iconName: string,
	data: MCIType,
	ip: (to: string) => string,
) => {
	await now("Creating instance files");
	await $`echo ${dedent`
			[General]
			ConfigVersion=1.2
			InstanceType=OneSix
			iconKey=${iconName ?? "default"}
			notes=Converted by Prismer @ ${Date.now().toLocaleString()}
			name=${data.name}
			lastLaunchTime=0
			lastTimePlayed=${Math.round(data._playtime / data.playedCount)}
			totalTimePlayed=${data._playtime}
			${
				data.installedModpack
					? dedent`
						ManagedPack=true
						ManagedPackID=${data.installedModpack.addonID}
						ManagedPackName=${data.installedModpack.name}
						ManagedPackType=flame
						ManagedPackVersionID=${data.installedModpack.installedFile.id}
						ManagedPackVersionName=Prismer Migrated (you can update the pack just fine)`
					: ""
			}
		`} > ${ip("instance.cfg")}`;
	await $`echo ${JSON.stringify(
		{
			components: [
				{
					important: true,
					uid: "net.minecraft",
					version: data.gameVersion,
				},
				data.baseModLoader && {
					uid: {
						1: "net.minecraftforge",
						4: "net.fabricmc.fabric-loader",
						5: "org.quiltmc.quilt-loader",
						6: "net.neoforged",
					}[data.baseModLoader.type],
					version: data.baseModLoader.forgeVersion,
				},
			].filter((c) => !!c),
			formatVersion: 1,
		},
		null,
		4,
	)} > ${ip("mmc-pack.json")}`;
};

const stepBuildModIndex = async (
	now: (happening: string) => Promise<void>,
	data: MCIType,
	mcpath: string,
) => {
	await now("Creating mod index: [?]");
	for await (const mod of data.installedAddons) {
		await now(`Creating mod index: ${mod.name}`);
		await $`echo ${dedent`
				filename = '${mod.installedFile.fileNameOnDisk}'
				name = '${mod.name}'
				side = 'both'

				[download]
				hash = '${mod.installedFile.hashes?.[0]?.value ?? "?"}'
				hash-format = 'sha1'
				mode = 'metadata:curseforge'
				url = '${mod.installedFile.downloadUrl}'

				[update.curseforge]
				file-id = ${mod.installedFile.id}
				project-id = ${mod.installedFile.projectId}
			`} > ${join(mcpath, "mods/.index", `${mod.installedFile.projectId}.pw.toml`)}`;
	}
};
