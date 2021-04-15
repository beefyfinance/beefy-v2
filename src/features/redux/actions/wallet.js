import {config} from '../../../config/config';
import {WALLET_CONNECT_BEGIN, WALLET_CONNECT_DONE, WALLET_CREATE_MODAL, WALLET_RPC} from "../constants";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal, {connectors} from "web3modal";
const Web3 = require('web3');

const getClientsForNetwork = async (net) => {
    return config[net].rpc;
}

const getAvailableNetworks = () => {
    const names = [];
    const ids = [];

    for(const net in config) {
        names.push(net);
        ids.push(config[net].chainId);
    }

    return [names, ids];
}

const checkNetworkSupport = (networkId) => {
    const [, ids] = getAvailableNetworks();
    return ids.includes(networkId);
}

const getNetworkAbbr = (networkId) => {
    const [names, ids] = getAvailableNetworks();
    return ids.includes(networkId) ? names[ids.indexOf(networkId)] : null;
}

const setNetwork = (net) => {
    console.log('redux setNetwork called.');

    return async (dispatch, getState) => {
        const state = getState();
        if(state.walletReducer.network !== net) {
            const clients = await getClientsForNetwork(net);
            localStorage.setItem('network', net);

            dispatch({type: "SET_NETWORK", payload: {network: net, clients: clients}});
            dispatch(createWeb3Modal());
        }
    };
}

const fetchRpc = () => {
    return async (dispatch, getState) => {

        const state = getState();
        const clients = await getClientsForNetwork(state.walletReducer.network);
        const connect = async () => {
            console.log('redux fetchRpc called. (' + state.walletReducer.network + ')');
            const web3 = await new Web3(clients[~~(clients.length * Math.random())]);

            try {
                await web3.eth.net.isListening();
                return dispatch({type: WALLET_RPC, payload: {rpc: web3}});
            } catch(err) {
                console.log('redux fetchRpc failed, retrying... (' + state.walletReducer.network + ')');
                setTimeout(async () => {
                    return await connect();
                }, 1000);
            }
        }

        if(!state.walletReducer.rpc) {
            await connect();
        }
    };
}

const connect = () => {
    return async (dispatch, getState) => {
        dispatch({type: WALLET_CONNECT_BEGIN});
        const state = getState();

        const close = async () => {
            await state.walletReducer.web3modal.clearCachedProvider();
            dispatch({type: WALLET_CONNECT_DONE, payload: {address: null}});
        }

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
            provider.on('accountsChanged', async (accounts) => {
                return accounts[0] !== undefined ?
                    dispatch({type: WALLET_CONNECT_DONE, payload: {address: accounts[0]}}) : await close();
            });
            provider.on('chainChanged', async (chainId) => {
                console.log('chainChanged');
                const networkId = web3.utils.isHex(chainId) ? web3.utils.hexToNumber(chainId) : chainId;
                if(checkNetworkSupport(networkId)) {
                    const net = getNetworkAbbr(networkId);
                    dispatch(setNetwork(net));
                } else {
                    await close();
                    console.log('show nice modal: Wallet network not supported: ' + networkId);
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

            if(networkId === config[state.walletReducer.network].chainId) {
                const accounts = await web3.eth.getAccounts();
                dispatch({type: WALLET_RPC, payload: {rpc: web3}});
                dispatch({type: WALLET_CONNECT_DONE, payload: {address: accounts[0]}});
            } else {
                await close();
                if(checkNetworkSupport(networkId) && provider) {
                    await provider.request({method: 'wallet_addEthereumChain', params: [config[state.walletReducer.network].walletSettings]});
                    dispatch(connect())
                } else {
                    // todo: show error to user for unsupported network
                    alert('show nice modal: Wallet network not supported: ' + networkId);
                    throw Error('Network not supported, check chainId.');
                }
            }
        } catch(err) {
            console.log('connect error', err);
            // todo: show modal error to user
            dispatch({type: WALLET_CONNECT_DONE, payload: {address: null}});
        }
    };
}

const disconnect = () => {
    return async (dispatch, getState) => {
        dispatch({type: WALLET_CONNECT_BEGIN});
        const state = getState();

        await state.walletReducer.web3modal.clearCachedProvider();
        dispatch({type: WALLET_CONNECT_DONE, payload: {address: null}});
    }
}

const createWeb3Modal = () => {
    return async (dispatch, getState) => {
        const state = getState();
        const clients = await getClientsForNetwork(state.walletReducer.network);
        const web3Modal = new Web3Modal(generateProviderOptions(state.walletReducer, clients));

        dispatch({type: WALLET_CREATE_MODAL, payload: {data: web3Modal}});

        if (web3Modal.cachedProvider && web3Modal.cachedProvider === 'injected') {
            dispatch(connect());
        } else {
            await web3Modal.clearCachedProvider();
            dispatch({type: WALLET_CONNECT_DONE, payload: {address: null}});
        }
    }
}

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
                    logo: require('../../../images/wallets/binance-wallet.png').default,
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
                    logo: require('../../../images/wallets/math-wallet.svg').default,
                },
                package: 'math',
                connector: connectors.injected,
            },
            'custom-twt': {
                display: {
                    name: 'Trust',
                    description: 'Trust Wallet',
                    logo: require('../../../images/wallets/trust-wallet.svg').default,
                },
                package: 'twt',
                connector: connectors.injected,
            },
            'custom-safepal': {
                display: {
                    name: 'SafePal',
                    description: 'SafePal App',
                    logo: require('../../../images/wallets/safepal-wallet.svg').default,
                },
                package: 'safepal',
                connector: connectors.injected,
            }};

        const newlist = []
        for(const key in list) {
            if(supported.includes(key)) {
                newlist[key] = list[key];
            }
        }

        return newlist;
    }

    return {
        network: config[wallet.network].providerName,
        cacheProvider: true,
        providerOptions: generateCustomConnectors(),
    }
}

const obj = {
    setNetwork,
    fetchRpc,
    createWeb3Modal,
    connect,
    disconnect,
}

export default obj
