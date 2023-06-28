import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Floating } from '../../../../../components/Floating';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  dropdown: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    color: theme.palette.text.disabled,
    padding: '6px 12px',
    backgroundColor: '#242737',
    border: '2px solid #30354F',
    borderRadius: '8px',
    marginTop: '4px',
    minWidth: '250px',
    zIndex: 999,
  },
}));

interface FloatingErrorProps {
  userInput: string;
  inputMode: 'address' | 'domain';
  isAddressValid: boolean;
  isDomainValid: boolean;
  isDomainResolving: boolean;
  anchorRef: React.RefObject<HTMLInputElement>;
}

export const FloatingError = memo<FloatingErrorProps>(function FloatingError({
  userInput,
  inputMode,
  isAddressValid,
  isDomainValid,
  isDomainResolving,
  anchorRef,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!isDomainResolving && inputMode === 'domain') {
    return (
      <Floating
        open={!isDomainValid}
        placement="bottom-start"
        anchorEl={anchorRef}
        className={classes.dropdown}
        display="flex"
        autoWidth={false}
      >
        <div>{t('Dashboard-SearchInput-Invalid-Domain')}</div>
      </Floating>
    );
  }

  if (inputMode === 'address' && userInput.toLowerCase().startsWith('0x')) {
    return (
      <Floating
        open={!isAddressValid}
        placement="bottom-start"
        anchorEl={anchorRef}
        className={classes.dropdown}
        display="flex"
        autoWidth={false}
      >
        <div>{t('Dashboard-SearchInput-Invalid-Address')}</div>
      </Floating>
    );
  }

  return null;
});
