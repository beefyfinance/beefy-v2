import { Collapse, IconButton, makeStyles } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import type { BoostPromoEntity } from '../../../../../data/entities/promo';
import { selectBoostById } from '../../../../../data/selectors/boosts';
import { selectIsAddressBookLoaded } from '../../../../../data/selectors/data-loader';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { selectErc20TokenByAddress } from '../../../../../data/selectors/tokens';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults';
import { selectIsWalletKnown, selectWalletAddress } from '../../../../../data/selectors/wallet';
import { styles } from './styles';
import { isLoaderFulfilled } from '../../../../../data/selectors/data-loader-helpers';
import { initiateBoostForm } from '../../../../../data/actions/boosts';
import { AmountInput } from '../../Transact/AmountInput';
import { useInputForm } from '../../../../../data/hooks/input';
import { type BigNumber } from 'bignumber.js';
import { TokenAmount } from '../../../../../../components/TokenAmount';
import { ActionButton } from '../ActionButton/ActionButton';

const useStyles = makeStyles(styles);

export interface ActionInputButtonProps {
  boostId: BoostPromoEntity['id'];
  open: boolean;
  onToggle: () => void;
  onSubmit: (amount: BigNumber, max: boolean) => void;
  balance: BigNumber;
  title: string;
  balanceLabel: string;
  buttonLabel: string;
}

export const ActionInputButton = memo<ActionInputButtonProps>(function ActionInputButton({
  boostId,
  open,
  onToggle,
  onSubmit,
  balance,
  title,
  balanceLabel,
  buttonLabel,
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectStandardVaultById(state, boost.vaultId));
  const mooToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress)
  );
  const { handleMax, handleChange, formData } = useInputForm(balance, mooToken.decimals);
  const formReady = useAppSelector(
    state =>
      selectIsAddressBookLoaded(state, boost.chainId) &&
      isLoaderFulfilled(state.ui.dataLoader.global.boostForm)
  );
  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : undefined
  );

  const isStepping = useAppSelector(selectIsStepperStepping);

  const isDisabled = useMemo(
    () => !formReady || formData.amount.eq(0) || isStepping || balance.eq(0),
    [balance, formReady, formData.amount, isStepping]
  );

  const isDisabledMaxButton = useMemo(
    () => !formReady || isStepping || balance.eq(0),
    [balance, formReady, isStepping]
  );

  const handleClick = useCallback(() => {
    onSubmit(formData.amount, formData.max);
  }, [onSubmit, formData]);

  useEffect(() => {
    if (open) {
      dispatch(initiateBoostForm({ boostId, walletAddress }));
    }
  }, [boostId, walletAddress, open, dispatch]);

  return (
    <div className={classes.container}>
      <div className={classes.title} onClick={onToggle}>
        <IconButton className={classes.iconButton}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
        <div className={classes.text}>{title}</div>
        <div className={classes.balance}>
          {balanceLabel} <TokenAmount amount={balance} decimals={mooToken.decimals} />
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
          <ActionButton onClick={handleClick} disabled={isDisabled}>
            {buttonLabel}
          </ActionButton>
        </div>
      </Collapse>
    </div>
  );
});
