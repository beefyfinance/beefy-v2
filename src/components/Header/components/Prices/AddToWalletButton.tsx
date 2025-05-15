import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { addTokenToWalletAction } from '../../../../features/data/actions/add-to-wallet.ts';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { useAppDispatch } from '../../../../features/data/store/hooks.ts';
import AccountBalanceWallet from '../../../../images/icons/mui/AccountBalanceWallet.svg?react';
import { ActionButton } from './Action.tsx';

type AddToWalletButtonProps = {
  title: string;
  tokenAddress: string;
  customIconUrl: string;
  chainId: ChainEntity['id'];
};

export const AddToWalletButton = memo<AddToWalletButtonProps>(function AddToWallet({
  tokenAddress,
  customIconUrl,
  title,
  chainId,
}) {
  const dispatch = useAppDispatch();
  const handleAddToken = useCallback(() => {
    dispatch(
      addTokenToWalletAction({
        tokenAddress,
        chainId,
        customIconUrl,
      })
    );
  }, [dispatch, tokenAddress, chainId, customIconUrl]);

  return (
    <ActionButton title={title} onClick={handleAddToken}>
      <AddToWalletIcon />
    </ActionButton>
  );
});

const AddToWalletIcon = styled(AccountBalanceWallet, {
  base: {
    fontSize: '20px',
    width: '20px',
    height: '20px',
    fill: 'currentColor',
  },
});
