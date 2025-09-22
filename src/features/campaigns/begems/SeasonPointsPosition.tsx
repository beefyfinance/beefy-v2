import { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../data/store/hooks.ts';
import type { SeasonBoxProps } from './types.ts';
import { selectWalletAddress } from '../../data/selectors/wallet.ts';
import { ConnectWallet } from './components/ConnectWallet.tsx';
import { PointsPosition } from './components/PointsPosition.tsx';
import {
  selectBeGemsPointsSeasonData,
  selectBeGemsPointsUserSeasonData,
} from '../../data/selectors/campaigns/begems.ts';
import { styled } from '@repo/styles/jsx';
import { fetchUserPointsSeasonData } from '../../data/actions/campaigns/begems.ts';

const SeasonPointsPosition = memo(function SeasonPointsPosition({ season }: SeasonBoxProps) {
  const walletAddress = useAppSelector(selectWalletAddress);
  if (!walletAddress) {
    return <ConnectWallet />;
  }

  return <PointsDisplay season={season} address={walletAddress} />;
});

type PointsDisplayProps = {
  address: string;
  season: number;
};

const PointsDisplay = memo(function PointsDisplay({ season, address }: PointsDisplayProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => selectBeGemsPointsSeasonData(state, season));
  const user = useAppSelector(state => selectBeGemsPointsUserSeasonData(state, address, season));
  const isPlaceholder = !!data.placeholder;

  useEffect(() => {
    if (address) {
      dispatch(fetchUserPointsSeasonData({ season, address }));
    }
  }, [dispatch, season, address]);

  return (
    <Blur enabled={isPlaceholder}>
      <PointsPosition
        position={isPlaceholder ? 0 : user.position}
        points={isPlaceholder ? 0 : user.points}
        totalPoints={isPlaceholder ? 0 : data.totalPoints}
        totalUsers={isPlaceholder ? 0 : data.totalUsers}
      />
    </Blur>
  );
});

const Blur = styled('div', {
  base: {
    width: '100%',
  },
  variants: {
    enabled: {
      true: {
        filter: 'blur(8px)',
        pointerEvents: 'none',
      },
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default SeasonPointsPosition;
