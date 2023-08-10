import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bridgeActions, FormStep } from '../../../../../data/reducers/wallet/bridge';
import { SearchableList } from '../../../../../../components/SearchableList';
import { Step } from '../../../../../../components/Step';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectBridgeSupportedChainIds } from '../../../../../data/selectors/bridge';
import { ListItem } from '../ListItem';
import { BalanceEndAdornment } from '../BalanceEndAdornement';

const ChainSelector = memo(function ChainSelector() {
  const dispatch = useAppDispatch();
  const options = useAppSelector(selectBridgeSupportedChainIds);

  const handleSelect = useCallback(
    (chainId: string) => {
      dispatch(bridgeActions.setFromChain({ chainId }));
    },
    [dispatch]
  );

  return (
    <SearchableList
      options={options}
      onSelect={handleSelect}
      ItemInnerComponent={ListItem}
      EndComponent={BalanceEndAdornment}
    />
  );
});

export const SelectFromChainStep = memo(function SelectFromChainStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(bridgeActions.setStep({ step: FormStep.Preview }));
  }, [dispatch]);

  return (
    <Step stepType="bridge" onBack={handleBack} title={t('Bridge-FromChainStep-Title')}>
      <ChainSelector />
    </Step>
  );
});
