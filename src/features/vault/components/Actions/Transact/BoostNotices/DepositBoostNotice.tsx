import { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectIsWalletConnected } from '../../../../../data/selectors/wallet.ts';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../../data/selectors/boosts.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInShareTokenIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInShareToken,
} from '../../../../../data/selectors/balance.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { TokenImageFromEntity } from '../../../../../../components/TokenImage/TokenImage.tsx';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type { PromoReward } from '../../../../../data/entities/promo.ts';
import { Notification } from '../../../../../../components/Notification.tsx';
import { ListJoin } from '../../../../../../components/ListJoin.tsx';

export const DepositBoostPromotion = memo(function DepositBoostPromotion() {
  const dispatch = useAppDispatch();
  const vaultId = useAppSelector(selectTransactVaultId);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const boost = useAppSelector(state => selectCurrentBoostByVaultIdOrUndefined(state, vaultId));
  const inVaultAnywhere = useAppSelector(state =>
    selectUserVaultBalanceInShareTokenIncludingDisplaced(state, vaultId)
  );
  const notInActiveBoost = useAppSelector(state =>
    selectUserVaultBalanceNotInActiveBoostInShareToken(state, vaultId)
  );
  const handleTab = useCallback(() => {
    dispatch(transactActions.switchMode(TransactMode.Boost));
  }, [dispatch]);

  // no active boost or user deposited all in boost
  if (!boost || (isWalletConnected && !inVaultAnywhere.isZero() && notInActiveBoost.isZero())) {
    return null;
  }

  return <BoostPromotionNotification rewardTokens={boost.rewards} handleTab={handleTab} />;
});

const BoostPromotionNotification = memo(function BoostPromotionNotification({
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
  const deposited = userDepositInVault.gt(BIG_ZERO);
  const inner = useMemo(() => {
    const key = deposited ? 'Boost-Notification-Boost' : 'Boost-Notification-Deposit';
    return (
      <Trans
        i18nKey={key}
        t={t}
        values={{ count: rewardTokens.length }}
        components={{
          Tokens: <TokensList rewardTokens={rewardTokens} />,
        }}
      />
    );
  }, [deposited, rewardTokens, t]);

  if (deposited) {
    return (
      <PromotionNotification padding="none" direction={rewardTokens.length > 1 ? 'column' : 'row'}>
        <PromotionButton onClick={handleTab}>
          {inner}
          <ChevronRight preserveAspectRatio="xMaxYMid" className={inlineIcon} />
        </PromotionButton>
      </PromotionNotification>
    );
  }

  return (
    <PromotionNotification direction={rewardTokens.length > 1 ? 'column' : 'row'}>
      {inner}
    </PromotionNotification>
  );
});

const TokensList = memo(function TokensList({ rewardTokens }: { rewardTokens: PromoReward[] }) {
  return (
    <RewardTokens>
      <ListJoin
        items={rewardTokens.map(reward => (
          <RewardToken key={reward.address}>
            {reward.symbol}
            <TokenImageFromEntity token={reward} size={20} />
          </RewardToken>
        ))}
      />
    </RewardTokens>
  );
});

const inlineIcon = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '6px',
});

const RewardTokens = styled('span', {
  base: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
});

const RewardToken = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    gap: '6px',
  },
});

const PromotionNotification = styled(
  Notification,
  {
    base: {
      contain: 'paint',
      gap: '2px',
    },
  },
  {
    defaultProps: {
      background: 'solid',
      radius: 'md',
      attached: 'bottom',
    },
  }
);

const PromotionButton = styled('button', {
  base: {
    display: 'block',
    whiteSpace: 'wrap',
    width: '100%',
    border: 'none',
    padding: '8px 16px',
    sm: {
      padding: '8px 24px',
    },
    '&:hover': {
      background: 'buttons.boost.active.background',
    },
  },
});
