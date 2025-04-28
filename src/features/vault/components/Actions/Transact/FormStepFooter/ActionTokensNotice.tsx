import { memo, type ReactNode } from 'react';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { Notification } from '../../../../../../components/Notification.tsx';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';

type ActionTokensNoticeProps = {
  children: ReactNode;
  onClick?: () => void;
  multiline?: boolean;
};
export const ActionTokensNotice = memo(function ActionTokensNotice({
  children,
  multiline,
  onClick,
}: ActionTokensNoticeProps) {
  if (onClick) {
    return (
      <FooterNotification padding="none" direction={multiline ? 'column' : 'row'}>
        <FooterNotificationButton onClick={onClick}>
          {children}
          <ChevronRight preserveAspectRatio="xMaxYMid" className={inlineIcon} />
        </FooterNotificationButton>
      </FooterNotification>
    );
  }

  return (
    <FooterNotification direction={multiline ? 'column' : 'row'}>{children}</FooterNotification>
  );
});

const inlineIcon = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '6px',
});

const FooterNotification = styled(
  Notification,
  {
    base: {
      contain: 'paint',
      gap: '2px',
    },
  },
  {
    defaultProps: {
      background: 'solid',
      radius: 'md',
      attached: 'bottom',
    },
  }
);

const FooterNotificationButton = styled('button', {
  base: {
    display: 'block',
    textWrap: 'wrap balance',
    width: '100%',
    border: 'none',
    padding: '8px 16px',
    sm: {
      padding: '8px 24px',
    },
    '&:hover': {
      background: 'buttons.boost.active.background',
    },
  },
});
