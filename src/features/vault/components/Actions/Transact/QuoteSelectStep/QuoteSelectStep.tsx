import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { StepHeader } from '../StepHeader/StepHeader.tsx';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectTransactQuoteIds } from '../../../../../data/selectors/transact.ts';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import type { ListItemProps } from './ListItem/ListItem.tsx';
import { ListItem } from './ListItem/ListItem.tsx';

const useStyles = legacyMakeStyles(styles);

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
    <div>
      <StepHeader onBack={handleBack}>{t('Transact-SelectProvider')}</StepHeader>
      <div className={classes.select}>
        <Scrollable css={styles.listContainer}>
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
