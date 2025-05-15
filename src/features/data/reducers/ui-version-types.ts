export type BuildVersion = {
  /** git commit hash of build */
  git?: string;
  /** unix timestamp of build */
  timestamp: number;
  /** manifest content hash of build */
  content: string;
};
export type NewVersionAvailable = {
  currentVersion: BuildVersion;
  newVersion: BuildVersion;
  reloadFailed: boolean;
};
export type VersionState =
  | {
      updateAvailable: false;
    }
  | ({
      updateAvailable: true;
    } & NewVersionAvailable);
