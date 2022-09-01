import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../Step';
import { useTranslation } from 'react-i18next';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { useAppSelector } from '../../../../../../store';
import {
  selectQuoteByProvider,
  selectSortedQuoteProviders,
} from '../../../../../data/selectors/on-ramp';
import { useDispatch } from 'react-redux';
import { SearchableList } from '../SearchableList';
import { ItemInnerProps } from '../SearchableList/ItemInner';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { ProviderIcon } from '../ProviderIcon';
import { PROVIDERS } from '../../providers';

const useStyles = makeStyles(styles);

export const SelectProviderStep = memo(function () {
  const { t } = useTranslation();

  return (
    <Step title={t('OnRamp-SelectProviderStep-Title')} backStep={FormStep.InputAmount}>
      <ProviderSelector />
    </Step>
  );
});

const ListItem = memo<ItemInnerProps>(function ({ value }) {
  const classes = useStyles();
  const quote = useAppSelector(state => selectQuoteByProvider(state, value));

  return (
    <>
      <ProviderIcon provider={quote.provider} className={classes.icon} />
      <div className={classes.provider}>{PROVIDERS[quote.provider].title}</div>
      <div className={classes.rate}>
        1 {quote.token} = {(1 / quote.rate).toFixed(2)} {quote.fiat}
      </div>
    </>
  );
});

const ProviderSelector = memo(function () {
  const providers = useAppSelector(selectSortedQuoteProviders);
  const dispatch = useDispatch();

  const handleSelect = useCallback(
    (provider: string) => {
      dispatch(onRampFormActions.selectProvider({ provider }));
    },
    [dispatch]
  );

  return (
    <>
      <SearchableList options={providers} onSelect={handleSelect} ItemInnerComponent={ListItem} />
    </>
  );
});
