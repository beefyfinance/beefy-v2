import React, { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../../data/entities/vault';
import type { MinterEntity } from '../../../../data/entities/minter';
import { selectIsAddressBookLoaded } from '../../../../data/selectors/data-loader';
import { selectIsWalletKnown, selectWalletAddress } from '../../../../data/selectors/wallet';
import { initMinterForm } from '../../../../data/actions/scenarios';
import { selectMinterById } from '../../../../data/selectors/minters';
import MintBurnCard from './MintBurnCard';
import { useAppSelector, useAppStore } from '../../../../../store';
import { isFulfilled } from '../../../../data/reducers/data-loader-types';
import { LoadingIndicator } from '../../../../../components/LoadingIndicator';
import { Card } from '../../Card';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  loadingCardContainer: {
    height: '580px',
  },
}));

export interface MinterCardParams {
  vaultId: VaultEntity['id'];
  minterId: MinterEntity['id'];
}

export const MinterCard = memo(function MinterCard({ vaultId, minterId }: MinterCardParams) {
  const minter = useAppSelector(state => selectMinterById(state, minterId));
  const isFormReady = useAppSelector(
    state =>
      selectIsAddressBookLoaded(state, minter.chainId) &&
      isFulfilled(state.ui.dataLoader.byChainId[minter.chainId].contractData) &&
      isFulfilled(state.ui.dataLoader.global.minterForm)
  );
  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  // initialize our form
  const store = useAppStore();
  useEffect(() => {
    initMinterForm(store, minterId, walletAddress);
  }, [store, minterId, walletAddress]);

  return (
    <>{isFormReady ? <MintBurnCard vaultId={vaultId} minterId={minterId} /> : <LoadingCard />}</>
  );
});

export const LoadingCard = memo(function LoadingCard() {
  const classes = useStyles();
  return (
    <Card className={classes.loadingCardContainer}>
      <LoadingIndicator />
    </Card>
  );
});
