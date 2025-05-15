import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { TokenImageFromEntity } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { DivWithTooltip } from '../../../../../../components/Tooltip/DivWithTooltip.tsx';
import { formatLargePercent, formatUsd } from '../../../../../../helpers/format.ts';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';

type Token = Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'chainId'>;

export type RewardItemProps = {
  chainId: ChainEntity['id'];
  deposited: boolean;
  reward: {
    active: boolean;
    amount: BigNumber;
    token: Token;
    price: BigNumber | undefined;
    apr: number | undefined;
  };
};

export const RewardItem = memo(function RewardItem({ chainId, reward }: RewardItemProps) {
  const { t } = useTranslation();
  const { amount, token, price, apr, active } = reward;
  const showAmount = amount && !amount.isZero();
  const showChain = token.chainId !== chainId;
  const showValue = showAmount && !!price && !price.isZero();
  const showApr = !showValue && active && apr !== undefined;

  return (
    <Row>
      {showAmount && <TokenAmount amount={amount} decimals={token.decimals} />}
      {token.symbol}
      <TokenImageFromEntity token={token} size={24} />
      {showChain && <ClaimableChain symbol={token.symbol} chainId={token.chainId} />}
      <PullRight>
        {showValue ?
          formatUsd(price.multipliedBy(amount))
        : showApr ?
          t('Boost-APR', { apr: formatLargePercent(apr) })
        : '-'}
      </PullRight>
    </Row>
  );
});

type ClaimableChainProps = {
  symbol: string;
  chainId: ChainEntity['id'];
};

const ClaimableChain = memo(function ClaimableChain({ symbol, chainId }: ClaimableChainProps) {
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <>
      {'on'}
      <DivWithTooltip tooltip={`${symbol} rewards are claimable on ${chain.name}`}>
        <img src={getNetworkSrc(chainId)} alt={chainId} height={24} width={24} />
      </DivWithTooltip>
    </>
  );
});

const Row = styled('div', {
  base: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    textStyle: 'body.medium',
    color: 'text.middle',
  },
});

const PullRight = styled('div', {
  base: {
    marginLeft: 'auto',
    textAlign: 'right',
  },
});
