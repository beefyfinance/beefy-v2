import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton/LinkButton.tsx';
import { MarkdownText } from '../../../components/Markdown/MarkdownText.tsx';
import type { PointStructureEntity } from '../../../data/entities/points.ts';
import BoostIcon from '../../../../images/icons/boost.svg?react';

const learnMoreButtonCss = css.raw({
  backgroundColor: 'green.40',
  color: 'text.black',
  '&:hover': {
    backgroundColor: 'green.20',
    color: 'text.black',
  },
});

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

  const heading = banner.title || `Points by ${banner.by}`;

  return (
    <Root>
      <Header>
        <Heading>
          <HeadingText>{heading}</HeadingText>
          <HeadingIconWrap aria-hidden="true">
            {renderHeadingIcon(banner.chainIcon, '')}
          </HeadingIconWrap>
        </Heading>
        {banner.learn && (
          <LinkButton href={banner.learn} text={t('Boost-learn-more')} css={learnMoreButtonCss} />
        )}
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
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'white.70-24a',
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
      'linear-gradient(to right, var(--colors-white-70-24a) 1px, transparent 1px), linear-gradient(to bottom, var(--colors-white-70-24a) 1px, transparent 1px)',
    backgroundSize: '51px 100%, 100% 39px',
    backgroundPosition: '0 0, 0 20px',
    backgroundRepeat: 'repeat-x, repeat-y',
    sm: {
      padding: '24px',
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

const HeadingIconWrap = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    color: 'text.points',
    flexShrink: 0,
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
    backgroundColor: 'background.content.points',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'white.70-24a',
    color: 'text.middle',
    textStyle: 'body',
    sm: {
      padding: '24px',
    },
  },
});
