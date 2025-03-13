import { memo, useCallback } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useTranslation } from 'react-i18next';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectQuoteByProvider,
  selectSortedQuoteProviders,
} from '../../../../../data/selectors/on-ramp.ts';
import { useDispatch } from 'react-redux';
import { SearchableList } from '../../../../../../components/SearchableList/SearchableList.tsx';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { ProviderIcon } from '../ProviderIcon/ProviderIcon.tsx';
import { PROVIDERS } from '../../providers.tsx';
import type { ItemInnerProps } from '../../../../../../components/SearchableList/Item.tsx';

const useStyles = legacyMakeStyles(styles);

export const SelectProviderStep = memo(function SelectProviderStep() {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.InputAmount }));
  }, [dispatch]);

  return (
    <Step
      stepType="onRamp"
      title={t('OnRamp-SelectProviderStep-Title')}
      onBack={handleBack}
      noPadding={true}
    >
      <ProviderSelector />
    </Step>
  );
});

const ListItem = memo(function ListItem({ value }: ItemInnerProps) {
  const classes = useStyles();
  const quote = useAppSelector(state => selectQuoteByProvider(state, value));

  return (
    <>
      <ProviderIcon provider={quote.provider} css={styles.icon} />
      <div className={classes.provider}>{PROVIDERS[quote.provider].title}</div>
      <div className={classes.rate}>
        1 {quote.token} = {(1 / quote.rate).toFixed(2)} {quote.fiat}
      </div>
    </>
  );
});

const ProviderSelector = memo(function ProviderSelector() {
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
