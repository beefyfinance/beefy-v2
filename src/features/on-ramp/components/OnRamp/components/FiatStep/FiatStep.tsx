import { memo, useCallback, useMemo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectAllFiat, selectLastStep } from '../../../../../data/selectors/on-ramp.ts';
import { SearchableList } from '../../../../../../components/SearchableList/SearchableList.tsx';
import { CurrencyFlag } from '../CurrencyFlag/CurrencyFlag.tsx';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { setOnRampFiat } from '../../../../../data/actions/on-ramp.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import type { ItemInnerProps } from '../../../../../../components/SearchableList/Item.tsx';

const useStyles = legacyMakeStyles(styles);

export const FiatStep = memo(function FiatStep() {
  const { t } = useTranslation();
  const lastStep = useAppSelector(selectLastStep);

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    const step = lastStep === FormStep.InputAmount ? FormStep.InputAmount : FormStep.SelectToken;
    dispatch(onRampFormActions.setStep({ step }));
  }, [dispatch, lastStep]);

  return (
    <Step stepType="onRamp" title={t('OnRamp-FiatStep-Title')} onBack={handleBack} noPadding={true}>
      <FiatSelector />
    </Step>
  );
});

const ListItem = memo(function ListItem({ value }: ItemInnerProps) {
  const classes = useStyles();
  return (
    <>
      <CurrencyFlag currencyCode={value} width={24} className={classes.listItemIcon} />
      {value}
    </>
  );
});

const FiatSelector = memo(function FiatSelector() {
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
