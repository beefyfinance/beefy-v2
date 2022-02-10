import { Snackbar } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../redux-types';
import { Slide } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

function TransitionLeft(props) {
  return <Slide {...props} direction="right" />;
}

export function ErrorsSnackbar() {
  const error = useSelector((state: BeefyState) => {
    return state.ui.dataLoader.latestError;
  });

  return (
    <Snackbar
      open={error !== null}
      autoHideDuration={6000}
      TransitionComponent={TransitionLeft}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Alert severity="error">{error}</Alert>
    </Snackbar>
  );
}
