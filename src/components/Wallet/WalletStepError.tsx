import { memo, useCallback } from 'react';
import type { SelectError } from '../../features/data/reducers/wallet/wallet-types.ts';
import { useAppDispatch } from '../../features/data/store/hooks.ts';
import { walletSelectBack } from '../../features/data/actions/wallet.ts';
import type { BaseWalletStepProps } from './types.ts';
import { Button } from '../Button/Button.tsx';
import { styled } from '@repo/styles/jsx';
import { Box } from './Box.tsx';

export type WalletStepConnectingProps = BaseWalletStepProps & {
  select: SelectError;
};

export const WalletStepError = memo(function WalletStepError({
  Layout,
  select,
}: WalletStepConnectingProps) {
  const { error } = select;
  const dispatch = useAppDispatch();
  const handleBack = useCallback(() => {
    dispatch(walletSelectBack());
  }, [dispatch]);

  return (
    <Layout
      title="Error"
      main={
        <Box variant="error" align="top">
          <ErrorMessage>{error.message}</ErrorMessage>
        </Box>
      }
      footer={
        <Button onClick={handleBack} fullWidth={true}>
          Back
        </Button>
      }
    />
  );
});

const ErrorMessage = styled('div', {
  base: {
    width: '100%',
    maxHeight: 'min(calc(50vw), 300px)',
    overflowX: 'hidden',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
    fontSize: 'body.sm',
  },
});
