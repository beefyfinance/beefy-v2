import { memo, type RefObject, useCallback } from 'react';
import SettingsIcon from '../../../../images/icons/settings.svg?react';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';
import { DropdownContent } from '../../../Dropdown/DropdownContent.tsx';
import { styled } from '@repo/styles/jsx';
import { RpcSettingsPanel } from './RpcSettingsPanel.tsx';

export const UserSettings = memo(function UserSettings({
  anchorEl,
  isOpen,
  onOpen,
  onClose,
}: {
  anchorEl: RefObject<HTMLElement>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const handleChange = useCallback(
    (shouldOpen: boolean) => {
      if (shouldOpen) {
        onOpen();
      } else {
        onClose();
      }
    },
    [onOpen, onClose]
  );

  return (
    <DropdownProvider
      placement="bottom-end"
      autoWidth={false}
      open={isOpen}
      onChange={handleChange}
      reference={anchorEl}
    >
      <SettingsButton>
        <SettingsIcon height={24} width={24} />
      </SettingsButton>
      <LineSeparator />
      <DropdownContent padding="none">
        <RpcSettingsPanel handleClose={onClose} />
      </DropdownContent>
    </DropdownProvider>
  );
});

const LineSeparator = styled('div', {
  base: {
    height: '16px',
    width: '2px',
    borderRadius: '3px',
    backgroundColor: 'background.content.light',
  },
});

const SettingsButton = styled(DropdownTrigger.button, {
  base: {
    display: 'flex',
    alignItems: 'center',
    color: 'text.middle',
    _hover: {
      cursor: 'pointer',
      color: 'text.light',
    },
  },
});
