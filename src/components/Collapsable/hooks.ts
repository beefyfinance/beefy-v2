import { useCallback, useMemo, useState } from 'react';
import ExpandLess from '../../images/icons/mui/ExpandLess.svg?react';
import ExpandMore from '../../images/icons/mui/ExpandMore.svg?react';

export function useCollapse(openByDefault: boolean = false) {
  const [open, setOpen] = useState<boolean>(openByDefault);
  const handleToggle = useCallback(() => {
    setOpen(prevStatus => !prevStatus);
  }, [setOpen]);
  const Icon = open ? ExpandLess : ExpandMore;
  return useMemo(() => ({ open, handleToggle, Icon }), [open, handleToggle, Icon]);
}
