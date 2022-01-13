import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, { connectors } from 'web3modal';
import { CloverConnector } from '@clover-network/clover-connector';
import WalletLink from 'walletlink';
import Web3 from 'web3';

import { config } from '../../../config/config';
import {
  UNSUPPORTED_NETWORK,
  WALLET_ACTION,
  WALLET_ACTION_RESET,
  WALLET_CONNECT_BEGIN,
  WALLET_CONNECT_DONE,
  WALLET_CREATE_MODAL,
  WALLET_DISCONNECT,
} from '../constants';
import erc20Abi from '../../../config/abi/erc20.json';
import vaultAbi from '../../../config/abi/vault.json';
import boostAbi from '../../../config/abi/boost.json';
import zapAbi from '../../../config/abi/zap.json';

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
            outputFormatter: web3.utils.hexToNumber as any,
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
        // console.log(accounts);
        // dispatch({ type: WALLET_RPC, payload: { rpc: state.rpc[state.network] } });
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
      dispatch({ type: WALLET_DISCONNECT });
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
      const contract = new web3.eth.Contract(erc20Abi as any, tokenAddr);
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
      const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);

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

const beefIn = (
  network,
  vaultAddress,
  isETH,
  tokenAddress,
  tokenAmount,
  zapAddress,
  swapAmountOutMin
) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(zapAbi as any, zapAddress);

      const transaction = (() => {
        if (isETH) {
          return contract.methods.beefInETH(vaultAddress, swapAmountOutMin).send({
            from: address,
            value: tokenAmount,
          });
        } else {
          return contract.methods
            .beefIn(vaultAddress, swapAmountOutMin, tokenAddress, tokenAmount)
            .send({
              from: address,
            });
        }
      })();

      transaction
        .on('transactionHash', function (hash) {
          dispatch({
            type: WALLET_ACTION,
            payload: {
              result: 'success_pending',
              data: {
                spender: zapAddress,
                amount: tokenAmount,
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
                spender: zapAddress,
                amount: tokenAmount,
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
                spender: zapAddress,
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

const beefOut = (network, vaultAddress, amount, zapAddress) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(zapAbi as any, zapAddress);

      const transaction = (() => {
        return contract.methods.beefOut(vaultAddress, amount).send({
          from: address,
        });
      })();

      transaction
        .on('transactionHash', function (hash) {
          dispatch({
            type: WALLET_ACTION,
            payload: {
              result: 'success_pending',
              data: {
                spender: zapAddress,
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
                spender: zapAddress,
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
                spender: zapAddress,
                error: error.message,
              },
            },
          });
        })
        .catch(error => {
          console.error(error);
        });
    }
  };
};

const beefOutAndSwap = (network, vaultAddress, amount, zapAddress, tokenOut, swapAmountOutMin) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(zapAbi as any, zapAddress);

      const transaction = (() => {
        return contract.methods
          .beefOutAndSwap(vaultAddress, amount, tokenOut, swapAmountOutMin)
          .send({
            from: address,
          });
      })();

      transaction
        .on('transactionHash', function (hash) {
          dispatch({
            type: WALLET_ACTION,
            payload: {
              result: 'success_pending',
              data: {
                spender: zapAddress,
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
                spender: zapAddress,
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
                spender: zapAddress,
                error: error.message,
              },
            },
          });
        })
        .catch(error => {
          console.error(error);
        });
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
      const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);

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

const stake = (network, contractAddr, amount) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

      contract.methods
        .stake(amount)
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
  };
};

const unstake = (network, contractAddr, amount) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

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
  };
};

const claim = (network, contractAddr, amount) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

      contract.methods
        .getReward()
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
  };
};

const exit = (network, contractAddr, amount) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

      contract.methods
        .exit()
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
  };
};

const depositNative = (network, contractAddr, amount) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);

      contract.methods
        .depositBNB()
        .send({ from: address, value: amount })
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
  };
};

const withdrawNative = (network, contractAddr, amount, max) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = state.walletReducer.address;
    const provider = await state.walletReducer.web3modal.connect();

    if (address && provider) {
      const web3 = await new Web3(provider);
      const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);

      if (max) {
        contract.methods
          .withdrawAllBNB()
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
          .withdrawBNB(amount)
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
    const web3Modal = new Web3Modal(generateProviderOptions(state.walletReducer, clients) as any);

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
  const networkRpc = config[wallet.network].rpc;

  const generateCustomConnectors = () => {
    const list = {
      injected: {
        display: {
          name: 'MetaMask',
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
          logo: require(`../../../images/wallets/binance-wallet.png`).default,
        },
        package: 'binance',
        connector: async (ProviderPackage, options) => {
          const provider = (window as any).BinanceChain;
          await provider.enable();
          return provider;
        },
      },
      'custom-clover': {
        display: {
          logo: require(`../../../images/wallets/clover.png`).default,
          name: 'Clover Wallet',
          description: 'Connect with your Clover wallet and earn CLV',
        },
        options: {
          supportedChainIds: [networkId],
        },
        package: CloverConnector,
        connector: async (ProviderPackage, options) => {
          const provider = new ProviderPackage(options);
          await provider.activate();
          return provider.getProvider();
        },
      },
      'custom-coinbase': {
        display: {
          logo: require(`../../../images/wallets/coinbase.png`).default,
          name: 'Coinbase Wallet',
          description: 'Connect your Coinbase Wallet',
        },
        options: {
          appName: 'Beefy Finance',
          appLogoUrl: 'https://app.beefy.finance/static/media/BIFI.e797b2e4.png',
          darkMode: false,
        },
        package: WalletLink,
        connector: async (ProviderPackage, options) => {
          const walletLink = new ProviderPackage(options);

          const provider = walletLink.makeWeb3Provider(networkRpc, networkId);

          await provider.enable();

          return provider;
        },
      },
      'custom-wallet-connect': {
        display: {
          logo: require(`../../../images/wallets/wallet-connect.svg`).default,
          name: 'Wallet Connect',
          description: 'Scan your WalletConnect to Connect',
        },
        options: {
          rpc: { networkId: networkRpc },
        },
        package: WalletConnectProvider,
        connector: async (ProviderPackage, options) => {
          const provider = new ProviderPackage(options);

          await provider.enable();

          return provider;
        },
      },
      'custom-math': {
        display: {
          name: 'Math',
          description: 'Math Wallet',
          logo: require(`../../../images/wallets/math-wallet.svg`).default,
        },
        package: 'math',
        connector: connectors.injected,
      },
      'custom-twt': {
        display: {
          name: 'Trust',
          description: 'Trust Wallet',
          logo: require(`../../../images/wallets/trust-wallet.svg`).default,
        },
        package: 'twt',
        connector: connectors.injected,
      },
      'custom-safepal': {
        display: {
          name: 'SafePal',
          description: 'SafePal App',
          logo: require(`../../../images/wallets/safepal-wallet.svg`).default,
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

export const wallet = {
  setNetwork,
  createWeb3Modal,
  connect,
  disconnect,
  approval,
  deposit,
  beefIn,
  beefOut,
  beefOutAndSwap,
  withdraw,
  stake,
  unstake,
  claim,
  exit,
  depositNative,
  withdrawNative,
};
