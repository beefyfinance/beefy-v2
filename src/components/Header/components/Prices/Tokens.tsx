import { memo } from 'react';
import { selectTokenPriceByTokenOracleId } from '../../../../features/data/selectors/tokens.ts';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import llamaSwapIcon from '../../../../images/icons/llama-swap.png';
import shadowSwapIcon from '../../../../images/platforms/shadow.svg';
import { ActionLink } from './Action.tsx';
import { AddToWalletButton } from './AddToWalletButton.tsx';
import { type Token, tokens } from './config.ts';
import { ChainSquareIcon, Icon } from './Icon.tsx';
import { styled } from '@repo/styles/jsx';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { useBreakpoint } from '../../../MediaQueries/useBreakpoint.ts';

const buyPlatforms: Record<
  NonNullable<Token['buyLink']>['platform'],
  { icon: string; title: string }
> = {
  llama: { icon: llamaSwapIcon, title: 'LlamaSwap' },
  shadow: { icon: shadowSwapIcon, title: 'ShadowSwap' },
};

export const Tokens = memo(function Tokens() {
  return (
    <TokensContainer>
      {tokens.map((token, i) => (
        <TokenRow key={i} token={token} />
      ))}
    </TokensContainer>
  );
});

const TokensContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
});

type TooltipTokenProps = {
  token: Token;
};

const TokenRow = memo<TooltipTokenProps>(function TokenRow({ token }) {
  const { symbol, oracleId, icon, explorer, buyLink, address, walletIconUrl, chainId } = token;
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, oracleId));
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const isMobile = useBreakpoint({ to: 'xs' });

  return (
    <TokenRowContainer>
      <LeftContainer>
        <Icon alt={symbol} src={icon} first />
        <Symbol>{symbol}</Symbol>
        <ChainLink
          target="_blank"
          rel="noopener"
          href={explorer.url}
          title={`View at ${explorer.name}`}
        >
          {isMobile ?
            <ChainMobileContainer>
              <ChainSquareIcon chainId={chainId} /> ↗
            </ChainMobileContainer>
          : `${chain.name} ↗`}
        </ChainLink>
      </LeftContainer>
      <RightContainer>
        <Price>{formatLargeUsd(price, { decimalsUnder: 2 })}</Price>
        <AddToWalletButton
          title={`Add to Wallet`}
          chainId={chainId}
          tokenAddress={address}
          customIconUrl={walletIconUrl}
        />
        {buyLink ?
          <ActionLink link href={buyLink.url} title={buyPlatforms[buyLink.platform].title}>
            Buy ↗
          </ActionLink>
        : null}
      </RightContainer>
    </TokenRowContainer>
  );
});

const ChainMobileContainer = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.light',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

const Symbol = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.light',
  },
});

const Price = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.light',
  },
});

const ChainLink = styled('a', {
  base: {
    textStyle: 'body',
    color: 'text.dark',
    _hover: {
      color: 'text.light',
    },
  },
});

const TokenRowContainer = styled('div', {
  base: {
    display: 'flex',
    paddingBlock: '6px',
  },
});

const LeftContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexGrow: 1,
  },
});

const RightContainer = styled('div', {
  base: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
});
