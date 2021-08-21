import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, { connectors } from 'web3modal';
import Web3 from 'web3';

import { config } from 'config/config';
import {
  UNSUPPORTED_NETWORK,
  WALLET_ACTION,
  WALLET_ACTION_RESET,
  WALLET_CONNECT_BEGIN,
  WALLET_CONNECT_DONE,
  WALLET_CREATE_MODAL,
  WALLET_DISCONNECT,
} from '../constants';
import erc20Abi from 'config/abi/erc20.json';
import vaultAbi from 'config/abi/vault.json';

const getClientsForNetwork = async net => {
  return config[net].rpc;
};

const getAvailableNetworks = () => {
  const names = [];
  const ids = [];

  for (const net in config) {
    names.push(net);
    ids.push(config[net].chainId);
  }

  return [names, ids];
};

const checkNetworkSupport = networkId => {
  const [, ids] = getAvailableNetworks();
  return ids.includes(networkId);
};

const getNetworkAbbr = networkId => {
  const [names, ids] = getAvailableNetworks();
  return ids.includes(networkId) ? names[ids.indexOf(networkId)] : null;
};

const setNetwork = net => {
  console.log('redux setNetwork called.');

  return async (dispatch, getState) => {
    const state = getState();
    if (state.walletReducer.network !== net) {
      const clients = await getClientsForNetwork(net);
      localStorage.setItem('network', net);

      dispatch({
        type: 'SET_NETWORK',
        payload: { network: net, clients: clients },
      });
      dispatch(createWeb3Modal());
    }
  };
};

const connect = () => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_CONNECT_BEGIN });
    const state = getState();

    const close = async () => {
      await state.walletReducer.web3modal.clearCachedProvider();
      dispatch({ type: WALLET_CONNECT_DONE, payload: { address: null } });
    };

    const subscribeProvider = (provider, web3) => {
      if (!provider.on) {
        return;
      }
      provider.on('close', async () => {
        await close();
      });
      provider.on('disconnect', async () => {
        await close();
      });
      provider.on('accountsChanged', async accounts => {
        return accounts[0] !== undefined
          ? dispatch({
              type: WALLET_CONNECT_DONE,
              payload: { address: accounts[0] },
            })
          : await close();
      });
      provider.on('chainChanged', async chainId => {
        console.log('chainChanged');
        const networkId = web3.utils.isHex(chainId) ? web3.utils.hexToNumber(chainId) : chainId;
        if (checkNetworkSupport(networkId)) {
          const net = getNetworkAbbr(networkId);
          dispatch(setNetwork(net));
        } else {
          dispatch({ type: UNSUPPORTED_NETWORK, payload: { address: null } });
        }
      });
    };

    try {
      const provider = await state.walletReducer.web3modal.connect();
      const web3 = await new Web3(provider);
      web3.eth.extend({
        methods: [
          {
            name: 'chainId',
            call: 'eth_chainId',
            outputFormatter: web3.utils.hexToNumber,
          },
        ],
      });

      subscribeProvider(provider, web3);

      let networkId = await web3.eth.getChainId();
      if (networkId === 86) {
        // Trust provider returns an incorrect chainId for BSC.
        networkId = 56;
      }

      if (networkId === config[state.walletReducer.network].chainId) {
        const accounts = await web3.eth.getAccounts();
        //dispatch({type: WALLET_RPC, payload: {rpc: web3}}); => TODO: set same rpc as connected wallet to rpc[network] for consistency
        dispatch({
          type: WALLET_CONNECT_DONE,
          payload: { address: accounts[0] },
        });
      } else {
        await close();
        if (provider) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [config[state.walletReducer.network].walletSettings],
          });
          dispatch(connect());
        } else {
          const accounts = await web3.eth.getAccounts();
          dispatch({ type: UNSUPPORTED_NETWORK, payload: { address: accounts[0] } });
          throw Error('Network not supported, check chainId.');
        }
      }
    } catch (err) {
      console.log('connect error', err);
    }
  };
};

const disconnect = () => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_CONNECT_BEGIN });
    const state = getState();

    await state.walletReducer.web3modal.clearCachedProvider();
    dispatch({ type: WALLET_DISCONNECT });
  };
};

const approval = (network, tokenAddr, contractAddr) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(erc20Abi, tokenAddr);
      const maxAmount = Web3.utils.toWei('8000000000', 'ether');

      contract.methods
        .approve(contractAddr, maxAmount)
        .send({ from: address })
        .on('transactionHash', function (hash) {
          dispatch({
            type: WALLET_ACTION,
            payload: {
              result: 'success_pending',
              data: {
                spender: contractAddr,
                maxAmount: maxAmount,
                hash: hash,
              },
            },
          });
        })
        .on('receipt', function (receipt) {
          dispatch({
            type: WALLET_ACTION,
            payload: {
              result: 'success',
              data: {
                spender: contractAddr,
                maxAmount: maxAmount,
                receipt: receipt,
              },
            },
          });
        })
        .on('error', function (error) {
          dispatch({
            type: WALLET_ACTION,
            payload: {
              result: 'error',
              data: {
                spender: contractAddr,
                error: error.message,
              },
            },
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
};

const deposit = (network, contractAddr, amount, max) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(vaultAbi, contractAddr);

      if (max) {
        contract.methods
          .depositAll()
          .send({ from: address })
          .on('transactionHash', function (hash) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'success_pending',
                data: {
                  spender: contractAddr,
                  amount: amount,
                  hash: hash,
                },
              },
            });
          })
          .on('receipt', function (receipt) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'success',
                data: {
                  spender: contractAddr,
                  amount: amount,
                  receipt: receipt,
                },
              },
            });
          })
          .on('error', function (error) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'error',
                data: {
                  spender: contractAddr,
                  error: error.message,
                },
              },
            });
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        contract.methods
          .deposit(amount)
          .send({ from: address })
          .on('transactionHash', function (hash) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'success_pending',
                data: {
                  spender: contractAddr,
                  amount: amount,
                  hash: hash,
                },
              },
            });
          })
          .on('receipt', function (receipt) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'success',
                data: {
                  spender: contractAddr,
                  amount: amount,
                  receipt: receipt,
                },
              },
            });
          })
          .on('error', function (error) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'error',
                data: {
                  spender: contractAddr,
                  error: error.message,
                },
              },
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  };
};

const withdraw = (network, contractAddr, amount, max) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(vaultAbi, contractAddr);

      if (max) {
        contract.methods
          .withdrawAll()
          .send({ from: address })
          .on('transactionHash', function (hash) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'success_pending',
                data: {
                  spender: contractAddr,
                  amount: amount,
                  hash: hash,
                },
              },
            });
          })
          .on('receipt', function (receipt) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'success',
                data: {
                  spender: contractAddr,
                  amount: amount,
                  receipt: receipt,
                },
              },
            });
          })
          .on('error', function (error) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'error',
                data: {
                  spender: contractAddr,
                  error: error.message,
                },
              },
            });
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        contract.methods
          .withdraw(amount)
          .send({ from: address })
          .on('transactionHash', function (hash) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'success_pending',
                data: {
                  spender: contractAddr,
                  amount: amount,
                  hash: hash,
                },
              },
            });
          })
          .on('receipt', function (receipt) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'success',
                data: {
                  spender: contractAddr,
                  amount: amount,
                  receipt: receipt,
                },
              },
            });
          })
          .on('error', function (error) {
            dispatch({
              type: WALLET_ACTION,
              payload: {
                result: 'error',
                data: {
                  spender: contractAddr,
                  error: error.message,
                },
              },
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  };
};

const createWeb3Modal = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const clients = await getClientsForNetwork(state.walletReducer.network);
    const web3Modal = new Web3Modal(generateProviderOptions(state.walletReducer, clients));

    dispatch({ type: WALLET_CREATE_MODAL, payload: { data: web3Modal } });

    if (web3Modal.cachedProvider && web3Modal.cachedProvider === 'injected') {
      dispatch(connect());
    } else {
      await web3Modal.clearCachedProvider();
      dispatch({ type: WALLET_CONNECT_DONE, payload: { address: null } });
    }
  };
};

const generateProviderOptions = (wallet, clients) => {
  const networkId = config[wallet.network].chainId;
  const supported = config[wallet.network].supportedWallets;

  const generateCustomConnectors = () => {
    const list = {
      injected: {
        display: {
          name: 'Injected',
          description: 'Home-BrowserWallet',
        },
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            [networkId]: clients[~~(clients.length * Math.random())],
          },
        },
      },
      'custom-binance': {
        display: {
          name: 'Binance',
          description: 'Binance Chain Wallet',
          logo: require('images/wallets/binance-wallet.png').default,
        },
        package: 'binance',
        connector: async (ProviderPackage, options) => {
          const provider = window.BinanceChain;
          await provider.enable();
          return provider;
        },
      },
      'custom-math': {
        display: {
          name: 'Math',
          description: 'Math Wallet',
          logo: require('images/wallets/math-wallet.svg').default,
        },
        package: 'math',
        connector: connectors.injected,
      },
      'custom-twt': {
        display: {
          name: 'Trust',
          description: 'Trust Wallet',
          logo: require('images/wallets/trust-wallet.svg').default,
        },
        package: 'twt',
        connector: connectors.injected,
      },
      'custom-safepal': {
        display: {
          name: 'SafePal',
          description: 'SafePal App',
          logo: require('images/wallets/safepal-wallet.svg').default,
        },
        package: 'safepal',
        connector: connectors.injected,
      },
    };

    const newlist = [];
    for (const key in list) {
      if (supported.includes(key)) {
        newlist[key] = list[key];
      }
    }

    return newlist;
  };

  return {
    network: config[wallet.network].providerName,
    cacheProvider: true,
    providerOptions: generateCustomConnectors(),
  };
};

const obj = {
  setNetwork,
  createWeb3Modal,
  connect,
  disconnect,
  approval,
  deposit,
  withdraw,
};

export default obj;
