import { memo, useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button } from '../../../../../../components/Button';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { ExtendedFilters } from './ExtendedFilters';
import { Dropdown } from '../../../../../../components/Dropdown';

export type ExtendedFiltersButtonProps = {
  desktopView: boolean;
  className?: string;
};
export const ExtendedFiltersButton = memo<ExtendedFiltersButtonProps>(
  function ExtendedFiltersButton({ desktopView, className }) {
    const { t } = useTranslation();
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
        <Button
          className={clsx(className)}
          variant="filter"
          size="sm"
          ref={anchorEl}
          onClick={handleOpen}
          active={isOpen}
        >
          {t('Filter-Btn')}
        </Button>
        {desktopView ? (
          <Dropdown anchorEl={anchorEl} open={isOpen} onClose={handleClose} placement="bottom-end">
            <ExtendedFilters desktopView={true} />
          </Dropdown>
        ) : (
          <Sidebar open={isOpen} onClose={handleClose} />
        )}
      </>
    );
  }
);
