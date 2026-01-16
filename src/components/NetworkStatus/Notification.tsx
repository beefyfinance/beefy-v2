import { memo, useMemo } from 'react';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { selectStatusNotifications } from '../../features/data/selectors/data-loader-helpers.ts';
import { DropdownContent } from './DropdownContent.tsx';
import { Header } from './Header.tsx';
import { NotificationRpcChains } from './NotificationRpcChains.tsx';

type NotificationProps = {
  onOpenDropdown: () => void;
};

export const Notification = memo(function Notification({ onOpenDropdown }: NotificationProps) {
  const notifications = useAppSelector(selectStatusNotifications);
  const rpcErrorChains = useMemo(() => {
    const { rpc } = notifications;
    return rpc ? rpc.chainIds : [];
  }, [notifications]);

  return (
    <DropdownContent>
      <Header notifications={notifications} />
      {rpcErrorChains.length > 0 && (
        <NotificationRpcChains onOpenDropdown={onOpenDropdown} chains={rpcErrorChains} />
      )}
    </DropdownContent>
  );
});
