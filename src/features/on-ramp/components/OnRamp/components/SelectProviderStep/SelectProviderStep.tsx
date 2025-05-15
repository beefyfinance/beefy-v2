import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import type { ItemInnerProps } from '../../../../../../components/SearchableList/Item.tsx';
import { SearchableList } from '../../../../../../components/SearchableList/SearchableList.tsx';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import {
  selectQuoteByProvider,
  selectSortedQuoteProviders,
} from '../../../../../data/selectors/on-ramp.ts';
import { PROVIDERS } from '../../providers.tsx';
import { ProviderIcon } from '../ProviderIcon/ProviderIcon.tsx';
import { styles } from './styles.ts';

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
