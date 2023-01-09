import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactOptionById,
  selectTransactQuoteStatus,
  selectTransactSelectedQuote,
} from '../../../../../data/selectors/transact';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet';
import { TransactOption, TransactQuote } from '../../../../../data/apis/transact/transact-types';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { PriceImpactNotice } from '../PriceImpactNotice';
import { MaxNativeNotice } from '../MaxNativeNotice';
import { transactSteps } from '../../../../../data/actions/transact';
import { EmeraldGasNotice } from '../EmeraldGasNotice';
import clsx from 'clsx';
import { ConfirmNotice } from '../ConfirmNotice';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { ActionButtonProps, ActionConnect, ActionSwitch } from '../CommonActions';
import { GlpDepositNotice } from '../GlpNotices';

const useStyles = makeStyles(styles);

export type DepositActionsProps = {
  className?: string;
};
export const DepositActions = memo<DepositActionsProps>(function DepositActions({ className }) {
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuote);
  const option = useAppSelector(state =>
    quote ? selectTransactOptionById(state, quote.optionId) : null
  );
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);

  if (!isWalletConnected) {
    return <ActionConnect className={className} />;
  }

  if (option && option.chainId !== connectedChainId) {
    return <ActionSwitch chainId={option.chainId} className={className} />;
  }

  if (!option || !quote || quoteStatus !== TransactStatus.Fulfilled) {
    return <ActionDepositDisabled className={className} />;
  }

  return <ActionDeposit className={className} quote={quote} option={option} />;
});

const ActionDepositDisabled = memo<ActionButtonProps>(function ({ className }) {
  const { t } = useTranslation();

  return (
    <Button
      variant="success"
      disabled={true}
      fullWidth={true}
      borderless={true}
      className={className}
    >
      {t('Transact-Deposit')}
    </Button>
  );
});

type ActionDepositProps = {
  option: TransactOption;
  quote: TransactQuote;
} & ActionButtonProps;
const ActionDeposit = memo<ActionDepositProps>(function ({ option, quote, className }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByMaxNative, setIsDisabledByMaxNative] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByGlpLock, setIsDisabledByGlpLock] = useState(false);
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);
  const isDisabled =
    isTxInProgress ||
    isDisabledByPriceImpact ||
    isDisabledByMaxNative ||
    isDisabledByConfirm ||
    isDisabledByGlpLock;
  const handleClick = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <div className={clsx(classes.actions, className)}>
      {option.chainId === 'emerald' ? <EmeraldGasNotice /> : null}
      <GlpDepositNotice vaultId={option.vaultId} onChange={setIsDisabledByGlpLock} />
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <MaxNativeNotice quote={quote} onChange={setIsDisabledByMaxNative} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <Button
        variant="success"
        disabled={isDisabled}
        fullWidth={true}
        borderless={true}
        onClick={handleClick}
      >
        {t(isMaxAll ? 'Transact-DepositAll' : 'Transact-Deposit')}
      </Button>
    </div>
  );
});
