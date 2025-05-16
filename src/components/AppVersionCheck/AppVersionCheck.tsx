import { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BuildVersion } from '../../features/data/reducers/ui-version-types.ts';
import { setUpdateAvailable } from '../../features/data/reducers/ui-version.ts';
import { selectAppVersionInfo } from '../../features/data/selectors/version.ts';
import { featureFlag_simUpdate } from '../../features/data/utils/feature-flags.ts';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { Button } from '../Button/Button.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

declare global {
  interface Window {
    __beefyHandleNewVersion?: (
      currentVersion: BuildVersion,
      newVersion: BuildVersion,
      reloadFailed: boolean,
      newVersionMessage: string
    ) => Promise<boolean>;
  }
}

export const AppVersionCheck = memo(function AppVersionCheck() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const app = useAppSelector(selectAppVersionInfo);
  const message = useMemo(() => {
    if (app.updateAvailable) {
      const key = app.reloadFailed ? 'Update-Available-Failed' : 'Update-Available';
      return t(key, {
        currentDate: new Date(app.currentVersion.timestamp).toLocaleString(),
        currentVersion: app.currentVersion.git || app.currentVersion.content,
        newDate: new Date(app.newVersion.timestamp).toLocaleString(),
        newVersion: app.newVersion.git || app.newVersion.content,
      });
    }
    return undefined;
  }, [t, app]);
  const handleReload = useCallback(() => {
    if (app.updateAvailable) {
      const url = new URL(window.location.href);
      url.searchParams.set('update', app.newVersion.timestamp.toString());
      window.location.href = url.toString();
    } else {
      window.location.reload();
    }
  }, [app]);

  useEffect(() => {
    if (window) {
      window.__beefyHandleNewVersion = async (
        currentVersion: BuildVersion,
        newVersion: BuildVersion,
        reloadFailed: boolean
      ) => {
        dispatch(setUpdateAvailable({ currentVersion, newVersion, reloadFailed }));
        return true;
      };

      if (featureFlag_simUpdate()) {
        const query = new URLSearchParams(window.location.search);
        dispatch(
          setUpdateAvailable({
            currentVersion: {
              content: '2b9ed1eb45c03272e67691eb5f69ef6d',
              timestamp: 1717012504,
              git: 'f55adb5319d150c07017f7480e8d388e530f92e2',
            },
            newVersion: {
              content: '2b9ed1eb45c03272e67691eb5f69ef6f',
              timestamp: 1717512504,
              git: 'f55adb5319d150c07017f7480e8d388e530f92e3',
            },
            reloadFailed: query.get('update') === '1717512504',
          })
        );
      }
    }
  }, [dispatch]);

  if (!app.updateAvailable) {
    return null;
  }

  return (
    <div className={classes.positioner}>
      <div className={classes.alert}>
        <div className={classes.message}>{message}</div>
        {!app.reloadFailed ?
          <div className={classes.action}>
            <Button onClick={handleReload} size={'sm'} variant={'success'} css={styles.button}>
              {t('Update-Reload')}
            </Button>
          </div>
        : null}
      </div>
    </div>
  );
});
