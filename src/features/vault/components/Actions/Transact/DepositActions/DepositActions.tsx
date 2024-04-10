import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactQuoteStatus,
  selectTransactSelectedQuoteOrUndefined,
} from '../../../../../data/selectors/transact';
import {
  isCowcentratedDepositQuote,
  type TransactOption,
  type TransactQuote,
} from '../../../../../data/apis/transact/transact-types';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { PriceImpactNotice } from '../PriceImpactNotice';
import { MaxNativeNotice } from '../MaxNativeNotice';
import { transactSteps } from '../../../../../data/actions/transact';
import { EmeraldGasNotice } from '../EmeraldGasNotice';
import clsx from 'clsx';
import { ConfirmNotice } from '../ConfirmNotice';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { type ActionButtonProps, ActionConnectSwitch } from '../CommonActions';
import { GlpDepositNotice } from '../GlpNotices';
import { NotEnoughNotice } from '../NotEnoughNotice';
import { VaultFees } from '../VaultFees';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

const useStyles = makeStyles(styles);

export type DepositActionsProps = {
  className?: string;
};
export const DepositActions = memo<DepositActionsProps>(function DepositActions({ className }) {
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const option = quote ? quote.option : null;

  const isCowcentratedEmptyDeposit = quote
    ? isCowcentratedDepositQuote(quote) && quote.outputs[0].amount.eq(BIG_ZERO)
    : false;

  if (!option || !quote || quoteStatus !== TransactStatus.Fulfilled || isCowcentratedEmptyDeposit) {
    return <ActionDepositDisabled className={className} />;
  }

  return <ActionDeposit className={className} quote={quote} option={option} />;
});

const ActionDepositDisabled = memo<ActionButtonProps>(function ActionDepositDisabled({
  className,
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.feesContainer}>
      <Button
        variant="success"
        disabled={true}
        fullWidth={true}
        borderless={true}
        className={className}
      >
        {t('Transact-Deposit')}
      </Button>
      <VaultFees />
    </div>
  );
});

type ActionDepositProps = {
  option: TransactOption;
  quote: TransactQuote;
} & ActionButtonProps;
const ActionDeposit = memo<ActionDepositProps>(function ActionDeposit({
  option,
  quote,
  className,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByMaxNative, setIsDisabledByMaxNative] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByGlpLock, setIsDisabledByGlpLock] = useState(false);
  const [isDisabledByNotEnoughInput, setIsDisabledByNotEnoughInput] = useState(false);

  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);
  const isCowDepositQuote = isCowcentratedDepositQuote(quote);

  const isDisabled =
    isTxInProgress ||
    isDisabledByPriceImpact ||
    isDisabledByMaxNative ||
    isDisabledByConfirm ||
    isDisabledByGlpLock ||
    isDisabledByNotEnoughInput;

  const handleClick = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <div className={clsx(classes.actions, className)}>
      {option.chainId === 'emerald' ? <EmeraldGasNotice /> : null}
      <GlpDepositNotice vaultId={option.vaultId} onChange={setIsDisabledByGlpLock} />
      <PriceImpactNotice
        quote={quote}
        onChange={setIsDisabledByPriceImpact}
        hideCheckbox={isDisabledByNotEnoughInput}
      />
      <MaxNativeNotice quote={quote} onChange={setIsDisabledByMaxNative} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="deposit" onChange={setIsDisabledByNotEnoughInput} />
      <div className={classes.feesContainer}>
        <ActionConnectSwitch chainId={option.chainId}>
          <Button
            variant="success"
            disabled={isDisabled}
            fullWidth={true}
            borderless={true}
            onClick={handleClick}
          >
            {t(isMaxAll && !isCowDepositQuote ? 'Transact-DepositAll' : 'Transact-Deposit')}
          </Button>
        </ActionConnectSwitch>
        <VaultFees />
      </div>
    </div>
  );
});
