import { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../../data/entities/vault.ts';
import type { MinterEntity } from '../../../../data/entities/minter.ts';
import {
  selectIsAddressBookLoaded,
  selectShouldInitAddressBook,
} from '../../../../data/selectors/data-loader.ts';
import { selectIsWalletKnown, selectWalletAddress } from '../../../../data/selectors/wallet.ts';
import { selectMinterById } from '../../../../data/selectors/minters.ts';
import { useAppDispatch, useAppSelector } from '../../../../../store.ts';
import { LoadingIndicator } from '../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { Card } from '../../Card/Card.tsx';
import { isLoaderFulfilled } from '../../../../data/selectors/data-loader-helpers.ts';
import { initiateMinterForm } from '../../../../data/actions/minters.ts';
import { fetchAddressBookAction } from '../../../../data/actions/tokens.ts';
import { css } from '@repo/styles/css';
import { MintBurnCard } from './MintBurnCard/MintBurnCard.tsx';

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

const loadingCardContainerCss = css.raw({
  height: '580px',
});

export const LoadingCard = memo(function LoadingCard() {
  return (
    <Card css={loadingCardContainerCss}>
      <LoadingIndicator />
    </Card>
  );
});
