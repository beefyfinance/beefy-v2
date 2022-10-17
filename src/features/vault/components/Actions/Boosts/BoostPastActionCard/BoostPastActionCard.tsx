import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { Button } from '../../../../../../components/Button';
import { formatBigDecimals } from '../../../../../../helpers/format';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { startStepper } from '../../../../../data/actions/stepper';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import { BoostEntity } from '../../../../../data/entities/boost';
import { stepperActions } from '../../../../../data/reducers/wallet/stepper';
import {
  selectBoostRewardsTokenEntity,
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
} from '../../../../../data/selectors/balance';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface BoostPastCardActionCardProps {
  boost: BoostEntity;
}

export const BoostPastActionCard = memo<BoostPastCardActionCardProps>(function ({ boost }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const boostBalance = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));
  const rewardToken = useAppSelector(state => selectBoostRewardsTokenEntity(state, boost.id));
  const boostPendingRewards = useAppSelector(state =>
    selectBoostUserRewardsInToken(state, boost.id)
  );

  const isStepping = useAppSelector(selectIsStepperStepping);

  const handleExit = (boost: BoostEntity) => {
    dispatch(
      stepperActions.addStep({
        step: {
          step: 'claim-unstake',
          message: t('Vault-TxnConfirm', { type: t('Claim-Unstake-noun') }),
          action: walletActions.exitBoost(boost),
          pending: false,
        },
      })
    );

    dispatch(startStepper(boost.chainId));
  };

  return (
    <div className={classes.expiredBoostContainer} key={boost.id}>
      <div className={classes.title}>
        <AssetsImage size={24} chainId={boost.chainId} assetIds={[rewardToken.id]} />
        <div className={classes.expiredBoostName}>{t('Boost-NameBoost', { name: boost.name })}</div>
      </div>
      <div className={classes.balances}>
        <div className={classes.balance}>
          {t('Staked')} <span>{formatBigDecimals(boostBalance, 4)}</span>
        </div>
        <div className={classes.balance}>
          {t('Earned')}{' '}
          <span>
            {formatBigDecimals(boostPendingRewards, 4)} {rewardToken.symbol}
          </span>
        </div>
      </div>
      <Button
        onClick={() => handleExit(boost)}
        disabled={isStepping}
        className={classes.button}
        fullWidth={true}
        borderless={true}
      >
        {t('Boost-Button-Claim-Unstake')}
      </Button>
    </div>
  );
});
