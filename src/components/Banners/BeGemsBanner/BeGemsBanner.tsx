import { memo, useMemo } from 'react';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import beGems from '../../../images/icons/navigation/gems.svg';
import { InternalLink } from '../Links/InternalLink.tsx';
import { selectUserBalanceOfToken } from '../../../features/data/selectors/balance.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { css } from '@repo/styles/css/css';
import { Container } from '../../Container/Container.tsx';
import { selectWalletAddressIfKnown } from '../../../features/data/selectors/wallet.ts';

export const BannerBeGems = memo(function BannerBeGems({ address }: { address?: string }) {
  return (
    <DismissibleBanner
      id={`be-gems-${address}`}
      icon={<img alt="begems" src={beGems} width={24} height={24} />}
      text={
        <>
          {`Sonic Season 1 beGEMS redemptions are now open! `}
          <InternalLink to="/campaigns/begems">Redeem your tokens for S</InternalLink>{' '}
          {'before 24 October 2025.'}
        </>
      }
    />
  );
});

export const BeGemsBanner = memo(function BeGemsBanner({
  address,
  dashboard,
}: {
  address?: string;
  dashboard?: boolean;
}) {
  const walletAddress = useAppSelector(state => selectWalletAddressIfKnown(state));

  const maybeAddress = useMemo(() => address || walletAddress, [address, walletAddress]);

  const beGems1Balance = useAppSelector(state =>
    selectUserBalanceOfToken(
      state,
      'sonic',
      '0xd70c020c48403295100884ee47db80d51BAA9d87',
      maybeAddress
    )
  );

  if (beGems1Balance.isZero()) {
    return null;
  }

  console.log(beGems1Balance, maybeAddress);

  return dashboard ?
      <div className={css({ backgroundColor: 'background.header' })}>
        <Container maxWidth="lg">
          <BeGemsBanner address={maybeAddress} />
        </Container>
      </div>
    : <BannerBeGems address={maybeAddress} />;
});
