import { Collapse, IconButton, makeStyles } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button';
import { formatTokenDisplayCondensed, formatTokenDisplay } from '../../../../../../helpers/format';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { startStepper } from '../../../../../data/actions/stepper';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import type { BoostEntity } from '../../../../../data/entities/boost';
import { stepperActions } from '../../../../../data/reducers/wallet/stepper';
import {
  selectBoostRewardsTokenEntity,
  selectBoostUserRewardsInToken,
} from '../../../../../data/selectors/balance';
import { selectBoostById } from '../../../../../data/selectors/boosts';
import { selectIsAddressBookLoaded } from '../../../../../data/selectors/data-loader';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { selectErc20TokenByAddress } from '../../../../../data/selectors/tokens';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults';
import { selectIsWalletKnown, selectWalletAddress } from '../../../../../data/selectors/wallet';
import { selectIsApprovalNeededForBoostStaking } from '../../../../../data/selectors/wallet-actions';
import { styles } from './styles';
import { Tooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';
import { isLoaderFulfilled } from '../../../../../data/selectors/data-loader-helpers';
import { initiateBoostForm } from '../../../../../data/actions/boosts';
import { AmountInput } from '../../Transact/AmountInput';
import { useInputForm } from './hooks';
import type BigNumber from 'bignumber.js';

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

  const spenderAddress = boost.contractAddress;
  const needsApproval = useAppSelector(state =>
    selectIsApprovalNeededForBoostStaking(state, spenderAddress, boost)
  );
  const mooToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress)
  );
  const rewardToken = useAppSelector(state => selectBoostRewardsTokenEntity(state, boost.id));

  const boostPendingRewards = useAppSelector(state =>
    selectBoostUserRewardsInToken(state, boost.id)
  );

  const formReady = useAppSelector(
    state =>
      selectIsAddressBookLoaded(state, boost.chainId) &&
      isLoaderFulfilled(state.ui.dataLoader.global.boostForm)
  );
  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : undefined
  );

  const isStepping = useAppSelector(selectIsStepperStepping);

  const { handleMax, handleChange, formData } = useInputForm(balance, mooToken.decimals);

  const isDisabled = useMemo(
    () => !formReady || formData.amount.eq(0) || isStepping || balance.eq(0),
    [balance, formReady, formData.amount, isStepping]
  );

  const isDisabledMaxButton = useMemo(
    () => !formReady || isStepping || balance.eq(0),
    [balance, formReady, isStepping]
  );

  useEffect(() => {
    if (open) {
      dispatch(initiateBoostForm({ boostId, walletAddress }));
    }
  }, [boostId, walletAddress, open, dispatch]);

  const isStake = type === 'stake' ? true : false;

  const handleAction = () => {
    if (isStake) {
      if (needsApproval) {
        dispatch(
          stepperActions.addStep({
            step: {
              step: 'approve',
              message: t('Vault-ApproveMsg'),
              action: walletActions.approval(mooToken, spenderAddress, formData.amount),
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
            action: walletActions.stakeBoost(boost, formData.amount),
            pending: false,
          },
        })
      );
    } else {
      // If user is withdrawing all their assets, UI won't allow to claim individually later on, so claim as well
      if (formData.max) {
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
              action: walletActions.unstakeBoost(boost, formData.amount),
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
                <BasicTooltipContent title={formatTokenDisplay(balance, mooToken.decimals)} />
              }
            >
              {t(isStake ? 'Available' : 'Staked')}{' '}
              <span>{formatTokenDisplayCondensed(balance, mooToken.decimals)}</span>
            </Tooltip>
          ) : (
            <>
              {t(isStake ? 'Available' : 'Staked')}{' '}
              <span>{formatTokenDisplayCondensed(balance, mooToken.decimals)}</span>
            </>
          )}
        </div>
      </div>
      <Collapse in={open} timeout="auto">
        <div className={classes.actions}>
          <AmountInput
            value={formData.amount}
            maxValue={balance}
            onChange={handleChange}
            tokenDecimals={mooToken.decimals}
            endAdornment={
              <Button
                disabled={isDisabledMaxButton}
                className={classes.maxButton}
                onClick={handleMax}
              >
                MAX
              </Button>
            }
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
