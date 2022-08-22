import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../Step';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectAllFiat, selectLastStep } from '../../../../../data/selectors/on-ramp';
import { SearchableList } from '../SearchableList';
import { ItemInnerProps } from '../SearchableList/ItemInner';
import { CurrencyFlag } from '../CurrencyFlag';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { setOnRampFiat } from '../../../../../data/actions/on-ramp';

const useStyles = makeStyles(styles);

export const FiatStep = memo(function () {
  const { t } = useTranslation();
  const lastStep = useAppSelector(selectLastStep);

  return (
    <Step
      title={t('OnRamp-FiatStep-Title')}
      backStep={lastStep === FormStep.InputAmount ? FormStep.InputAmount : FormStep.SelectToken}
    >
      <FiatSelector />
    </Step>
  );
});

const ListItem = memo<ItemInnerProps>(function ({ value }) {
  const classes = useStyles();
  return (
    <>
      <CurrencyFlag currencyCode={value} width={24} className={classes.listItemIcon} />
      {value}
    </>
  );
});

const FiatSelector = memo(function () {
  const currencies = useAppSelector(selectAllFiat);
  const sortedCurrencies = useMemo(() => [...currencies].sort(), [currencies]);
  const dispatch = useAppDispatch();

  const handleSelect = useCallback(
    (fiat: string) => {
      dispatch(setOnRampFiat({ fiat }));
    },
    [dispatch]
  );

  return (
    <>
      <SearchableList
        options={sortedCurrencies}
        onSelect={handleSelect}
        ItemInnerComponent={ListItem}
      />
    </>
  );
});
