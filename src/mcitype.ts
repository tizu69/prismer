export interface MCIType {
	_playtime: number;

	baseModLoader: BaseModLoader | null;
	isUnlocked: boolean;
	javaArgsOverride: null;
	lastPlayed: Date;
	playedCount: number;
	manifest: Manifest | null;
	fileDate: Date;
	installedModpack: InstalledModpack | null;
	projectID: number;
	fileID: number;
	customAuthor: null;
	modpackOverrides: any[];
	isMemoryOverride: boolean;
	allocatedMemory: number;
	profileImagePath: null | string;
	isVanilla: boolean;
	guid: string;
	gameTypeID: number;
	installPath: string;
	name: string;
	cachedScans: any[];
	isValid: boolean;
	lastPreviousMatchUpdate: Date;
	lastRefreshAttempt: Date;
	isEnabled: boolean;
	gameVersion: string;
	gameVersionFlavor: null;
	gameVersionTypeId: null;
	preferenceAlternateFile: boolean;
	preferenceAutoInstallUpdates: boolean;
	preferenceQuickDeleteLibraries: boolean;
	preferenceDeleteSavedVariables: boolean;
	preferenceReleaseType: number;
	preferenceModdingFolderPath: null;
	syncProfile: SyncProfile;
	installDate: Date;
	installedAddons: InstalledAddon[];
	installedGamePrerequisites?: any[];
	wasNameManuallyChanged: boolean;
	wasGameVersionTypeIdManuallyChanged: boolean;
	preferenceProcessFileCommands?: boolean;
}

export interface BaseModLoader {
	forgeVersion: string;
	name: string;
	type: number;
	downloadUrl: string;
	filename: string;
	installMethod: number;
	latest: boolean;
	recommended: boolean;
	versionJson: string;
	librariesInstallLocation: string;
	minecraftVersion: MinecraftVersion;
	installProfileJson?: string;
}

export enum MinecraftVersion {
	Client = "Client",
	Empty = "",
	Fabric = "Fabric",
	Forge = "Forge",
	NeoForge = "NeoForge",
	Quilt = "Quilt",
	Server = "Server",
	The114 = "1.14",
	The1141 = "1.14.1",
	The1142 = "1.14.2",
	The1143 = "1.14.3",
	The1144 = "1.14.4",
	The114Snapshot = "1.14-Snapshot",
	The115 = "1.15",
	The1151 = "1.15.1",
	The1152 = "1.15.2",
	The115Snapshot = "1.15-Snapshot",
	The116 = "1.16",
	The1161 = "1.16.1",
	The1162 = "1.16.2",
	The1163 = "1.16.3",
	The1164 = "1.16.4",
	The1165 = "1.16.5",
	The116Snapshot = "1.16-Snapshot",
	The119 = "1.19",
	The1202 = "1.20.2",
	The1203 = "1.20.3",
	The1203Snapshot = "1.20.3-Snapshot",
	The1204 = "1.20.4",
}

export interface InstalledAddon {
	instanceID: string;
	modSource: number;
	addonID: number;
	gameID: number;
	categoryClassID: number;
	gameInstanceID: string;
	name: string;
	modFolderPath: null;
	fileNameOnDisk: string;
	authors: InstalledAddonAuthor[];
	primaryAuthor: string;
	primaryCategoryId: number;
	packageType: number;
	webSiteURL: string;
	thumbnailUrl: string;
	tags: any[];
	installedFile: File;
	dateInstalled: Date;
	dateUpdated: Date;
	status: number;
	installSource: number;
	preferenceReleaseType: null;
	preferenceAutoInstallUpdates: null;
	preferenceAlternateFile: boolean;
	preferenceIsIgnored: boolean;
	isModified: boolean;
	isWorkingCopy: boolean;
	isFuzzyMatch: boolean;
	manifestName: null;
	installedTargets: any[];
	latestFile: File;
}

export interface InstalledAddonAuthor {
	Id?: number;
	Name: string;
}

export interface File {
	id: number;
	fileName: string;
	fileDate: Date;
	fileLength: number;
	releaseType: number;
	fileStatus: number;
	downloadUrl: string;
	isAlternate: boolean;
	alternateFileId: number;
	dependencies: Dependency[];
	isAvailable: boolean;
	modules: Module[];
	packageFingerprint: number;
	gameVersion: MinecraftVersion[];
	sortableGameVersion: SortableGameVersion[];
	hasInstallScript: boolean;
	isCompatibleWithClient: boolean;
	isEarlyAccessContent: boolean;
	restrictProjectFileAccess: number;
	projectStatus: number;
	projectId: number;
	fileNameOnDisk: string;
	hashes: Hash[];
}

export interface Dependency {
	addonId: number;
	type: number;
}

export interface Hash {
	type: number;
	value: string;
}

export interface Module {
	foldername: string;
	fingerprint: number;
	invalidFingerprint: boolean;
}

export interface SortableGameVersion {
	gameVersion: MinecraftVersion;
	gameVersionName: MinecraftVersion;
	gameVersionTypeId: number;
}

export interface InstalledModpack {
	instanceID: string;
	modSource: number;
	addonID: number;
	gameID: number;
	categoryClassID: number;
	gameInstanceID: string;
	name: string;
	modFolderPath: null;
	fileNameOnDisk: string;
	authors: InstalledModpackAuthor[];
	primaryAuthor: string;
	primaryCategoryId: number;
	packageType: number;
	webSiteURL: string;
	thumbnailUrl: string;
	tags: any[];
	installedFile: File;
	dateInstalled: Date;
	dateUpdated: Date;
	status: number;
	installSource: number;
	preferenceReleaseType: null;
	preferenceAutoInstallUpdates: null;
	preferenceAlternateFile: boolean;
	preferenceIsIgnored: boolean;
	isModified: boolean;
	isWorkingCopy: boolean;
	isFuzzyMatch: boolean;
	manifestName: null;
	installedTargets: any[];
	latestFile: File;
}

export interface InstalledModpackAuthor {
	Name: string;
}

export interface Manifest {
	minecraft: Minecraft;
	manifestType: string;
	manifestVersion: number;
	name: string;
	version: string;
	author: string;
	description: null;
	projectID: null;
	files: FileElement[];
	overrides: string;
}

export interface FileElement {
	projectID: number;
	fileID: number;
	required: boolean;
}

export interface Minecraft {
	version: MinecraftVersion;
	additionalJavaArgs: null;
	modLoaders: ModLoader[];
	libraries: null;
}

export interface ModLoader {
	id: string;
	primary: boolean;
}

export interface SyncProfile {
	PreferenceEnabled: boolean;
	PreferenceAutoSync: boolean;
	PreferenceAutoDelete: boolean;
	PreferenceBackupSavedVariables: boolean;
	GameInstanceGuid: string;
	SyncProfileID: number;
	SavedVariablesProfile: null;
	LastSyncDate: Date;
}
