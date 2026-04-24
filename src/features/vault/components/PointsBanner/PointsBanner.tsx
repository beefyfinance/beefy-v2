import { styled } from '@repo/styles/jsx';
import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton/LinkButton.tsx';
import { MarkdownText } from '../../../components/Markdown/MarkdownText.tsx';
import type { PointStructureEntity } from '../../../data/entities/points.ts';
import BoostIcon from '../../../../images/icons/boost.svg?react';

const networkIconUrls = import.meta.glob<string>('../../../../images/networks/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
});

function renderHeadingIcon(chainIcon: string | undefined, alt: string): ReactNode {
  if (!chainIcon) return <BoostIcon />;
  const url = networkIconUrls[`../../../../images/networks/${chainIcon}.svg`];
  if (!url) {
    if (import.meta.env.DEV) {
      console.warn(
        `PointsBanner: no chain icon found for "${chainIcon}", falling back to flame. Check src/images/networks/ for a matching SVG.`
      );
    }
    return <BoostIcon />;
  }
  return <img src={url} alt={alt} />;
}

export type PointsBannerProps = {
  structure: PointStructureEntity;
};

export const PointsBanner = memo(function PointsBanner({ structure }: PointsBannerProps) {
  const { t } = useTranslation();
  const banner = structure.banner;
  if (!banner) return null;

  return (
    <Root>
      <Header>
        <Heading>
          <HeadingText>
            Points by <PartnerName>{banner.by}</PartnerName>
            <HeadingIconWrap aria-hidden="true">
              {renderHeadingIcon(banner.chainIcon, '')}
            </HeadingIconWrap>
          </HeadingText>
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
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'background.content.points',
    '&::before': {
      content: '""',
      position: 'absolute',
      insetInline: 0,
      top: 0,
      bottom: '8px',
      pointerEvents: 'none',
      backgroundImage:
        'linear-gradient(to right, var(--colors-white-70-24a) 1px, transparent 1px), linear-gradient(to bottom, var(--colors-white-70-24a) 1px, transparent 1px)',
      backgroundSize: '51px 100%, 100% 39px',
      backgroundPosition: '25px 0, 0 20px',
      backgroundRepeat: 'repeat-x, repeat-y',
    },
    '& > *': {
      position: 'relative',
    },
    sm: {
      padding: '24px',
      '&::before': {
        bottom: 0,
      },
    },
  },
});

const Heading = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    flexGrow: 1,
    minHeight: '32px',
  },
});

const HeadingText = styled('h2', {
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

const HeadingIconWrap = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    marginLeft: '4px',
    verticalAlign: 'middle',
    color: 'text.points',
    '& svg, & img': {
      width: '100%',
      height: '100%',
      display: 'block',
    },
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
