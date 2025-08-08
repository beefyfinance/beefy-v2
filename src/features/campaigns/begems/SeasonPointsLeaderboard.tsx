import { memo, type ReactNode, useMemo } from 'react';
import { Leaderboard, type LeaderboardEntry } from './components/Leaderboard.tsx';
import { useAppSelector } from '../../data/store/hooks.ts';
import {
  selectBeGemsPointsSeasonData,
  selectBeGemsPointsUserSeasonData,
} from '../../data/selectors/campaigns/begems.ts';
import { styled } from '@repo/styles/jsx';
import { css, cx } from '@repo/styles/css';
import { selectWalletAddress } from '../../data/selectors/wallet.ts';
import StopwatchIcon from '../../../images/icons/stopwatch.svg?react';
import InfoIcon from '../../../images/icons/info-rounded-square.svg?react';
import { DivWithTooltip } from '../../../components/Tooltip/DivWithTooltip.tsx';
import { BasicTooltipContent } from '../../../components/Tooltip/BasicTooltipContent.tsx';

export type SeasonPointsLeaderboardProps = {
  season: number;
};

export const SeasonPointsLeaderboard = memo(function SeasonPointsLeaderboard({
  season,
}: SeasonPointsLeaderboardProps) {
  const address = useAppSelector(selectWalletAddress);
  const data = useAppSelector(state => selectBeGemsPointsSeasonData(state, season));
  const user = useAppSelector(state => selectBeGemsPointsUserSeasonData(state, address, season));
  const isPlaceholder = !!data.placeholder;
  const entries = useMemo((): LeaderboardEntry[] => {
    const items: LeaderboardEntry[] = [...data.top, ...data.bottom];
    if (
      !address ||
      !user ||
      !user.position ||
      !user.points ||
      user.position <= 0 ||
      user.points <= 0
    ) {
      return items;
    }

    return [
      ...items.filter(item => item.address !== address),
      {
        position: user.position,
        address,
        points: user.points,
        highlight: true,
      },
    ].sort((a, b) => a.position - b.position);
  }, [data.top, data.bottom, user, address]);

  return (
    <Layout>
      <Top>
        <Title>Leaderboard</Title>
        {!isPlaceholder && (
          <SubTitle
            placement="bottom"
            tooltip={
              <BasicTooltipContent title="Points will be displayed the day after your deposit and updated daily after that" />
            }
          >
            Data updates daily <InfoIcon className={iconClass} />
          </SubTitle>
        )}
      </Top>
      <Bottom placeholder={isPlaceholder}>
        <Leaderboard entries={entries} />
      </Bottom>
    </Layout>
  );
});

const iconClass = css({
  height: '1em',
  width: '1em',
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingBottom: '24px', // 32px + 24px = 56px
    sm: {
      paddingBottom: '16px',
    },
  },
});

const Top = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '12px',
    gap: '6px',
    md: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      width: '100%',
      marginBottom: '16px',
    },
  },
});

const Title = styled('h2', {
  base: {
    color: 'text.light',
  },
});

const SubTitle = styled(DivWithTooltip, {
  base: {
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    gap: '0.4em',
    alignItems: 'center',
  },
});

const bottomClass = css({
  position: 'relative',
  width: '100%',
});

const blurClass = css({
  filter: 'blur(5.5px)',
  pointerEvents: 'none',
});

type BottomProps = {
  children: ReactNode;
  placeholder: boolean;
};

const Bottom = memo(function Bottom({ children, placeholder = false }: BottomProps) {
  return (
    <div className={bottomClass}>
      <div className={cx(placeholder && blurClass)}>{children}</div>
      {placeholder && (
        <Notice>
          <StopwatchIcon /> Points will be displayed soon
        </Notice>
      )}
    </div>
  );
});

const Notice = styled('div', {
  base: {
    display: 'flex',
    padding: '0px 8px',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    position: 'absolute',
    left: '50%',
    top: '20%',
    transform: 'translateX(-50%)',
    color: 'orange.40',
    textAlign: 'center',
    textStyle: 'subline.sm',
    width: '100%',
  },
});
