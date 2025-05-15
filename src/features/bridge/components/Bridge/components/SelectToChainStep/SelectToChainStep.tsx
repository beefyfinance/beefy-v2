import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchableList } from '../../../../../../components/SearchableList/SearchableList.tsx';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { FormStep } from '../../../../../data/reducers/wallet/bridge-types.ts';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge.ts';
import {
  selectBridgeFormState,
  selectBridgeSupportedChainIdsFrom,
} from '../../../../../data/selectors/bridge.ts';
import { ChainListItem } from '../ListItem/ChainListItem.tsx';

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
    <Step
      stepType="bridge"
      onBack={handleBack}
      title={t('Bridge-ToChainStep-Title')}
      noPadding={true}
    >
      <ChainSelector />
    </Step>
  );
});
