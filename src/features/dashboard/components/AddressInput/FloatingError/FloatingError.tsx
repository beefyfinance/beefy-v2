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
  isAddressValid: boolean;
  isEnsValid: boolean;
  anchorRef: React.RefObject<HTMLInputElement>;
}

export const FloatingError = memo<FloatingErrorProps>(function FloatingError({
  userInput,
  isAddressValid,
  isEnsValid,
  anchorRef,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  if (userInput.endsWith('.eth'))
    return (
      <Floating
        open={userInput.length > 6 && !isEnsValid}
        placement="bottom-start"
        anchorEl={anchorRef}
        className={classes.dropdown}
        display="flex"
        autoWidth={false}
      >
        <div>{t('Dashboard-SearchInput-Invalid-Ens')}</div>
      </Floating>
    );

  if (userInput.startsWith('0x')) {
    return (
      <Floating
        open={userInput.length > 40 && !isAddressValid}
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
