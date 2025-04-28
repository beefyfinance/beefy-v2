import { memo } from 'react';
import { AssetsImage } from '../../AssetsImage/AssetsImage.tsx';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import { ExternalLink } from '../Links/ExternalLink.tsx';

export const FraxBanner = memo(function FraxBanner() {
  return (
    <DismissibleBanner
      id={'frax-north-star'}
      icon={<AssetsImage chainId={'fraxtal'} assetSymbols={['FRAX']} size={24} />}
      text={
        <>
          {'On April 29th at noon PST, Fraxtal chain will apply the North Star Upgrade. '}
          {
            'Frax Share (FXS) will be renamed to Frax (FRAX), and become the gas token for Fraxtal, replacing frxETH. '
          }
          <ExternalLink href="https://gov.frax.finance/t/fip-428-frax-north-star-proposal-v2/3652/17">
            Learn more.
          </ExternalLink>
        </>
      }
    />
  );
});
