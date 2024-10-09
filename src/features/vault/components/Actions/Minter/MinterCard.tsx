import { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../../data/entities/vault';
import type { MinterEntity } from '../../../../data/entities/minter';
import {
  selectIsAddressBookLoaded,
  selectShouldInitAddressBook,
} from '../../../../data/selectors/data-loader';
import { selectIsWalletKnown, selectWalletAddress } from '../../../../data/selectors/wallet';
import { selectMinterById } from '../../../../data/selectors/minters';
import MintBurnCard from './MintBurnCard';
import { useAppDispatch, useAppSelector } from '../../../../../store';
import { LoadingIndicator } from '../../../../../components/LoadingIndicator';
import { Card } from '../../Card';
import { makeStyles } from '@material-ui/core';
import { isLoaderFulfilled } from '../../../../data/selectors/data-loader-helpers';
import { initiateMinterForm } from '../../../../data/actions/minters';
import { fetchAddressBookAction } from '../../../../data/actions/tokens';

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
  const dispatch = useAppDispatch();
  const isFormReady = useAppSelector(state => {
    const minterChain = state.ui.dataLoader.byChainId[minter.chainId];
    return (
      selectIsAddressBookLoaded(state, minter.chainId) &&
      minterChain &&
      isLoaderFulfilled(minterChain.contractData) &&
      isLoaderFulfilled(state.ui.dataLoader.global.minterForm)
    );
  });

  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : undefined
  );

  const shouldInitAddresBook = useAppSelector(state =>
    selectShouldInitAddressBook(state, minter.chainId)
  );

  // initialize our form
  useEffect(() => {
    if (shouldInitAddresBook) {
      dispatch(fetchAddressBookAction({ chainId: minter.chainId }));
    }

    dispatch(initiateMinterForm({ minterId, walletAddress }));
  }, [minterId, walletAddress, dispatch, minter.chainId, shouldInitAddresBook]);

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
