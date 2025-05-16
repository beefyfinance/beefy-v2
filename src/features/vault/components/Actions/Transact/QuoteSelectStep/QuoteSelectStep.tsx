import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSelectQuote, transactSwitchStep } from '../../../../../data/actions/transact.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectTransactQuoteIds } from '../../../../../data/selectors/transact.ts';
import { StepHeader } from '../StepHeader/StepHeader.tsx';
import type { ListItemProps } from './ListItem/ListItem.tsx';
import { ListItem } from './ListItem/ListItem.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export const QuoteSelectStep = memo(function QuoteSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const quotes = useAppSelector(selectTransactQuoteIds);
  const handleBack = useCallback(() => {
    dispatch(transactSwitchStep(TransactStep.Form));
  }, [dispatch]);
  const handleSelect = useCallback<ListItemProps['onSelect']>(
    quoteId => {
      dispatch(transactSelectQuote({ quoteId }));
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
