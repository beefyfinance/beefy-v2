import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  button: {
    paddingLeft: '14px', // TEMPFIX: font is too wide on iOS
    paddingRight: '14px',
  },
});
