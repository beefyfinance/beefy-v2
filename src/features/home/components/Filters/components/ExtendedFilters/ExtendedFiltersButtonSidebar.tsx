import { memo, useCallback, useState } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar.tsx';

export const ExtendedFiltersButtonSidebar = memo(function ExtendedFiltersButtonSidebar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  return (
    <>
      <Button size="sm" variant="filter" onClick={handleOpen} fullWidth={true}>
        {t('Filter-Btn')}
      </Button>
      <Sidebar open={isOpen} onClose={handleClose} />
    </>
  );
});
