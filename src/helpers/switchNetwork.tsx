import { reduxActions } from "../features/redux/actions";

export const switchNetwork = (network, dispatch) => {
  dispatch(reduxActions.wallet.setNetwork(network));
};
