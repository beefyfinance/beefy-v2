import { memo } from 'react';
import type { NavItemInnerProps } from '../DropNavItem/types.ts';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import ExternalLinkRegularIcon from '../../../../images/icons/externalLinkRegular.svg?react';

export const NavItemInner = memo<NavItemInnerProps>(function NavItemInner({
  title,
  Icon,
  Badge,
  Arrow,
  externalLink,
}) {
  const { t } = useTranslation();
  return (
    <>
      <IconTitleContainer>
        <IconWrapper>
          <Icon />
        </IconWrapper>
        <Title>
          {t(title)}
          {externalLink ?
            <ExternalLinkRegularIcon />
          : null}
        </Title>
      </IconTitleContainer>
      {Badge ?
        <Badge />
      : null}
      {Arrow ?
        <Arrow />
      : null}
    </>
  );
});

const IconTitleContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBlock: '2px',
    width: '100%',
    sm: {
      gap: '4px',
    },
  },
});

const IconWrapper = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
  },
});

const Title = styled('div', {
  base: {
    textStyle: 'body.medium',
    position: 'relative',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});
