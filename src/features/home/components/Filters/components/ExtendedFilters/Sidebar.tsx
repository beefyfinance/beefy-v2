import { memo, useMemo } from 'react';
import { Drawer, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { ExtendedFilters } from './ExtendedFilters';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button';
import { CloseOutlined } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export const Sidebar = memo<SidebarProps>(function ({ open, onClose }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const drawerClasses = useMemo(
    () => ({
      paper: classes.sidebar,
    }),
    [classes]
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose} classes={drawerClasses}>
      <div className={classes.sidebarHeader}>
        <div className={classes.sidebarHeaderTitle}>{t('Filter-Filters')}</div>
        <button onClick={onClose} className={classes.sidebarHeaderClose}>
          <CloseOutlined />
        </button>
      </div>
      <div className={classes.sidebarMain}>
        <ExtendedFilters desktopView={false} />
      </div>
      <div className={classes.sidebarFooter}>
        <Button fullWidth={true} borderless={true} onClick={onClose} variant="success">
          {t('Filter-Close')}
        </Button>
      </div>
    </Drawer>
  );
});
