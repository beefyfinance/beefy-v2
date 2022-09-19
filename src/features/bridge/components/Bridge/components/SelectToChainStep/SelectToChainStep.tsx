import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bridgeActions, FormStep } from '../../../../../data/reducers/wallet/bridge';
import { SearchableList } from '../../../../../../components/SearchableList';
import { Step } from '../../../../../../components/Step';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectBridgeState,
  selectBridgeSuportedChains,
} from '../../../../../data/selectors/bridge';
import { ListItem } from '../ListItem';
import { ChainEntity } from '../../../../../data/entities/chain';

export const _SelectToChainStep = () => {
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
};

export const SelectToChainStep = memo(_SelectToChainStep);

const ChainSelector = memo(function () {
  const bridgeState = useAppSelector(selectBridgeState);
  const options = useAppSelector(selectBridgeSuportedChains);

  const filteredOptions = options.filter(
    (chainId: ChainEntity['id']) => chainId !== bridgeState.fromChainId
  );
  const dispatch = useAppDispatch();
  const handleSelect = useCallback(
    (chainId: string) => {
      dispatch(bridgeActions.setDestChain({ destChainId: chainId }));
    },
    [dispatch]
  );

  return (
    <SearchableList
      options={filteredOptions}
      onSelect={handleSelect}
      ItemInnerComponent={ListItem}
    />
  );
});
