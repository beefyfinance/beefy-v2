import React, { FC, lazy, memo, Suspense, useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { VaultEntity } from '../../../data/entities/vault';
import { MinterEntity } from '../../../data/entities/minter';
import { BeefyState } from '../../../../redux-types';
import { selectIsAddressBookLoaded } from '../../../data/selectors/data-loader';
import { Loader } from '../../../../components/loader';
import { isFulfilled } from '../../../data/reducers/data-loader';
import { selectIsWalletConnected, selectWalletAddress } from '../../../data/selectors/wallet';
import { initMinterForm } from '../../../data/actions/scenarios';
import { selectMinterById } from '../../../data/selectors/minters';

export interface MinterCardParams {
  vaultId: VaultEntity['id'];
  minterId: MinterEntity['id'];
}

function importMinterCard(minterId: MinterEntity['id']) {
  return lazy<FC<MinterCardParams>>(() => import(`./Cards/${minterId}`));
}

const MinterCardImporter = memo(function MinterCardImporter({
  vaultId,
  minterId,
}: MinterCardParams) {
  const Card = importMinterCard(minterId);

  return <Card vaultId={vaultId} minterId={minterId} />;
});

export const MinterCard = memo(function MinterCard({ vaultId, minterId }: MinterCardParams) {
  const minter = useSelector((state: BeefyState) => selectMinterById(state, minterId));
  const isFormReady = useSelector(
    (state: BeefyState) =>
      selectIsAddressBookLoaded(state, minter.chainId) &&
      isFulfilled(state.ui.dataLoader.global.minterForm)
  );
  const walletAddress = useSelector((state: BeefyState) =>
    selectIsWalletConnected(state) ? selectWalletAddress(state) : null
  );

  // initialize our form
  const store = useStore();
  useEffect(() => {
    initMinterForm(store, minterId, walletAddress);
  }, [store, minterId, walletAddress]);

  return (
    <Suspense fallback={<Loader />}>
      {isFormReady ? <MinterCardImporter vaultId={vaultId} minterId={minterId} /> : <Loader />}
    </Suspense>
  );
});
