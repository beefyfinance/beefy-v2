import type { Theme } from '@material-ui/core';

type StylesProps = {
  gap?: number;
};

export const styles = (theme: Theme) => ({
  vertical: {
    display: 'flex',
    gap: (props?: StylesProps) => props?.gap || 16,
    flexDirection: 'column' as const,
  },
  horizontal: {
    display: 'flex',
    gap: (props?: StylesProps) => props?.gap || 16,
    flexDirection: 'row' as const,
  },
});
