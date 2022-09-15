import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../../../../../../components/Step';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectAllFiat, selectLastStep } from '../../../../../data/selectors/on-ramp';
import { SearchableList } from '../../../../../../components/SearchableList';
import { ItemInnerProps } from '../../../../../../components/SearchableList/ItemInner';
import { CurrencyFlag } from '../CurrencyFlag';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { setOnRampFiat } from '../../../../../data/actions/on-ramp';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';

const useStyles = makeStyles(styles);

export const FiatStep = memo(function () {
  const { t } = useTranslation();
  const lastStep = useAppSelector(selectLastStep);

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    const step = lastStep === FormStep.InputAmount ? FormStep.InputAmount : FormStep.SelectToken;
    dispatch(onRampFormActions.setStep({ step }));
  }, [dispatch, lastStep]);

  return (
    <Step stepType="onRamp" title={t('OnRamp-FiatStep-Title')} onBack={handleBack}>
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
