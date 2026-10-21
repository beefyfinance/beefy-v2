import { memo, type ReactNode } from 'react';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { Notification } from '../../../../../../components/Notification.tsx';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import CheckBoxOutlineBlank from '../../../../../../images/icons/CheckBoxBlank.svg?react';
import CheckBoxOutlined from '../../../../../../images/icons/CheckBox.svg?react';

type ActionTokensNoticeProps = {
  children: ReactNode;
  onClick?: () => void;
  multiline?: boolean;
  checked?: boolean;
  disabled?: boolean;
};
export const ActionTokensNotice = memo(function ActionTokensNotice({
  children,
  multiline,
  onClick,
  checked,
  disabled,
}: ActionTokensNoticeProps) {
  if (onClick) {
    const isCheckbox = checked !== undefined;
    const CheckIcon = checked ? CheckBoxOutlined : CheckBoxOutlineBlank;

    return (
      <FooterNotification
        padding="none"
        direction={multiline ? 'column' : 'row'}
        background={isCheckbox && !checked ? 'transparent' : 'solid'}
      >
        <FooterNotificationButton
          type="button"
          onClick={onClick}
          dim={isCheckbox && !checked}
          disabled={disabled}
          role={isCheckbox ? 'checkbox' : undefined}
          aria-checked={isCheckbox ? checked : undefined}
          aria-disabled={disabled}
        >
          {isCheckbox ?
            <CheckboxRow>
              <CheckIcon className={checkIcon} />
              <CheckboxLabel>{children}</CheckboxLabel>
            </CheckboxRow>
          : <>
              {children}
              <ChevronRight preserveAspectRatio="xMaxYMid" className={inlineIcon} />
            </>
          }
        </FooterNotificationButton>
      </FooterNotification>
    );
  }

  return (
    <FooterNotification direction={multiline ? 'column' : 'row'}>{children}</FooterNotification>
  );
});

const CheckboxRow = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textWrap: 'wrap',
    minHeight: '24px',
  },
});

const inlineIcon = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '6px',
});

const checkIcon = css({
  flexShrink: '0',
  width: '20px',
  height: '20px',
});

const CheckboxLabel = styled('span', {
  base: {
    flex: '1',
    textAlign: 'center',
  },
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
    paddingBlock: '8px',
    paddingInline: '16px',
    sm: {
      paddingInline: '24px',
    },
    '&:hover': {
      background: 'buttons.boost.active.background',
    },
  },
  variants: {
    dim: {
      true: {
        '&:hover': {
          background: 'gold.70-20',
        },
      },
    },
  },
});
