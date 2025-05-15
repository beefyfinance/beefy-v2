import { memo } from 'react';
import type { NavItemInnerProps } from '../DropNavItem/types.ts';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

export const NavItemInner = memo<NavItemInnerProps>(function NavItemInner({
  title,
  Icon,
  Badge,
  Arrow,
}) {
  const { t } = useTranslation();
  return (
    <>
      <Icon />
      <Title>
        {t(title)}
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

const Title = styled('div', {
  base: {
    position: 'relative',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});
