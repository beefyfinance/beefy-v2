import { memo } from 'react';
import type { NavItemInnerProps } from '../DropNavItem/types.ts';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import ExternalArrowIcon from '../../../../images/icons/external-arrow.svg?react';

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
      <IconWrapper>
        <Icon />
      </IconWrapper>
      <Title>
        {t(title)}
        {externalLink ?
          <ExternalArrowIcon />
        : null}
        {Badge ?
          <Badge />
        : null}
      </Title>
      {Arrow ?
        <Arrow />
      : null}
    </>
  );
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
