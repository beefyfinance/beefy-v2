import { memo } from 'react';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import { ExternalLink } from '../Links/ExternalLink.tsx';
import clmIcon from '../../../images/icons/clm.svg';

export const TokenizedStocksBanner = memo(function TokenizedStocksBanner() {
  return (
    <DismissibleBanner
      id="tokenized-stocks-launch"
      icon={<img src={clmIcon} alt="" width={24} height={24} />}
      text={
        <>
          Coinbase Tokenized Stocks are live on Base, with Beefy as a launch partner. Zap in, boost,
          and get three layers of rewards at once.{' '}
          <ExternalLink href="https://beefy.com/articles/tokenized-stocks">
            Learn more.
          </ExternalLink>
        </>
      }
    />
  );
});
