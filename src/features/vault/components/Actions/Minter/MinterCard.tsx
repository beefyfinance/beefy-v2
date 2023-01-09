import React, { memo, Suspense, useEffect } from 'react';
import { VaultEntity } from '../../../../data/entities/vault';
import { MinterEntity } from '../../../../data/entities/minter';
import { selectIsAddressBookLoaded } from '../../../../data/selectors/data-loader';
import { Loader } from '../../../../../components/Loader';
import { selectIsWalletKnown, selectWalletAddress } from '../../../../data/selectors/wallet';
import { initMinterForm } from '../../../../data/actions/scenarios';
import { selectMinterById } from '../../../../data/selectors/minters';
import MintBurnCard from './MintBurnCard';
import { useAppSelector, useAppStore } from '../../../../../store';
import { isFulfilled } from '../../../../data/reducers/data-loader-types';

export interface MinterCardParams {
  vaultId: VaultEntity['id'];
  minterId: MinterEntity['id'];
}

export const MinterCard = memo(function MinterCard({ vaultId, minterId }: MinterCardParams) {
  const minter = useAppSelector(state => selectMinterById(state, minterId));
  const isFormReady = useAppSelector(
    state =>
      selectIsAddressBookLoaded(state, minter.chainId) &&
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
    <Suspense fallback={<Loader />}>
      {isFormReady ? <MintBurnCard vaultId={vaultId} minterId={minterId} /> : <Loader />}
    </Suspense>
  );
});
