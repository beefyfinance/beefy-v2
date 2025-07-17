import { memo, useCallback } from 'react';
import { TextLoader } from '../../../../components/TextLoader/TextLoader.tsx';
import { formatNumber } from '../../../../helpers/format.ts';
import { styled } from '@repo/styles/jsx';
import { useAppDispatch } from '../../../data/store/hooks.ts';
import { Link, useNavigate } from 'react-router';
import { filteredVaultsActions } from '../../../data/reducers/filtered-vaults.ts';
import { css } from '@repo/styles/css';

type PointsPositionProps = {
  points?: number;
  position?: number;
  totalPoints?: number;
  totalUsers?: number;
};

export const PointsPosition = memo(function PointsPosition({
  points,
  position,
  totalPoints,
  totalUsers,
}: PointsPositionProps) {
  const pointsFormatted =
    points !== undefined ? formatNumber(points, 0) : <TextLoader placeholder="0.00" />;
  const positionFormatted =
    position !== undefined ? formatNumber(position, 0) : <TextLoader placeholder="1,000" />;
  const totalPointsFormatted =
    totalPoints !== undefined ?
      formatNumber(totalPoints, 0)
    : <TextLoader placeholder="12,345,678" />;
  const totalUsersFormatted =
    totalUsers !== undefined ? formatNumber(totalUsers, 0) : <TextLoader placeholder="12,345" />;
  const showTotal = !!totalPoints && !!totalUsers;

  return (
    <Outer>
      <BackgroundGlow />
      <Foreground>
        <Points>{pointsFormatted} points</Points>
        <Position>
          {points === 0 ?
            <>
              <SonicVaultsLink /> to get beGEMS points
            </>
          : <>Your position: #{positionFormatted}</>}
        </Position>
        {showTotal && (
          <>
            <Seperator />
            <Total>
              {totalPointsFormatted} points distributed
              <br />
              across {totalUsersFormatted} users
            </Total>
          </>
        )}
      </Foreground>
    </Outer>
  );
});

const linkClass = css({
  color: 'orange.40',
  textDecoration: 'none',
  display: 'block',
});

const SonicVaultsLink = memo(function SonicVaultsLink() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
    dispatch(filteredVaultsActions.setChainIds(['sonic']));
    dispatch(
      filteredVaultsActions.setBoolean({
        filter: 'onlyEarningPoints',
        value: true,
      })
    );
    navigate('/');
  }, [dispatch, navigate]);

  return (
    <Link to="/" onClick={handleClick} className={linkClass}>
      Deposit on Sonic →
    </Link>
  );
});

const Outer = styled('div', {
  base: {
    position: 'relative',
    padding: '44px 24px 24px 24px',
  },
});

const BackgroundGlow = styled('div', {
  base: {
    width: '400px',
    height: '182px',
    position: 'absolute',
    left: '50%',
    top: '-24px', // 12px - 36px
    transform: 'translateX(-50%)',
    borderRadius: '160px',
    background: 'darkBlue.50',
    filter: 'blur(114px)',
    pointerEvents: 'none',
  },
});

const Foreground = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    textAlign: 'center',
  },
});

const Points = styled('div', {
  base: {
    textStyle: 'h1',
    fontWeight: 'bold',
    color: 'darkBlue.80',
    display: 'flex',
    minWidth: '80px',
    padding: '20px 24px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '56px',
    background: 'tags.boost.background',
    boxShadow: '0px 1px 0px 0px #000',
  },
});

const Position = styled('div', {
  base: {
    marginTop: '24px',
    textStyle: 'h3',
    gap: '8px',
    alignSelf: 'stretch',
    color: 'text.light',
  },
});

const Seperator = styled('div', {
  base: {
    height: '2px',
    width: '214px',
    background:
      'linear-gradient(180deg, {colors.white.90-24a} 0%, {colors.white.90-24a} 50%, {colors.darkBlue.90-56a} 50%, {colors.darkBlue.90-56a} 100%)',
    marginBlock: '8px',
  },
});

const Total = styled('div', {
  base: {
    textStyle: 'subline.sm',
    color: 'white.100-64a',
  },
});
