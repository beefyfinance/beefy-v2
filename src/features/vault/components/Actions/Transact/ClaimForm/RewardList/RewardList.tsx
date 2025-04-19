import { memo, useMemo } from 'react';
import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../../../../../data/entities/token.ts';
import { formatLargePercent, formatUsd } from '../../../../../../../helpers/format.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { TokenImageFromEntity } from '../../../../../../../components/TokenImage/TokenImage.tsx';
import { orderBy } from 'lodash-es';
import { getNetworkSrc } from '../../../../../../../helpers/networkSrc.ts';
import type { ChainEntity } from '../../../../../../data/entities/chain.ts';
import { DivWithTooltip } from '../../../../../../../components/Tooltip/DivWithTooltip.tsx';
import { styled } from '@repo/styles/jsx';
import { TokenAmount } from '../../../../../../../components/TokenAmount/TokenAmount.tsx';
import { useTranslation } from 'react-i18next';

type Token = Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'chainId'>;

type RewardListProps = {
  chainId: ChainEntity['id'];
  css?: CssStyles;
  deposited: boolean;
  rewards: {
    active: boolean;
    amount: BigNumber;
    token: Token;
    price: BigNumber | undefined;
    apr: number | undefined;
  }[];
};

export const RewardList = memo(function RewardList({
  rewards,
  deposited,
  css: cssProp,
  chainId,
}: RewardListProps) {
  const { t } = useTranslation();
  const sortedRewards = useMemo(
    () => (deposited ? rewards : orderBy(rewards, r => r.apr, 'desc')),
    [rewards, deposited]
  );

  return (
    <RewardsContainer className={css(cssProp)}>
      {sortedRewards.map(r => (
        <Amount key={r.token.address}>
          {deposited && <TokenAmount amount={r.amount} decimals={r.token.decimals} />}
          {` ${r.token.symbol}`}
          <TokenImageFromEntity token={r.token} size={24} />
          {r.token.chainId !== chainId ?
            <>
              {' '}
              on{' '}
              <DivWithTooltip
                tooltip={`${r.token.symbol} rewards are claimable on ${
                  r.token.chainId.charAt(0).toUpperCase() + r.token.chainId.slice(1)
                }`}
              >
                <img
                  src={getNetworkSrc(r.token.chainId)}
                  alt={r.token.chainId}
                  height={24}
                  width={24}
                />
              </DivWithTooltip>
            </>
          : null}
          <RewardOrApy>
            {r.active && r.amount.isZero() && r.apr ?
              t('Boost-APR', { apr: formatLargePercent(r.apr) })
            : !r.amount.isZero() && r.price ?
              formatUsd(r.price.multipliedBy(r.amount))
            : '-'}
          </RewardOrApy>
        </Amount>
      ))}
    </RewardsContainer>
  );
});

const RewardsContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
});

const Amount = styled('div', {
  base: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    textStyle: 'body.medium',
    color: 'text.middle',
  },
});

const RewardOrApy = styled('div', {
  base: {
    marginLeft: 'auto',
  },
});
