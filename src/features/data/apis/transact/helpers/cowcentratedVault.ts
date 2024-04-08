import type Web3 from 'web3';
import type { BeefyState } from '../../../../../redux-types';
import type { VaultCowcentrated } from '../../../entities/vault';
import type { InputTokenAmount } from '../transact-types';
import type { MultiCall } from 'eth-multicall';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../../../config/abi/BeefyCowcentratedLiquidityVaultAbi';
import { toWeiString } from '../../../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import { viemToWeb3Abi } from '../../../../../helpers/web3';

export async function getCowcentratedVaultDepositSimulationAmount(
  userInput: InputTokenAmount[],
  vault: VaultCowcentrated,
  state: BeefyState,
  web3: Web3,
  multicall: MultiCall
) {
  const vaultContract = new web3.eth.Contract(
    viemToWeb3Abi(BeefyCowcentratedLiquidityVaultAbi),
    vault.earnContractAddress
  );
  const amt0 = toWeiString(userInput[0].amount, userInput[0].token.decimals);
  const amt1 = toWeiString(userInput[1].amount, userInput[1].token.decimals);

  type MulticallReturnType = [
    [
      {
        depositPreview: string;
      }
    ]
  ];

  const [[vaultData]]: MulticallReturnType = (await multicall.all([
    [
      {
        depositPreview: vaultContract.methods.previewDeposit(amt0, amt1),
      },
    ],
  ])) as MulticallReturnType;

  const depositPreview = new BigNumber(vaultData.depositPreview[0]);
  const usedToken0 = new BigNumber(vaultData.depositPreview[1]);
  const usedToken1 = new BigNumber(vaultData.depositPreview[1]);

  return {
    depositPreviewAmount: depositPreview,
    usedToken0,
    usedToken1,
  };
}

export async function getCowcentratedVaultWithdrawSimulationAmount(
  userInput: InputTokenAmount,
  vault: VaultCowcentrated,
  state: BeefyState,
  web3: Web3,
  multicall: MultiCall
) {
  const vaultContract = new web3.eth.Contract(
    viemToWeb3Abi(BeefyCowcentratedLiquidityVaultAbi),
    vault.earnContractAddress
  );
  const amount = toWeiString(userInput.amount, userInput.token.decimals);

  type MulticallReturnType = [
    [
      {
        withdrawPreview: string;
      }
    ]
  ];

  const [[vaultData]]: MulticallReturnType = (await multicall.all([
    [
      {
        withdrawPreview: vaultContract.methods.previewWithdraw(amount),
      },
    ],
  ])) as MulticallReturnType;

  const withdrawPreview = vaultData.withdrawPreview;

  return {
    withdrawPreviewAmounts: [new BigNumber(withdrawPreview[0]), new BigNumber(withdrawPreview[1])],
  };
}
