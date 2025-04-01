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

export const DepositBoostPromotion = memo(function DepositBoostPromotion() {
  const { t } = useTranslation();
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

  //TODO: Handle multiple rewards
  const rewardToken = boost?.rewards[0];

  // Case 2: User has deposits but not in boost or partial boost
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
});

const BoostPromotionButton = styled('button', {
  base: {
    display: 'block',
    whiteSpace: 'wrap',
    width: '100%',
  },
});
