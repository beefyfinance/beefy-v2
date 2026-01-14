import { memo, useCallback } from 'react';
import type { SelectError } from '../../features/data/reducers/wallet/wallet-types.ts';
import { useAppDispatch } from '../../features/data/store/hooks.ts';
import { walletSelectBack } from '../../features/data/actions/wallet.ts';
import type { BaseWalletStepProps } from './types.ts';
import { Button } from '../Button/Button.tsx';
import { styled } from '@repo/styles/jsx';
import { Box } from './Box.tsx';

export type StepErrorProps = BaseWalletStepProps & {
  select: SelectError;
};

export const StepError = memo(function StepError({
  Layout,
  select,
  hideIntroduction = false,
}: StepErrorProps) {
  const { error } = select;
  const dispatch = useAppDispatch();
  const handleBack = useCallback(() => {
    dispatch(walletSelectBack());
  }, [dispatch]);

  return (
    <Layout
      content={
        <Box variant="error" align="top" title="Error" iconUrl={select.wallet.iconUrl}>
          <ErrorMessage>{error.message}</ErrorMessage>
        </Box>
      }
      button={
        <Button onClick={handleBack} fullWidth={true}>
          Back
        </Button>
      }
      hideIntroduction={hideIntroduction}
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
