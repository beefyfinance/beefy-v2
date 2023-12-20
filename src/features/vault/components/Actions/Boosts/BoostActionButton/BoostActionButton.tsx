import { Collapse, IconButton, InputBase, makeStyles } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import type BigNumber from 'bignumber.js';
import clsx from 'clsx';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button';
import { formatFullBigNumber, formatSignificantBigNumber } from '../../../../../../helpers/format';
import { useAppDispatch, useAppSelector, useAppStore } from '../../../../../../store';
import { initBoostForm } from '../../../../../data/actions/scenarios';
import { startStepper } from '../../../../../data/actions/stepper';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import type { BoostEntity } from '../../../../../data/entities/boost';
import { isFulfilled } from '../../../../../data/reducers/data-loader-types';
import { boostActions } from '../../../../../data/reducers/wallet/boost';
import { stepperActions } from '../../../../../data/reducers/wallet/stepper';
import {
  selectBoostRewardsTokenEntity,
  selectBoostUserRewardsInToken,
} from '../../../../../data/selectors/balance';
import { selectBoostById } from '../../../../../data/selectors/boosts';
import { selectIsAddressBookLoaded } from '../../../../../data/selectors/data-loader';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import {
  selectErc20TokenByAddress,
  selectTokenPriceByAddress,
} from '../../../../../data/selectors/tokens';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults';
import { selectIsWalletKnown, selectWalletAddress } from '../../../../../data/selectors/wallet';
import { selectIsApprovalNeededForBoostStaking } from '../../../../../data/selectors/wallet-actions';
import { styles } from './styles';
import { Tooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';

const useStyles = makeStyles(styles);

interface BoostActionButtonProps {
  type: 'stake' | 'unstake';
  boostId: BoostEntity['id'];
  open: boolean;
  handleCollapse: () => void;
  balance: BigNumber;
}

export const BoostActionButton = memo<BoostActionButtonProps>(function BoostActionButton({
  type,
  boostId,
  open,
  handleCollapse,
  balance,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectStandardVaultById(state, boost.vaultId));
  const formState = useAppSelector(state => state.ui.boost);
  const spenderAddress = boost.earnContractAddress;
  const needsApproval = useAppSelector(state =>
    selectIsApprovalNeededForBoostStaking(state, spenderAddress)
  );
  const mooToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );
  const oraclePrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const rewardToken = useAppSelector(state => selectBoostRewardsTokenEntity(state, boost.id));
  const boostPendingRewards = useAppSelector(state =>
    selectBoostUserRewardsInToken(state, boost.id)
  );

  const formReady = useAppSelector(
    state =>
      selectIsAddressBookLoaded(state, boost.chainId) &&
      isFulfilled(state.ui.dataLoader.global.boostForm)
  );
  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  const isStepping = useAppSelector(selectIsStepperStepping);

  const isDisabled = useMemo(
    () => !formReady || formState.amount.eq(0) || isStepping || balance.eq(0),
    [balance, formReady, formState.amount, isStepping]
  );

  const isDisabledMaxButton = useMemo(
    () => !formReady || isStepping || balance.eq(0),
    [balance, formReady, isStepping]
  );

  // initialize our form
  const store = useAppStore();
  React.useEffect(() => {
    if (open) {
      initBoostForm(store, boostId, type, walletAddress);
    }
  }, [store, boostId, walletAddress, type, open]);

  const isStake = type === 'stake' ? true : false;

  const handleInput = (amountStr: string) => {
    dispatch(
      boostActions.setInput({
        amount: amountStr,
        withdraw: isStake ? false : true,
        state: store.getState(),
      })
    );
  };

  const handleMax = () => {
    dispatch(boostActions.setMax({ state: store.getState() }));
  };

  const handleAction = () => {
    if (isStake) {
      if (needsApproval) {
        dispatch(
          stepperActions.addStep({
            step: {
              step: 'approve',
              message: t('Vault-ApproveMsg'),
              action: walletActions.approval(mooToken, spenderAddress),
              pending: false,
            },
          })
        );
      }
      dispatch(
        stepperActions.addStep({
          step: {
            step: 'stake',
            message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
            action: walletActions.stakeBoost(boost, formState.amount),
            pending: false,
          },
        })
      );
    } else {
      // If user is withdrawing all their assets, UI won't allow to claim individually later on, so claim as well
      if (formState.max) {
        dispatch(
          stepperActions.addStep({
            step: {
              step: 'claim-unstake',
              message: t('Vault-TxnConfirm', { type: t('Claim-Unstake-noun') }),
              action: walletActions.exitBoost(boost),
              pending: false,
              extraInfo: {
                rewards: {
                  token: rewardToken,
                  amount: boostPendingRewards,
                },
              },
            },
          })
        );
      } else {
        dispatch(
          stepperActions.addStep({
            step: {
              step: 'unstake',
              message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
              action: walletActions.unstakeBoost(boost, formState.amount),
              pending: false,
            },
          })
        );
      }
    }

    dispatch(startStepper(boost.chainId));
  };

  return (
    <div className={clsx(classes.container)}>
      <div className={classes.title} onClick={handleCollapse}>
        <IconButton className={classes.iconButton}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
        <div className={classes.text}>
          {t(isStake ? 'Boost-Button-Stake' : 'Boost-Button-Unstake')}
        </div>
        <div className={classes.balance}>
          {balance.gt(0) ? (
            <Tooltip
              content={
                <BasicTooltipContent title={formatFullBigNumber(balance, mooToken.decimals)} />
              }
            >
              {t(isStake ? 'Available' : 'Staked')}{' '}
              <span>{formatSignificantBigNumber(balance, mooToken.decimals, oraclePrice)}</span>
            </Tooltip>
          ) : (
            <>
              {t(isStake ? 'Available' : 'Staked')}{' '}
              <span>{formatSignificantBigNumber(balance, mooToken.decimals, oraclePrice)}</span>
            </>
          )}
        </div>
      </div>
      <Collapse in={open} timeout="auto">
        <div className={classes.actions}>
          <InputBase
            className={classes.input}
            value={formState.formattedInput}
            onChange={e => handleInput(e.target.value)}
            fullWidth={true}
            endAdornment={
              <Button
                disabled={isDisabledMaxButton}
                className={classes.maxButton}
                onClick={handleMax}
              >
                MAX
              </Button>
            }
            placeholder={`0`}
          />
          <Button
            borderless={true}
            onClick={handleAction}
            fullWidth={true}
            disabled={isDisabled}
            variant="boost"
          >
            {t(isStake ? 'Boost-Button-Stake' : 'Boost-Button-Unstake')}
          </Button>
        </div>
      </Collapse>
    </div>
  );
});
