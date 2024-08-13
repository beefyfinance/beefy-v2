import { memo, useCallback } from 'react';

import { selectUserDepositedVaultIdsForAsset } from '../../../features/data/selectors/balance';
import { useAppSelector } from '../../../store';
import { AssetsImage } from '../../AssetsImage';
import { selectVaultById } from '../../../features/data/selectors/vaults';
import type { VaultEntity } from '../../../features/data/entities/vault';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import { ExternalLink } from '../Links/Links';

const BusdBanner = memo(function BusdBanner() {
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideBusdBanner', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<AssetsImage chainId={'bsc'} assetSymbols={['BUSD']} size={24} />}
      text={
        <>
          The issuer of BUSD, Paxos, has halted the minting of new tokens, and Binance plans to
          cease support for BUSD by December 15th, 2023. Beefy users are encouraged to withdraw and
          convert their BUSD tokens into other available assets. BUSD vaults will remain active on
          Beefy until liquidity, incentives, or TVL falls below the specified thresholds.{' '}
          <ExternalLink href="https://paxos.com/2023/02/13/paxos-will-halt-minting-new-busd-tokens/">
            Learn more.
          </ExternalLink>
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
