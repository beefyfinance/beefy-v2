import type { WalletOption } from '../../features/data/apis/wallet/wallet-connection-types.ts';
import { memo, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { walletConnectTo } from '../../features/data/actions/wallet.ts';
import {
  selectWalletOptions,
  selectWalletSelectActive,
} from '../../features/data/selectors/wallet.ts';
import { styled } from '@repo/styles/jsx';
import { VerticalScrollShadows } from '../ScrollShadows/VerticalScrollShadows.tsx';
import { WalletIcon } from './WalletIcon.tsx';

type WalletItemProps = {
  disabled?: boolean;
  active?: boolean;
  grid?: boolean;
  wallet: WalletOption;
};

const WalletItem = memo(
  ({
    wallet: { id, name, iconUrl, iconBackground, rdns, type },
    grid = false,
  }: WalletItemProps) => {
    const dispatch = useAppDispatch();
    const handleConnect = useCallback(() => {
      dispatch(walletConnectTo({ id }));
    }, [id, dispatch]);

    return (
      <Button data-id={id} data-rdns={rdns} data-type={type} grid={grid} onClick={handleConnect}>
        <WalletIcon src={iconUrl} background={iconBackground} />
        {name}
      </Button>
    );
  }
);

type WalletListProps = {
  grid?: boolean;
  disabled?: boolean;
};

export const WalletList = memo(function WalletList({
  disabled = false,
  grid = false,
}: WalletListProps) {
  const wallets = useAppSelector(selectWalletOptions);
  const activeId = useAppSelector(selectWalletSelectActive);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <VerticalScrollShadows scrollContainerRef={scrollContainerRef}>
      <List ref={scrollContainerRef} grid={grid}>
        {wallets.map(wallet => (
          <WalletItem
            key={wallet.id}
            wallet={wallet}
            grid={grid}
            disabled={disabled}
            active={wallet.id === activeId}
          />
        ))}
        {wallets.map(wallet => (
          <WalletItem
            key={wallet.id}
            wallet={wallet}
            grid={grid}
            disabled={disabled}
            active={wallet.id === activeId}
          />
        ))}
      </List>
    </VerticalScrollShadows>
  );
});

const List = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px 16px',
    overflowY: 'auto',
    flex: '0 1 auto',
    minHeight: 0,
    width: '100%',
  },
  variants: {
    grid: {
      true: {
        '--icon-size': '32px',
        // '--icon-padding': '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
        padding: '16px',
      },
    },
  },
});

const Button = styled('button', {
  base: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    whiteSpace: 'wrap',
    color: 'text.light',
    width: '100%',
  },
  variants: {
    grid: {
      true: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
        padding: '8px',
        borderRadius: '8px',
        background: 'background.content.light',
        _hover: {
          background: 'background.content.gray',
        },
      },
    },
  },
});
