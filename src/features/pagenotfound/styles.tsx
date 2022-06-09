import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  inner: {
    margin: '0 auto',
    paddingTop: '120px',
    paddingBottom: '120px',
    width: '612px',
    maxWidth: '100%',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    margin: '0 auto',
    display: 'block',
  },
  textContainer: {
    margin: '36px 0 0 0',
    textAlign: 'center' as const,
  },
  text: {
    ...theme.typography['body-lg-med'],
  },
  button: {
    margin: '24px auto 0 auto',
  },
});
