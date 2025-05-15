import { css } from '@repo/styles/css';
import { memo } from 'react';
import { selectTokenPriceByTokenOracleId } from '../../../../features/data/selectors/tokens.ts';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import llamaSwapIcon from '../../../../images/icons/llama-swap.png';
import shadowSwapIcon from '../../../../images/platforms/shadow.svg';
import { ActionLink } from './Action.tsx';
import { AddToWalletButton } from './AddToWalletButton.tsx';
import { type Token, tokens } from './config.ts';
import { Icon } from './Icon.tsx';

const buyPlatforms: Record<
  NonNullable<Token['buyLink']>['platform'],
  { icon: string; title: string }
> = {
  llama: { icon: llamaSwapIcon, title: 'LlamaSwap' },
  shadow: { icon: shadowSwapIcon, title: 'ShadowSwap' },
};

export const Tokens = memo(function Tokens() {
  const className = css({
    display: 'grid',
    gap: '8px',
    gridTemplateColumns: 'auto 1fr min-content min-content min-content min-content',
    alignItems: 'center',
  });

  return (
    <div className={className}>
      {tokens.map((token, i) => (
        <TokenRow key={i} token={token} />
      ))}
    </div>
  );
});

type TooltipTokenProps = {
  token: Token;
};

const TokenRow = memo<TooltipTokenProps>(function TokenRow({ token }) {
  const { symbol, oracleId, icon, explorer, buyLink, address, walletIconUrl, chainId } = token;
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, oracleId));

  return (
    <>
      <Icon alt={symbol} src={icon} first />
      <div>{symbol}</div>
      <div>{formatLargeUsd(price, { decimalsUnder: 2 })}</div>
      <ActionLink href={explorer.url} title={`View at ${explorer.name}`}>
        <Icon alt={explorer.name} src={explorer.icon} />
      </ActionLink>
      {buyLink ?
        <ActionLink href={buyLink.url} title={buyPlatforms[buyLink.platform].title}>
          <Icon
            alt={buyPlatforms[buyLink.platform].title}
            src={buyPlatforms[buyLink.platform].icon}
          />
        </ActionLink>
      : null}
      <AddToWalletButton
        title={`Add to Wallet`}
        chainId={chainId}
        tokenAddress={address}
        customIconUrl={walletIconUrl}
      />
    </>
  );
});
