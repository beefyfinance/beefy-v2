import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { memo, useEffect } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactInputAmount,
  selectTransactMode,
  selectTransactSelectedChainId,
  selectTransactSelectedTokensId,
} from '../../../../../data/selectors/transact';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

const useStyles = makeStyles(styles);

export type DepositQuoteProps = {
  className?: string;
};
export const DepositQuote = memo<DepositQuoteProps>(function DepositQuote({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const inputAmount = useAppSelector(selectTransactInputAmount);
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const tokensId = useAppSelector(selectTransactSelectedTokensId);

  useEffect(() => {
    if (inputAmount.lte(BIG_ZERO)) {
      // dispatch(clearQuotes);
    } else {
      // dispatch(fetchQuotes);
    }
  }, [dispatch, mode, chainId, tokensId, inputAmount]);

  return <div className={clsx(classes.container, className)}>quote...</div>;
});
