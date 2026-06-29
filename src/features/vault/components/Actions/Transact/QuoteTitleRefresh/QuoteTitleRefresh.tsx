import { type CssStyles } from '@repo/styles/css';
import { memo, useCallback } from 'react';
import { ReloadSpinner } from '../../../../../../components/ReloadSpinner/ReloadSpinner.tsx';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { transactFetchQuotes } from '../../../../../data/actions/transact.ts';
import { styled } from '@repo/styles/jsx';

export type QuoteTitleRefreshProps = {
  title: string;
  enableRefresh?: boolean;
  autoRefresh?: boolean;
  autoRefreshSeconds?: number;
  onRefresh?: () => void;
  css?: CssStyles;
};
export const QuoteTitleRefresh = memo(function QuoteTitleRefresh({
  title,
  enableRefresh = false,
  autoRefresh = false,
  autoRefreshSeconds,
  onRefresh,
  css: cssProp,
}: QuoteTitleRefreshProps) {
  const dispatch = useAppDispatch();
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
      return;
    }

    dispatch(transactFetchQuotes());
  }, [dispatch, onRefresh]);

  return (
    <Holder css={cssProp}>
      <Title>{title}</Title>
      {enableRefresh ?
        <ReloadSpinner
          autoRefresh={autoRefresh}
          autoRefreshSeconds={autoRefreshSeconds}
          onClick={handleRefresh}
        />
      : null}
    </Holder>
  );
});

const Holder = styled('div', {
  base: {
    display: 'flex',
    gap: '16px',
    marginBottom: '8px',
  },
});

const Title = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.dark',
  },
});
