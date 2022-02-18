import Web3 from 'web3';

import { WALLET_ACTION, WALLET_ACTION_RESET } from '../constants';
import erc20Abi from '../../../config/abi/erc20.json';
import vaultAbi from '../../../config/abi/vault.json';
import boostAbi from '../../../config/abi/boost.json';
import zapAbi from '../../../config/abi/zap.json';

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

export const wallet = {
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
