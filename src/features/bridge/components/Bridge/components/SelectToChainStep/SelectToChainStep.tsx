import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bridgeActions, FormStep } from '../../../../../data/reducers/wallet/bridge';
import { SearchableList } from '../../../../../../components/SearchableList';
import { Step } from '../../../../../../components/Step';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectBridgeFormState,
  selectBridgeSupportedChainIdsFrom,
} from '../../../../../data/selectors/bridge';
import { ChainListItem } from '../ListItem';
import type { ChainEntity } from '../../../../../data/entities/chain';

const ChainSelector = memo(function ChainSelector() {
  const dispatch = useAppDispatch();
  const { from } = useAppSelector(selectBridgeFormState);
  const options = useAppSelector(state => selectBridgeSupportedChainIdsFrom(state, from));

  const handleSelect = useCallback(
    (chainId: ChainEntity['id']) => {
      dispatch(bridgeActions.setToChain({ chainId }));
    },
    [dispatch]
  );

  return (
    <SearchableList options={options} onSelect={handleSelect} ItemInnerComponent={ChainListItem} />
  );
});

export const SelectToChainStep = memo(function SelectToChainStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(bridgeActions.setStep({ step: FormStep.Preview }));
  }, [dispatch]);

  return (
    <Step stepType="bridge" onBack={handleBack} title={t('Bridge-ToChainStep-Title')}>
      <ChainSelector />
    </Step>
  );
});
