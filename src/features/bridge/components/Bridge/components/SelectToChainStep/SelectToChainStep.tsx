import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bridgeActions, FormStep } from '../../../../../data/reducers/wallet/bridge';
import { SearchableList } from '../../../../../../components/SearchableList';
import { Step } from '../Step';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectBridgeState,
  selectBridgeSuportedChains,
} from '../../../../../data/selectors/bridge';
import { ListItem } from '../ListItem';
import { ChainEntity } from '../../../../../data/entities/chain';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const _SelectToChainStep = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Step
      contentClass={classes.customHeight}
      backStep={FormStep.Preview}
      title={t('Bridge-FromChainStep-Title')}
    >
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
