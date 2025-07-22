import type { Address } from 'viem';
import BigNumber from 'bignumber.js';
import { chunk } from 'lodash-es';
import { BeefyV2AppMulticallAbi } from '../../../../config/abi/BeefyV2AppMulticallAbi.ts';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { BoostPromoEntity } from '../../entities/promo.ts';
import type { TokenEntity, TokenErc20 } from '../../entities/token.ts';
import { isTokenErc20 } from '../../entities/token.ts';
import type { VaultGov, VaultStandard } from '../../entities/vault.ts';
import { selectTokenByAddress } from '../../selectors/tokens.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import type { BeefyState } from '../../store/types.ts';
import { featureFlag_getAllowanceApiChunkSize } from '../../utils/feature-flags.ts';
import { fetchContract } from '../rpc-contract/viem-contract.ts';
import type { FetchAllAllowanceResult, IAllowanceApi } from './allowance-types.ts';

export class AllowanceAPI<T extends ChainEntity> implements IAllowanceApi {
  constructor(protected chain: T) {}

  public async fetchAllAllowances(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostPromoEntity[],
    walletAddress: string
  ): Promise<FetchAllAllowanceResult> {
    const appMulticallContract = fetchContract(
      this.chain.appMulticallContractAddress,
      BeefyV2AppMulticallAbi,
      this.chain.id
    );

    // first, build a list of tokens and spenders we want info on
    const allowanceCallsByToken: {
      [tokenAddress: string]: { tokenAddress: TokenEntity['address']; spenders: Set<string> };
    } = {};
    const tokensByAddress: { [tokenAddress: TokenEntity['address']]: TokenEntity } = {};
    const addTokenAddressesToCalls = (tokenAddress: string, spenderAddress: string) => {
      const token = selectTokenByAddress(state, this.chain.id, tokenAddress);
      const keyTokenAddress = token.address.toLowerCase();
      if (!isTokenErc20(token)) {
        throw new Error(`Can't query allowance of non erc20 token, skipping ${token.id}`);
      }
      if (allowanceCallsByToken[keyTokenAddress] === undefined) {
        allowanceCallsByToken[keyTokenAddress] = {
          tokenAddress: token.address,
          spenders: new Set(),
        };
      }
      allowanceCallsByToken[keyTokenAddress].spenders.add(spenderAddress);
      // keep a map to get decimals at the end
      if (tokensByAddress[keyTokenAddress] === undefined) {
        tokensByAddress[keyTokenAddress] = token;
      }
    };

    for (const standardVault of standardVaults) {
      addTokenAddressesToCalls(standardVault.receiptTokenAddress, standardVault.contractAddress);
      addTokenAddressesToCalls(standardVault.depositTokenAddress, standardVault.contractAddress);
    }
    for (const govVault of govVaults) {
      addTokenAddressesToCalls(govVault.depositTokenAddress, govVault.contractAddress);
    }
    for (const boost of boosts) {
      const vault = selectVaultById(state, boost.vaultId);
      addTokenAddressesToCalls(vault.contractAddress, boost.contractAddress);
    }

    // if we send too much in a single call, we get "execution reversed"
    const CHUNK_SIZE = featureFlag_getAllowanceApiChunkSize();

    const allowanceCalls = Object.entries(allowanceCallsByToken);
    const callBatches = chunk(allowanceCalls, CHUNK_SIZE);

    const allowanceResults = await Promise.all(
      callBatches.map(callBatch => {
        return appMulticallContract.read.getAllowancesFlat([
          callBatch.map(([tokenAddress, _]) => tokenAddress as Address),
          callBatch.map(([_, spendersCalls]) => Array.from(spendersCalls.spenders) as Address[]),
          walletAddress as Address,
        ]);
      })
    );

    // now reassign results
    const res: FetchAllAllowanceResult = [];

    callBatches.forEach((callBatch, index) => {
      const batchResults = allowanceResults[index];
      let resIdx = 0;
      for (const spendersCalls of callBatch.map(c => c[1])) {
        for (const spenderAddress of Array.from(spendersCalls.spenders)) {
          const allowance = batchResults[resIdx];
          res.push({
            tokenAddress: spendersCalls.tokenAddress,
            spenderAddress,
            allowance:
              allowance === 0n ? BIG_ZERO : (
                new BigNumber(allowance.toString(10)).shiftedBy(
                  -tokensByAddress[spendersCalls.tokenAddress.toLowerCase()].decimals
                )
              ),
          });

          resIdx++;
        }
      }
    });

    return res;
  }

  async fetchTokensAllowance(
    state: BeefyState,
    tokens: TokenErc20[],
    walletAddress: string,
    spenderAddress: string
  ) {
    const appMulticallContract = fetchContract(
      this.chain.appMulticallContractAddress,
      BeefyV2AppMulticallAbi,
      this.chain.id
    );

    // first, build a list of tokens and spenders we want info on
    const allowanceCallsByToken: {
      [tokenAddress: string]: { tokenAddress: TokenEntity['address']; spenders: Set<string> };
    } = {};
    const tokensByAddress: { [tokenAddress: TokenEntity['address']]: TokenEntity } = {};
    const addTokenAddressesToCalls = (tokenAddress: string, spenderAddress: string) => {
      const token = selectTokenByAddress(state, this.chain.id, tokenAddress);
      const keyTokenAddress = token.address.toLowerCase();
      if (!isTokenErc20(token)) {
        throw new Error(`Can't query allowance of non erc20 token, skipping ${token.id}`);
      }
      if (allowanceCallsByToken[keyTokenAddress] === undefined) {
        allowanceCallsByToken[keyTokenAddress] = {
          tokenAddress: token.address,
          spenders: new Set(),
        };
      }
      allowanceCallsByToken[keyTokenAddress].spenders.add(spenderAddress);
      // keep a map to get decimals at the end
      if (tokensByAddress[keyTokenAddress] === undefined) {
        tokensByAddress[keyTokenAddress] = token;
      }
    };

    for (const token of tokens) {
      addTokenAddressesToCalls(token.address, spenderAddress);
    }

    // if we send too much in a single call, we get "execution reversed"
    const CHUNK_SIZE = featureFlag_getAllowanceApiChunkSize();

    const allowanceCalls = Object.entries(allowanceCallsByToken);
    const callBatches = chunk(allowanceCalls, CHUNK_SIZE);

    const allowanceResults = await Promise.all(
      callBatches.map(callBatch =>
        appMulticallContract.read.getAllowancesFlat([
          callBatch.map(([tokenAddress, _]) => tokenAddress as Address),
          callBatch.map(([_, spendersCalls]) => Array.from(spendersCalls.spenders) as Address[]),
          walletAddress as Address,
        ])
      )
    );

    const res: FetchAllAllowanceResult = [];

    callBatches.forEach((callBatch, index) => {
      const batchResults = allowanceResults[index];
      let resIdx = 0;
      for (const spendersCalls of callBatch.map(c => c[1])) {
        for (const spenderAddress of Array.from(spendersCalls.spenders)) {
          const allowance = batchResults[resIdx];
          res.push({
            tokenAddress: spendersCalls.tokenAddress,
            spenderAddress,
            allowance:
              allowance === 0n ? BIG_ZERO : (
                new BigNumber(allowance.toString(10)).shiftedBy(
                  -tokensByAddress[spendersCalls.tokenAddress.toLowerCase()].decimals
                )
              ),
          });

          resIdx++;
        }
      }
    });

    return res;
  }
}
