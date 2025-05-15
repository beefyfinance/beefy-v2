import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ItemInnerProps } from '../../../../../../components/SearchableList/Item.tsx';
import { SearchableList } from '../../../../../../components/SearchableList/SearchableList.tsx';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { setOnRampFiat } from '../../../../../data/actions/on-ramp.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { selectAllFiat, selectLastStep } from '../../../../../data/selectors/on-ramp.ts';
import { CurrencyFlag } from '../CurrencyFlag/CurrencyFlag.tsx';
import { styles } from './styles.ts';

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
