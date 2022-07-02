import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  modal: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    maxWidth: '100%',
    height: 'auto',
    maxHeight: '100%',
    overflowY: 'auto' as const,
  },
  container: {
    borderRadius: '20px',
    backgroundColor: '#232743',
  },
  header: {
    padding: '24px',
    background: theme.palette.background.vaults.inactive,
    borderRadius: '12px 12px 0px 0px',
    borderBottom: '2px solid #2D3153',
  },
  headerTitleClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  powerBy: {
    ...theme.typography['body-sm'],
    color: '#999CB3',
  },
  cross: {
    color: '#999CB3',
    cursor: 'pointer',
    marginLeft: '16px',
  },
});
