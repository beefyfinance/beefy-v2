import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import ExpandLess from '../../../../../../images/icons/mui/ExpandLess.svg?react';
import ExpandMore from '../../../../../../images/icons/mui/ExpandMore.svg?react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import type { BoostPromoEntity } from '../../../../../data/entities/promo.ts';
import { selectBoostById } from '../../../../../data/selectors/boosts.ts';
import { selectIsAddressBookLoaded } from '../../../../../data/selectors/data-loader.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import { selectErc20TokenByAddress } from '../../../../../data/selectors/tokens.ts';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectIsWalletKnown, selectWalletAddress } from '../../../../../data/selectors/wallet.ts';
import { styles } from './styles.ts';
import { isLoaderFulfilled } from '../../../../../data/selectors/data-loader-helpers.ts';
import { initiateBoostForm } from '../../../../../data/actions/boosts.ts';
import { AmountInput } from '../../Transact/AmountInput/AmountInput.tsx';
import { useInputForm } from '../../../../../data/hooks/input.tsx';
import type BigNumber from 'bignumber.js';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { ActionButton } from '../ActionButton/ActionButton.tsx';
import { Collapse } from '../../../../../../components/Collapse/Collapse.tsx';

const useStyles = legacyMakeStyles(styles);

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

export const ActionInputButton = memo(function ActionInputButton({
  boostId,
  open,
  onToggle,
  onSubmit,
  balance,
  title,
  balanceLabel,
  buttonLabel,
}: ActionInputButtonProps) {
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
        <button type="button" className={classes.iconButton}>
          {open ?
            <ExpandLess />
          : <ExpandMore />}
        </button>
        <div className={classes.text}>{title}</div>
        <div className={classes.balance}>
          {balanceLabel} <TokenAmount amount={balance} decimals={mooToken.decimals} />
        </div>
      </div>
      <Collapse in={open}>
        <div className={classes.actions}>
          <AmountInput
            value={formData.amount}
            maxValue={balance}
            onChange={handleChange}
            tokenDecimals={mooToken.decimals}
            endAdornment={
              <button
                type="button"
                disabled={isDisabledMaxButton}
                className={classes.maxButton}
                onClick={handleMax}
              >
                MAX
              </button>
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
