import {
  type Abi,
  type Account,
  type Address,
  type Chain,
  type Client,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type EstimateContractGasParameters,
  type Hash,
  type SimulateContractParameters,
  type Transport,
  type WriteContractParameters,
} from 'viem';
import {
  estimateContractGas as originalEstimateContractGas,
  simulateContract as originalSimulateContract,
  writeContract as originalWriteContract,
} from 'viem/actions';
import { refTxSentCallback } from './callbacks.ts';
import { getReferralTag } from './tag.ts';

const supportedChains = new Set([1, 10, 137, 1135, 8453, 42161, 42220, 80094]);
/** @dev ledger erc20_plugin causes error to be thrown if there is extra calldata, even if blind signing is enabled */
const disabledFunctions = new Set(['approve', '0x095ea7b3']);

function getAccountAddress(account: Account | Address | null | undefined) {
  if (account === null || account === undefined) {
    return undefined;
  }
  if (typeof account === 'string') {
    return account;
  }
  return account.address;
}

function getDataSuffix<chain extends Chain | undefined, account extends Account | undefined>(
  client: Client<Transport, chain, account>,
  parameters: {
    chain?: Chain | null | undefined;
    dataSuffix?: Address | undefined;
    account?: Account | Address | null | undefined;
    functionName: string;
  }
) {
  const dataSuffix = parameters.dataSuffix;
  if (dataSuffix) {
    console.warn(`Can not set dataSuffix, already set.`);
    return undefined;
  }
  const chainId = parameters.chain?.id || client.chain?.id;
  if (!chainId) {
    console.warn(`Can not set dataSuffix, no chainId found.`);
    return undefined;
  }
  if (!supportedChains.has(chainId)) {
    // silently ignore unsupported chains
    return undefined;
  }
  if (disabledFunctions.has(parameters.functionName)) {
    // silently ignore unsupported functions
    return undefined;
  }
  const address = getAccountAddress(parameters.account) || getAccountAddress(client.account);
  if (!address) {
    console.warn(`Can not set dataSuffix, no account address found.`);
    return undefined;
  }

  return {
    suffix: `0x${getReferralTag(address)}`,
    chainId,
  };
}

function makeWriteContract<chain extends Chain | undefined, account extends Account | undefined>(
  client: Client<Transport, chain, account>,
  onSent?: (chainId: number, hash: Hash) => void
) {
  return <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: WriteContractParameters<
      abi,
      functionName,
      args,
      Chain | undefined,
      Account | undefined,
      chainOverride
    >
  ) => {
    const data = getDataSuffix(client, parameters);
    if (!data) {
      return originalWriteContract(client, parameters);
    }

    const promise = originalWriteContract<chain, account, abi, functionName, args, chainOverride>(
      client,
      {
        ...parameters,
        dataSuffix: data.suffix,
      }
    );
    if (onSent) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises -- has .catch attached in bindTransactionEvents
      promise.then(hash => {
        onSent(data.chainId, hash);
      });
    }
    return promise;
  };
}

function makeEstimateContractGas<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(client: Client<transport, chain, account>) {
  return <
    chain2 extends Chain | undefined,
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  >(
    parameters: EstimateContractGasParameters<abi, functionName, args, chain2>
  ) => {
    const data = getDataSuffix(client, parameters);
    if (!data) {
      return originalEstimateContractGas(
        client,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- viem itself does the same with publicActions
        parameters as any
      );
    }

    const newParameters = {
      ...parameters,
      dataSuffix: data.suffix,
    };
    return originalEstimateContractGas(
      client,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- viem itself does the same with publicActions
      newParameters as any
    );
  };
}

function makeSimulateContract<chain extends Chain | undefined, account extends Account | undefined>(
  client: Client<Transport, chain, account>
) {
  return <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    const args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
    chainOverride extends Chain | undefined = undefined,
    accountOverride extends Account | Address | null | undefined = undefined,
  >(
    parameters: SimulateContractParameters<
      abi,
      functionName,
      args,
      chain,
      chainOverride,
      accountOverride
    >
  ) => {
    const data = getDataSuffix(client, parameters);
    if (!data) {
      return originalSimulateContract(client, parameters);
    }

    return originalSimulateContract<
      chain,
      account,
      abi,
      functionName,
      args,
      chainOverride,
      accountOverride
    >(client, {
      ...parameters,
      dataSuffix: data.suffix,
    });
  };
}

/** Wraps write-related methods of viem client to append the divvi tag calldata */
export function withDivvi<T extends Client>(originalClient: T) {
  return originalClient.extend(client => ({
    ...('estimateContractGas' in client ?
      { estimateContractGas: makeEstimateContractGas(client) }
    : {}),
    ...('simulateContract' in client ? { simulateContract: makeSimulateContract(client) } : {}),
    ...('writeContract' in client ?
      { writeContract: makeWriteContract(client, refTxSentCallback) }
    : {}),
  })) as unknown as T;
}
