import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@repo/styles/css';
import { Button } from '../Button/Button.tsx';

type UnlimitedApprovalButtonProps = {
  /** label of the main button, e.g. "Deposit" */
  action: string;
  onClick: () => void;
  disabled?: boolean;
};

/** Secondary to a main "Approve exact & <action>" button */
export const UnlimitedApprovalButton = memo(function UnlimitedApprovalButton({
  action,
  onClick,
  disabled,
}: UnlimitedApprovalButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      variant="default"
      fullWidth={true}
      borderless={true}
      disabled={disabled}
      onClick={onClick}
      css={styles.button}
    >
      {t('Approve-Unlimited-And', { action })}
    </Button>
  );
});

const styles = {
  button: css.raw({
    marginTop: '12px',
  }),
};
