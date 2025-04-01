import { memo, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectIsWalletConnected } from '../../../../../data/selectors/wallet.ts';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../../data/selectors/boosts.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInShareTokenInCurrentBoost,
} from '../../../../../data/selectors/balance.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { TokenImageFromEntity } from '../../../../../../components/TokenImage/TokenImage.tsx';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type { PromoReward } from '../../../../../data/entities/promo.ts';

export const DepositBoostPromotion = memo(function DepositBoostPromotion() {
  const vaultId = useAppSelector(selectTransactVaultId);

  const boost = useAppSelector(state => selectCurrentBoostByVaultIdOrUndefined(state, vaultId));
  const userDepositInVault = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );
  const userDepositInBoost = useAppSelector(state =>
    selectUserVaultBalanceInShareTokenInCurrentBoost(state, vaultId)
  );
  const dispatch = useAppDispatch();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);

  const handleTab = useCallback(() => {
    dispatch(transactActions.switchMode(TransactMode.Boost));
  }, [dispatch]);

  // Case 1:  no active boost or user deposited all in boost
  if (
    !boost ||
    (isWalletConnected && userDepositInBoost.gt(BIG_ZERO) && userDepositInVault.isZero())
  ) {
    return null;
  }

  //current limitations supports max 2 rewards
  if (boost.rewards.length > 1) {
    return (
      <DoubleRewardsBoostPromotion
        rewardTokens={[boost.rewards[0], boost.rewards[0]]}
        handleTab={handleTab}
      />
    );
  } else {
    return <SingleRewardBoostPromotion rewardToken={boost.rewards[0]} handleTab={handleTab} />;
  }
});

const DoubleRewardsBoostPromotion = memo(function DoubleRewardsBoostPromotion({
  rewardTokens,
  handleTab,
}: {
  rewardTokens: PromoReward[];
  handleTab: () => void;
}) {
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);

  const userDepositInVault = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );

  if (!userDepositInVault.isZero()) {
    return (
      <BoostPromotionContainer>
        <BoostPromotionButton onClick={handleTab}>
          {t('Boost-Deposit-Notice-2-double')}{' '}
          <FlexContainer>
            <Trans
              i18nKey="Boost-Deposit-Rewards-double"
              components={{
                Token1: <TokenImageFromEntity token={rewardTokens[0]} size={20} />,
                Token2: <TokenImageFromEntity token={rewardTokens[1]} size={20} />,
              }}
              values={{ symbol1: rewardTokens[0].symbol, symbol2: rewardTokens[1].symbol }}
              css={styles.text}
            />
            <ChevronRight
              preserveAspectRatio="xMaxYMid"
              className={css({
                ...styles.text,
                width: '12px', // svg is 6x9
              })}
            />
          </FlexContainer>
        </BoostPromotionButton>
      </BoostPromotionContainer>
    );
  }

  return (
    <BoostPromotionContainer double={true}>
      {t('Boost-Deposit-Notice-1-double')}{' '}
      <FlexContainer>
        <Trans
          i18nKey="Boost-Deposit-Rewards-double"
          components={{
            Token1: <TokenImageFromEntity token={rewardTokens[0]} size={20} />,
            Token2: <TokenImageFromEntity token={rewardTokens[1]} size={20} />,
          }}
          values={{ symbol1: rewardTokens[0].symbol, symbol2: rewardTokens[1].symbol }}
          css={styles.text}
        />
      </FlexContainer>
    </BoostPromotionContainer>
  );
});

const SingleRewardBoostPromotion = memo(function SingleRewardBoostPromotion({
  rewardToken,
  handleTab,
}: {
  rewardToken: PromoReward;
  handleTab: () => void;
}) {
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);

  const userDepositInVault = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );

  if (!userDepositInVault.isZero()) {
    return (
      <BoostPromotionContainer>
        <BoostPromotionButton onClick={handleTab}>
          {t('Boost-Deposit-Notice-2')}{' '}
          <span className={css({ whiteSpace: 'nowrap' })}>
            <Trans
              i18nKey="Boost-Deposit-Rewards"
              components={{
                Token: <TokenImageFromEntity token={rewardToken} size={20} css={styles.text} />,
              }}
              values={{ symbol: rewardToken.symbol }}
            />
            <ChevronRight
              preserveAspectRatio="xMaxYMid"
              className={css({
                ...styles.text,
                width: '12px', // svg is 6x9
              })}
            />
          </span>
        </BoostPromotionButton>
      </BoostPromotionContainer>
    );
  }

  return (
    <BoostPromotionContainer>
      {t('Boost-Deposit-Notice-1')}{' '}
      <Trans
        i18nKey="Boost-Deposit-Rewards"
        components={{ Token: <TokenImageFromEntity token={rewardToken} size={20} /> }}
        values={{ symbol: rewardToken.symbol }}
        css={styles.text}
      />
    </BoostPromotionContainer>
  );
});

const styles = {
  text: css.raw({
    display: 'inline-flex',
    verticalAlign: 'middle',
  }),
};

const BoostPromotionContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textStyle: 'body.medium',
    padding: '6px 16px 8px 16px',
    color: 'text.black',
    gap: '2px',
    flexWrap: 'wrap',
    background: 'background.content.boost',
    borderRadius: '0px 0px 12px 12px',
    sm: {
      padding: '6px 24px 8px 24px',
    },
  },
  variants: {
    double: {
      true: {
        flexDirection: 'column',
      },
    },
  },
});

const BoostPromotionButton = styled('button', {
  base: {
    display: 'block',
    whiteSpace: 'wrap',
    width: '100%',
  },
});

const FlexContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    justifyContent: 'center',
  },
});
