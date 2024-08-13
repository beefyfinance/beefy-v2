import { memo, useCallback } from 'react';
import type {
  TransactOption,
  TransactQuote,
} from '../../../features/data/apis/transact/transact-types';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../store';
import { tenderlySimulateTransactQuote } from '../../../features/data/actions/tenderly';
import { TenderlyButton } from './TenderlyButton';

export type TenderlyTransactButtonProps = {
  option: TransactOption;
  quote: TransactQuote;
};

export const TenderlyTransactButton = memo<TenderlyTransactButtonProps>(
  function TenderlyTransactButton({ option, quote }) {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const handleClick = useCallback(() => {
      dispatch(tenderlySimulateTransactQuote({ option, quote, t }));
    }, [dispatch, t, option, quote]);

    return <TenderlyButton chainId={option.chainId} onClick={handleClick} />;
  }
);
