import React, { memo, useState } from 'react';
import { Badge, Divider, Drawer, makeStyles } from '@material-ui/core';
import { Close, Menu } from '@material-ui/icons';
import { styles } from './styles';
import { BifiPrice } from '../BifiPrice';
import { LanguageDropdown } from '../../../LanguageDropdown';
import { NavItemMobile } from '../NavItem';
import { useTranslation } from 'react-i18next';
import { MobileList } from '../../list';

const useStyles = makeStyles(styles);

export const MobileMenu = memo(function () {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  return (
    <div>
      <button aria-label="menu" onClick={handleDrawerToggle} className={classes.toggleDrawer}>
        <Menu fontSize="inherit" className={classes.toggleDrawerIcon} />
      </button>
      <Drawer className={classes.bg} anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        <div className={classes.menuContainer}>
          <div className={classes.head}>
            <div className={classes.flex}>
              <BifiPrice />
              <LanguageDropdown />
            </div>
            <Close className={classes.cross} onClick={handleDrawerToggle} />
          </div>
          <Divider className={classes.divider} />
          {MobileList.map(({ title, Icon, url, items }) => {
            return (
              <div key={title}>
                {url ? (
                  <NavItemMobile onClick={handleDrawerToggle} title={title} url={url} Icon={Icon} />
                ) : (
                  <DropMobile
                    onClick={handleDrawerToggle}
                    title={title}
                    Icon={Icon}
                    items={items}
                  />
                )}
                <Divider className={classes.divider} />
              </div>
            );
          })}
        </div>
      </Drawer>
    </div>
  );
});

interface DropMobileProps {
  title: string;
  Icon: React.FC;
  items: { url: string; title: string; Icon: React.FC; badge?: boolean }[];
  onClick: () => void;
  withBadge?: boolean;
}

export const DropMobile = memo<DropMobileProps>(function ({
  title,
  Icon,
  items,
  onClick,
  withBadge,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.itemsContainer}>
      <div className={classes.itemTitle}>
        {withBadge ? (
          <Badge badgeContent="New" color="primary">
            <Icon />
            {t(title)}
          </Badge>
        ) : (
          <>
            <Icon />
            {t(title)}
          </>
        )}
      </div>
      <div>
        {items.map(item => {
          return (
            <NavItemMobile
              onClick={onClick}
              className={classes.customPadding}
              title={item.title}
              url={item.url}
              Icon={item.Icon}
              withBadge={item.badge}
            />
          );
        })}
      </div>
    </div>
  );
});
