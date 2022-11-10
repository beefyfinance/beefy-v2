import { makeStyles, Popover, SvgIcon } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowDownIcon } from '../../../../images/icons/navigation/arrow.svg';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface DropNavItemProps {
  title: string;
  Icon: React.FC;
  items?: [];
}

export const DropNavItem = memo<DropNavItemProps>(function ({ title, Icon }) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const classes = useStyles();

  return (
    <div>
      <div
        className={clsx(classes.label, { [classes.active]: open })}
        aria-describedby={id}
        onClick={handleClick}
      >
        <Icon />
        {t(title)}
        <ArrowDownIcon />
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        x
      </Popover>
    </div>
  );
});
