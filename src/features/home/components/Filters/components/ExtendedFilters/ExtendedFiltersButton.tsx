import { memo, useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button } from '../../../../../../components/Button';
import { useTranslation } from 'react-i18next';
import { Tune } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import {
  selectFilterPopinFilterCount,
  selectFilterPopinFilterCountDesktop,
} from '../../../../../data/selectors/filtered-vaults';
import { Dropdown } from './Dropdown';
import { Sidebar } from './Sidebar';

const useStyles = makeStyles(styles);

export type ExtendedFiltersButtonProps = {
  desktopView: boolean;
  className?: string;
};
export const ExtendedFiltersButton = memo<ExtendedFiltersButtonProps>(
  function ExtendedFiltersButton({ desktopView, className }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const count = useAppSelector(state =>
      desktopView ? selectFilterPopinFilterCountDesktop(state) : selectFilterPopinFilterCount(state)
    );
    const anchorEl = useRef();
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, [setIsOpen]);

    const handleOpen = useCallback(() => {
      setIsOpen(true);
    }, [setIsOpen]);

    return (
      <>
        <Button className={clsx(className)} variant="filter" ref={anchorEl} onClick={handleOpen}>
          {count > 0 ? (
            <span className={classes.badge} data-count={count} />
          ) : (
            <Tune className={classes.icon} />
          )}
          {t('Filter-Btn')}
        </Button>
        {desktopView ? (
          <Dropdown
            anchorEl={anchorEl}
            open={isOpen}
            onClose={handleClose}
            placement="bottom-end"
          />
        ) : (
          <Sidebar open={isOpen} onClose={handleClose} />
        )}
      </>
    );
  }
);
