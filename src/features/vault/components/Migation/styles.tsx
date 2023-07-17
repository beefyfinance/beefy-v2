import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '12px',
    backgroundColor: theme.palette.background.content,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '16px',
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px 12px 0px 0px ',
    padding: '24px',
  },
  icon: {
    height: '48px',
  },
  subTitle: {
    ...theme.typography['subline-lg'],
    fontWeight: 700,
    color: theme.palette.text.disabled,
  },
  title: {
    ...theme.typography.h3,
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    padding: '24px',
    rowGap: '16px',
  },
});
