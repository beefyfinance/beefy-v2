import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { selectUserDepositedVaultIdsForAsset } from '../../../features/data/selectors/balance';
import { useAppSelector } from '../../../store';
import { AssetsImage } from '../../AssetsImage';
import { selectVaultById } from '../../../features/data/selectors/vaults';
import type { VaultEntity } from '../../../features/data/entities/vault';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';

const useStyles = makeStyles(styles);

const BusdBanner = memo(function BusdBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideBusdBanner', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<AssetsImage chainId={'bsc'} assetSymbols={['BUSD']} className={classes.icon} />}
      text={
        <>
          The issuer of BUSD, Paxos, has halted the minting of new tokens, and Binance plans to
          cease support for BUSD by December 15th. Beefy users are encouraged to withdraw and
          convert their BUSD tokens into other available assets. BUSD vaults will remain active on
          Beefy until liquidity, incentives, or TVL falls below the specified thresholds.{' '}
          <a
            className={classes.link}
            href="https://paxos.com/2023/02/13/paxos-will-halt-minting-new-busd-tokens/"
            target="_blank"
            rel="noopener"
          >
            Learn more.
          </a>
        </>
      }
      onClose={closeBanner}
    />
  );
});

export const BusdBannerHome = memo(function BusdBannerHome() {
  const vaultIds = useAppSelector(state => selectUserDepositedVaultIdsForAsset(state, 'BUSD'));
  return vaultIds.length ? <BusdBanner /> : null;
});

export type BusdBannerVaultProps = {
  vaultId: VaultEntity['id'];
};
export const BusdBannerVault = memo<BusdBannerVaultProps>(function BusdBannerVault({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  return vault.assetIds.includes('BUSD') ? <BusdBanner /> : null;
});
