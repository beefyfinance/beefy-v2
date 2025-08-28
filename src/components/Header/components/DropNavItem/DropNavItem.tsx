import { type FC, type FunctionComponent, memo, type SVGProps, useCallback, useState } from 'react';
import ExpandMore from '../../../../images/icons/mui/ExpandMore.svg?react';
import ExpandLess from '../../../../images/icons/mui/ExpandLess.svg?react';
import { NavLinkItem } from '../NavItem/NavLinkItem.tsx';
import type { BadgeComponent } from '../Badges/types.ts';
import type { NavItemConfig } from './types.ts';
import { styled } from '@repo/styles/jsx';
import type { RecipeVariantRecord } from '@repo/styles/types';
import { NavItemInner } from '../NavItem/NavItemInner.tsx';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';
import { DropdownContent } from '../../../Dropdown/DropdownContent.tsx';
import { DropdownNavButton } from '../NavItem/NavLink.tsx';

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
    <DropdownContainer>
      <DropdownProvider
        open={isOpen}
        onChange={setIsOpen}
        openOnHover={true}
        openOnClick={false}
        hoverOpenDelay={0}
        hoverCloseDelay={100}
      >
        <DropdownNavButton>
          <NavItemInner
            title={title}
            Icon={Icon}
            Badge={Badge}
            Arrow={isOpen ? UpArrow : DownArrow}
          />
        </DropdownNavButton>

        <DropdownItems>
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
                dropdownItem={true}
                externalLink={item.externalLink}
              />
            );
          })}
        </DropdownItems>
      </DropdownProvider>
    </DropdownContainer>
  );
});

const DropdownContainer = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
});

const DropdownItems = styled(DropdownContent, {
  base: {
    minWidth: '172px',
    backgroundColor: 'background.cardBody',
    borderRadius: '8px',
    paddingInline: '0px',
    paddingBlock: '6px',
    gap: '0px',
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
