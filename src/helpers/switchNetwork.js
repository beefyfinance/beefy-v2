import reduxActions from 'features/redux/actions';

const switchNetwork = (network, dispatch) => {
  dispatch(reduxActions.wallet.setNetwork(network));
};

export default switchNetwork;
