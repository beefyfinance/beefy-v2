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
import { fetchBridgeChainData } from '../../../../../data/actions/bridge';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const _SelectFromChainStep = () => {
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

export const SelectFromChainStep = memo(_SelectFromChainStep);

const ChainSelector = memo(function () {
  const bridgeState = useAppSelector(selectBridgeState);

  const options = useAppSelector(selectBridgeSuportedChains);

  const dispatch = useAppDispatch();

  const handleSelect = useCallback(
    (chainId: string) => {
      if (!bridgeState.bridgeDataByChainId[chainId]) {
        dispatch(fetchBridgeChainData({ chainId }));
      }
      dispatch(bridgeActions.setFromChain({ chainId }));
    },
    [bridgeState.bridgeDataByChainId, dispatch]
  );

  return <SearchableList options={options} onSelect={handleSelect} ItemInnerComponent={ListItem} />;
});
