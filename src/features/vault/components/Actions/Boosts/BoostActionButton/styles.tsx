import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    padding: 12,
    borderRadius: '8px',
    backgroundColor: '#2D3153',
  },
  title: {
    display: 'flex',
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
    alignItems: 'center',
    '&:Hover': {
      cursor: 'pointer ' as const,
    },
  },
  iconButton: {
    padding: 0,
    '& .MuiSvgIcon-root': {
      fill: '#999CB3',
    },
    '&:hover': {
      backgroundColor: 'transparent' as const,
    },
    marginRight: '4px',
  },
  text: {
    ...theme.typography['body-lg'],
    flexGrow: 1,
  },
  balance: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.secondary,
    '& span': {
      color: theme.palette.text.disabled,
    },
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    marginTop: '8px',
    rowGap: '16px',
  },
  button: {
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    '&:Hover': {
      backgroundColor: '#272B4A',
    },
    '&:disabled': {
      borderColor: 'transparent' as const,
    },
  },
  maxButton: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    marginRight: `${8 - 2}px`,
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    borderColor: 'transparent' as const,
    '&:disabled': {
      borderColor: 'transparent' as const,
    },
  },
  input: {
    color: '#D0D0DA',
    background: '#1B1E31',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    border: 'solid 2px #1B1E31',
    '& .MuiInputBase-input': {
      ...theme.typography['h3'],
      padding: `${8 - 2}px 16px`,
      color: '#D0D0DA',
      height: 'auto',
      '&:focus': {
        color: '#F5F5FF',
      },
      '&::placeholder': {
        color: '#8A8EA8',
        opacity: 1,
      },
    },
    '& .MuiInputBase-inputAdornedEnd': {},
  },
});
