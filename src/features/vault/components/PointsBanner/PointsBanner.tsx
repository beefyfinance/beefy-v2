import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton/LinkButton.tsx';
import { MarkdownText } from '../../../components/Markdown/MarkdownText.tsx';
import type { PointStructureBannerConfig } from '../../../data/apis/points/types.ts';
import type { ChainEntity } from '../../../data/entities/chain.ts';
import BoostIcon from '../../../../images/icons/boost.svg?react';
import { getNetworkSrc } from '../../../../helpers/networkSrc.ts';

const ICON_SIZE = 24;

type HeaderIconProps = {
  chainIcon: string | undefined;
};

const HeaderIcon = memo(function HeaderIcon({ chainIcon }: HeaderIconProps) {
  const url = chainIcon && getNetworkSrc(chainIcon as ChainEntity['id']);
  if (url) {
    return <ChainIconImg src={url} width={ICON_SIZE} height={ICON_SIZE} alt="" />;
  }
  if (import.meta.env.DEV && chainIcon && !url) {
    console.warn(
      `PointsBanner: no chain icon found for "${chainIcon}", falling back to flame. Check src/images/networks/ for a matching SVG.`
    );
  }
  return <BoostIcon width={ICON_SIZE} height={ICON_SIZE} />;
});

export type PointsBannerProps = {
  banner: PointStructureBannerConfig;
};

export const PointsBanner = memo(function PointsBanner({ banner }: PointsBannerProps) {
  const { t } = useTranslation();

  return (
    <Root>
      <Header>
        <Heading>
          Points by{' '}
          <PartnerWithIcon>
            <PartnerName>{banner.by}</PartnerName>
            <HeaderIcon chainIcon={banner.chainIcon} />
          </PartnerWithIcon>
        </Heading>
        {banner.learn && <LinkButton href={banner.learn} text={t('Boost-learn-more')} />}
      </Header>
      <Body>
        <MarkdownText text={banner.description} />
      </Body>
    </Root>
  );
});

const Root = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRadius: '12px',
    backgroundColor: 'background.content.points',
    overflow: 'hidden',
  },
});

const Header = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'background.content.points',
    backgroundImage:
      'linear-gradient(to right, {colors.white.70-24a} 1px, transparent 1px), linear-gradient(to bottom, {colors.white.70-24a} 1px, transparent 1px)',
    backgroundSize: '51px 100%, 100% 39px',
    backgroundPosition: '25px 0, 0 20px',
    backgroundRepeat: 'repeat-x, repeat-y',
    sm: {
      padding: '24px',
    },
  },
});

const Heading = styled('h2', {
  base: {
    textStyle: 'h2',
    margin: 0,
    color: 'text.points',
    minWidth: 0,
  },
});

const PartnerName = styled('span', {
  base: {
    color: 'text.light',
  },
});

const PartnerWithIcon = styled('span', {
  base: {
    display: 'inline-flex',
    whiteSpace: 'nowrap',
    color: 'text.points',
    alignItems: 'center',
    gap: '4px',
  },
});

const ChainIconImg = styled('img', {
  base: {
    objectFit: 'contain',
    width: ICON_SIZE,
  },
});

const Body = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'background.content',
    color: 'text.middle',
    textStyle: 'body',
    sm: {
      padding: '24px',
    },
  },
});
