import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { StepHeader } from '../StepHeader';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types';
import { selectTransactQuoteIds } from '../../../../../data/selectors/transact';
import { Scrollable } from '../../../../../../components/Scrollable';
import { ListItem, ListItemProps } from './ListItem';

const useStyles = makeStyles(styles);

export const QuoteSelectStep = memo(function QuoteSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const quotes = useAppSelector(selectTransactQuoteIds);
  const handleBack = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.Form));
  }, [dispatch]);
  const handleSelect = useCallback<ListItemProps['onSelect']>(
    quoteId => {
      dispatch(transactActions.selectQuote({ quoteId }));
    },
    [dispatch]
  );

  return (
    <div className={classes.container}>
      <StepHeader onBack={handleBack}>{t('Transact-SelectProvider')}</StepHeader>
      <div className={classes.select}>
        <Scrollable className={classes.listContainer}>
          <div className={classes.list}>
            {quotes.map(quoteId => (
              <ListItem key={quoteId} quoteId={quoteId} onSelect={handleSelect} />
            ))}
          </div>
        </Scrollable>
      </div>
    </div>
  );
});
