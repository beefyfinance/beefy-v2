type BuildVersion = {
  /** git commit hash of build */
  git?: string;
  /** unix timestamp of build */
  timestamp: number;
  /** manifest content hash of build */
  content: string;
};

type HandleNewVersionFn = (
  currentVersion: BuildVersion,
  newVersion: BuildVersion,
  reloadFailed: boolean,
  newVersionMessage: string
) => Promise<boolean>;

type WindowType = Window & {
  __beefyHandleNewVersion?: HandleNewVersionFn;
};

(function (localVersion: BuildVersion) {
  const handleNewVersionFallback: HandleNewVersionFn = async (
    _currentVersion: BuildVersion,
    newVersion: BuildVersion,
    reloadFailed: boolean,
    newVersionMessage: string
  ) => {
    console.info(newVersionMessage);
    if (reloadFailed) {
      alert(
        `Your browser failed to fetch the latest version when reloading. Please clear your cache and try again.`
      );
      return false;
    }

    if (confirm(`${newVersionMessage}\n\nReload to update?`)) {
      const url = new URL(window.location.href);
      url.searchParams.set('update', newVersion.timestamp.toString());
      window.location.href = url.toString();
      return true;
    }

    console.warn(`User declined to reload.`);
    return false;
  };
  const waitForHandler = (() => {
    let timeWaited = 0;
    return async () => {
      const typedWindow = window as WindowType;
      while (!typedWindow.__beefyHandleNewVersion && ++timeWaited < 10) {
        await new Promise(resolve => setTimeout(resolve, 1_000));
      }
      return typedWindow.__beefyHandleNewVersion || handleNewVersionFallback;
    };
  })();
  const handleNewVersion = async (newVersion: BuildVersion) => {
    const currentDate = new Date(localVersion.timestamp * 1000).toLocaleString();
    const newDate = new Date(newVersion.timestamp * 1000).toLocaleString();
    const newVersionMessage = `A new version of the app is available.\n\nYou have version ${
      localVersion.git || localVersion.content
    } from ${currentDate}.\nThe latest version is ${
      newVersion.git || newVersion.content
    } from ${newDate}.`;
    console.info(newVersionMessage);

    const query = new URLSearchParams(window.location.search);
    const reloadFailed = query.get('update') === newVersion.timestamp.toString();

    const handler = await waitForHandler();
    return await handler(localVersion, newVersion, reloadFailed, newVersionMessage);
  };
  const checkForUpdate = async () => {
    try {
      const response = await fetch(`/version.json`, { cache: 'no-store' });
      const latestVersion = (await response.json()) as BuildVersion;
      const isNewer = latestVersion.timestamp > localVersion.timestamp;
      const isContentDifferent = latestVersion.content !== localVersion.content;
      const isGitDifferent =
        localVersion.git !== undefined &&
        latestVersion.git !== undefined &&
        latestVersion.git !== localVersion.git;
      const isDifferent = isContentDifferent || isGitDifferent;
      if (isNewer && isDifferent) {
        return await handleNewVersion(latestVersion);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
    return true;
  };
  const tryCheckForUpdate = () => {
    checkForUpdate()
      .then(continueMonitoring => {
        if (continueMonitoring) {
          scheduleCheckForUpdate();
        }
      })
      .catch(e => {
        console.error(e);
        scheduleCheckForUpdate();
      });
  };
  const scheduleCheckForUpdate = () => {
    setTimeout(tryCheckForUpdate, 1000 * 60);
  };

  setTimeout(tryCheckForUpdate, 1000 * 5);
})(JSON.parse('$$VERSION_PLACEHOLDER$$'));
