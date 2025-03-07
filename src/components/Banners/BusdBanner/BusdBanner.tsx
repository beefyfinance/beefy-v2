import { memo } from 'react';
import { AssetsImage } from '../../AssetsImage/AssetsImage.tsx';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import { ExternalLink } from '../Links/ExternalLink.tsx';

export const BusdBanner = memo(function BusdBanner() {
  return (
    <DismissibleBanner
      id={'busd-retirement'}
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
    />
  );
});
