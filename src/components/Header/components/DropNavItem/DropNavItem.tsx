import { type FC, type FunctionComponent, memo, type SVGProps, useCallback, useState } from 'react';
import ExpandMore from '../../../../images/icons/mui/ExpandMore.svg?react';
import ExpandLess from '../../../../images/icons/mui/ExpandLess.svg?react';
import { NavLinkItem } from '../NavItem/NavLinkItem.tsx';
import type { BadgeComponent } from '../Badges/types.ts';
import type { NavItemConfig } from './types.ts';
import { DropdownNavButton } from '../NavItem/NavLink.tsx';
import { styled } from '@repo/styles/jsx';
import type { RecipeVariantRecord } from '@repo/styles/types';
import { NavItemInner } from '../NavItem/NavItemInner.tsx';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';
import { DropdownContent } from '../../../Dropdown/DropdownContent.tsx';

interface DropNavItemProps {
  title: string;
  Icon: FC;
  items: NavItemConfig[];
  Badge?: BadgeComponent;
}

export const DropNavItem = memo<DropNavItemProps>(function DropNavItem({
  title,
  Icon,
  items,
  Badge,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <DropdownProvider open={isOpen} onChange={setIsOpen}>
      <DropdownNavButton>
        <NavItemInner
          title={title}
          Icon={Icon}
          Badge={Badge}
          Arrow={isOpen ? UpArrow : DownArrow}
        />
      </DropdownNavButton>
      <DropdownItems padding="small">
        {items.map(item => {
          const NavItemComponent = item.Component ?? NavLinkItem;
          return (
            <NavItemComponent
              key={item.title}
              title={item.title}
              url={item.url}
              Icon={item.Icon}
              Badge={item.Badge}
              onClick={handleClose}
            />
          );
        })}
      </DropdownItems>
    </DropdownProvider>
  );
});

const DropdownItems = styled(DropdownContent, {
  base: {
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'background.content.dark',
    backgroundColor: 'searchInput.background',
    borderRadius: '4px',
  },
});

const DownArrow = styled<FunctionComponent<SVGProps<SVGSVGElement>>, RecipeVariantRecord>(
  ExpandMore,
  {
    base: {
      fontSize: '18px',
    },
  }
);

const UpArrow = styled<FunctionComponent<SVGProps<SVGSVGElement>>, RecipeVariantRecord>(
  ExpandLess,
  {
    base: {
      fontSize: '18px',
    },
  }
);
