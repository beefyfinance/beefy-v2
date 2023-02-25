import { ClickAwayListener, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo, MouseEventHandler, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpandMore } from '@material-ui/icons';
import { Floating } from '../../../Floating';
import { styles } from './styles';
import { NavItem } from '../NavItem';
import { BadgeComponent } from '../Badges/types';
import { NavItemConfig } from './types';

const useStyles = makeStyles(styles);

interface DropNavItemProps {
  title: string;
  Icon: React.FC;
  items: NavItemConfig[];
  Badge?: BadgeComponent;
}

export const DropNavItem = memo<DropNavItemProps>(function ({ title, Icon, items, Badge }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = useRef<HTMLDivElement | null>(null);

  const handleToggle = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      setIsOpen(open => !open);
    },
    [setIsOpen]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <ClickAwayListener onClickAway={handleClose} mouseEvent="onMouseDown" touchEvent="onTouchStart">
      <div
        onClick={handleToggle}
        className={clsx(classes.label, { [classes.active]: isOpen })}
        ref={anchorEl}
      >
        <Icon />
        <div className={clsx(classes.title, { [classes.titleWithBadge]: !!Badge })}>
          {t(title)}
          {Badge ? <Badge /> : null}
        </div>
        <ExpandMore className={classes.arrow} />
        <Floating
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          className={classes.dropdown}
          display="flex"
          autoWidth={false}
        >
          {items.map(item => {
            const NavItemComponent = item.Component ?? NavItem;
            return (
              <NavItemComponent
                key={item.title}
                title={item.title}
                url={item.url}
                Icon={item.Icon}
                Badge={item.Badge}
              />
            );
          })}
        </Floating>
      </div>
    </ClickAwayListener>
  );
});
