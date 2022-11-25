import React, { memo, useCallback } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Clear } from '@material-ui/icons';
import { selectUserDepositedVaultIdsForAsset } from '../../features/data/selectors/balance';
import { useAppSelector } from '../../store';
import { AssetsImage } from '../AssetsImage';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultEntity } from '../../features/data/entities/vault';
import { useLocalStorageBoolean } from '../../helpers/useLocalStorageBoolean';

const useStyles = makeStyles(styles);

const RenBanner = memo(function RenBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideRenBanner', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.box}>
          <div className={classes.content}>
            <AssetsImage chainId={'polygon'} assetIds={['renBTC']} className={classes.icon} />
            <div>
              RenProject has advised users to bridge back assets such as renBTC to their respective
              native chains as Ren 1.0 will be sunset by 20th December 2022.{' '}
              <a
                className={classes.link}
                href="https://medium.com/renproject/moving-on-from-alameda-da62a823ce93"
                target="_blank"
                rel="noopener"
              >
                Learn more.
              </a>
            </div>
          </div>
          <Clear onClick={closeBanner} className={classes.cross} />
        </div>
      </Container>
    </div>
  );
});

export const RenBannerHome = memo(function RenBannerHome() {
  const vaultIds = useAppSelector(state => selectUserDepositedVaultIdsForAsset(state, 'renBTC'));
  return vaultIds.length ? <RenBanner /> : null;
});

export type RenBannerVaultProps = {
  vaultId: VaultEntity['id'];
};
export const RenBannerVault = memo<RenBannerVaultProps>(function RenBannerVault({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  return vault.assetIds.includes('renBTC') ? <RenBanner /> : null;
});
