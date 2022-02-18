import { MultiCall } from 'eth-multicall';
import BigNumber from 'bignumber.js';
import { config } from '../../../config/config';
import { BIG_ZERO, byDecimals, convertAmountToRawNumber } from '../../../helpers/format';
import zapAbi from '../../../config/abi/zap.json';
import uniswapV2PairABI from '../../../config/abi/uniswapV2Pair.json';
import uniswapV2RouterABI from '../../../config/abi/uniswapV2Router.json';
import { getWeb3Instance } from '../../data/apis/instances';

export const estimateZapDeposit = ({ vault, formData, setFormData }) => {
  const web3 = getWeb3Instance(vault.chainId);
  const tokenIn = formData.zap.tokens.find(t => t.symbol === formData.deposit.token);
  const tokenOut = formData.zap.tokens.find(t => t.symbol !== formData.deposit.token);

  const zapEstimate = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    amountIn: BIG_ZERO,
    amountOut: BIG_ZERO,
    isLoading: false,
  };

  if (formData.deposit.amount.isZero()) {
    return setFormData(prevFormData => {
      prevFormData.deposit.zapEstimate = zapEstimate;
      return { ...prevFormData };
    });
  }

  const zapAddress = formData.zap.address;
  const vaultAddress = vault.earnContractAddress;
  const tokenAmount = convertAmountToRawNumber(formData.deposit.amount, tokenIn.decimals);

  setFormData(prevFormData => {
    if (prevFormData.deposit.zapEstimate.isLoading) {
      return prevFormData;
    }
    prevFormData.deposit.zapEstimate.isLoading = true;
    return { ...prevFormData };
  });

  const contract = new web3[vault.network].eth.Contract(zapAbi, zapAddress);

  return contract.methods
    .estimateSwap(vaultAddress, tokenIn.address, tokenAmount)
    .call()
    .then(response => {
      setFormData(prevFormData => {
        if (formData.deposit.amount === prevFormData.deposit.amount) {
          prevFormData.deposit.zapEstimate = {
            ...zapEstimate,
            amountIn: byDecimals(response.swapAmountIn, tokenIn.decimals),
            amountOut: byDecimals(response.swapAmountOut, tokenOut.decimals),
          };
          return { ...prevFormData };
        }
        return prevFormData;
      });
    });
};

export const estimateZapWithdraw = ({ vault, formData, setFormData }) => {
  const web3 = getWeb3Instance(vault.chainId);
  const tokenOut = formData.zap.tokens.find(t => t.symbol === formData.withdraw.token);
  const tokenIn = formData.zap.tokens.find(t => t.symbol !== formData.withdraw.token);

  const zapEstimate = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    amountIn: BIG_ZERO,
    amountOut: BIG_ZERO,
    isLoading: false,
  };

  if (formData.withdraw.amount.isZero()) {
    return setFormData(prevFormData => {
      prevFormData.withdraw.zapEstimate = zapEstimate;
      return { ...prevFormData };
    });
  }

  setFormData(prevFormData => {
    if (prevFormData.withdraw.zapEstimate.isLoading) {
      return prevFormData;
    }
    prevFormData.withdraw.zapEstimate.isLoading = true;
    return { ...prevFormData };
  });

  const multicall = new MultiCall(web3[vault.network], config[vault.network].multicallAddress);
  const pairContract = new web3[vault.network].eth.Contract(uniswapV2PairABI, vault.tokenAddress);

  const multicallPromise = multicall
    .all([
      [
        {
          totalSupply: pairContract.methods.totalSupply(),
          decimals: pairContract.methods.decimals(),
          token0: pairContract.methods.token0(),
          token1: pairContract.methods.token1(),
          reserves: pairContract.methods.getReserves(),
        },
      ],
    ])
    .then(([[pair]]) => {
      const reserveIn = tokenIn.address === pair.token0 ? pair.reserves[0] : pair.reserves[1];
      const reserveOut = tokenOut.address === pair.token1 ? pair.reserves[1] : pair.reserves[0];

      const tokenAmount = formData.withdraw.amount.times(
        new BigNumber('10').pow(vault.tokenDecimals)
      );
      const equity = tokenAmount.dividedBy(pair.totalSupply);
      const amountIn = equity
        .multipliedBy(reserveIn)
        .decimalPlaces(0, BigNumber.ROUND_DOWN)
        .toString(10);

      const routerContract = new web3[vault.network].eth.Contract(
        uniswapV2RouterABI,
        formData.zap.router
      );

      return routerContract.methods
        .getAmountOut(amountIn, reserveIn, reserveOut)
        .call()
        .then(amountOut => {
          setFormData(prevFormData => {
            if (formData.withdraw.amount === prevFormData.withdraw.amount) {
              prevFormData.withdraw.zapEstimate = {
                ...zapEstimate,
                amountIn: byDecimals(amountIn, tokenIn.decimals),
                amountOut: byDecimals(amountOut, tokenOut.decimals),
              };
              return { ...prevFormData };
            }
            return prevFormData;
          });
        });
    });

  return multicallPromise;
};
