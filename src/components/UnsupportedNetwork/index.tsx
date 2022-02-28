import { Box, Typography, Button, makeStyles } from '@material-ui/core';
import { connect, useDispatch } from 'react-redux';
import { styles } from './styles';
import { askForNetworkChange } from '../../features/data/actions/wallet';
import { useCallback } from 'react';
import { selectCurrentChainId } from '../../features/data/selectors/wallet';
import { selectChainById } from '../../features/data/selectors/chains';
import { ChainEntity } from '../../features/data/entities/chain';
import { BeefyState } from '../../redux-types';
import { selectIsConfigAvailable } from '../../features/data/selectors/data-loader';

const useStyles = makeStyles(styles as any);

export const UnsupportedNetwork = connect((state: BeefyState) => {
  const defaultChainId = selectCurrentChainId(state) || 'bsc';
  const configLoaded = selectIsConfigAvailable(state);
  const chain = configLoaded ? selectChainById(state, defaultChainId) : null;
  return { chain };
})(({ chain }: { chain: ChainEntity | null }) => {
  const dispatch = useDispatch();

  const classes = useStyles();
  const updateNetwork = useCallback(
    () => dispatch(askForNetworkChange({ chainId: chain.id })),
    [chain, dispatch]
  );

  // still loading chain config
  if (!chain) {
    return <></>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box mr={4}>
        <Typography {...({ color: 'red' } as any)}>We do not support this network.</Typography>
      </Box>
      <Box>
        <Button className={classes.btn} onClick={updateNetwork} size="small">
          Switch to {chain.name}
        </Button>
      </Box>
    </Box>
  );
});
