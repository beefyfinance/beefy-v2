import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { tenderlySimulateTransactQuote } from '../../../features/data/actions/tenderly.ts';
import type {
  TransactOption,
  TransactQuote,
} from '../../../features/data/apis/transact/transact-types.ts';
import { useAppDispatch } from '../../../features/data/store/hooks.ts';
import { TenderlyButton } from './TenderlyButton.tsx';

export type TenderlyTransactButtonProps = {
  option: TransactOption;
  quote: TransactQuote;
};

export const TenderlyTransactButton = memo(function TenderlyTransactButton({
  option,
  quote,
}: TenderlyTransactButtonProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const handleClick = useCallback(() => {
    dispatch(tenderlySimulateTransactQuote({ option, quote, t }));
  }, [dispatch, t, option, quote]);

  return <TenderlyButton chainId={option.chainId} onClick={handleClick} />;
});
