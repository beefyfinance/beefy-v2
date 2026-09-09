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
  /** static line rendered above the interactive row */
  heading?: ReactNode;
  /**
   * When set the notice becomes a checkbox row instead of a link: the tick replaces the chevron
   * and the strip drops to the dim tint while unchecked.
   */
  checked?: boolean;
  /** still shows its state, but cannot be changed */
  disabled?: boolean;
};
export const ActionTokensNotice = memo(function ActionTokensNotice({
  children,
  multiline,
  heading,
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
        direction={heading || multiline ? 'column' : 'row'}
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
          {/* inside the button so hover and click cover the whole strip, not just the tick row */}
          {heading ?
            <NoticeHeading>{heading}</NoticeHeading>
          : null}
          {isCheckbox ?
            <CheckboxRow>
              <CheckIcon className={checkIcon} />
              {/* one flex item, so the row gap cannot land between the sentence and the tokens */}
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

const NoticeHeading = styled('div', {
  base: {
    width: '100%',
    textAlign: 'center',
    textWrap: 'wrap balance',
  },
});

const CheckboxRow = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textWrap: 'wrap',
    // matches the heading line; a floor rather than a fixed height, so a label that wraps still grows
    minHeight: '24px',
  },
});

const inlineIcon = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '6px',
});

/** no colour of its own, so the tick follows the strip tint */
const checkIcon = css({
  flexShrink: '0',
  width: '20px',
  height: '20px',
});

const CheckboxLabel = styled('span', {
  base: {
    display: 'inline',
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
        // the default hover is gold.30, this variant's text colour, which would paint the label out
        '&:hover': {
          background: 'gold.70-20',
        },
      },
    },
  },
});
