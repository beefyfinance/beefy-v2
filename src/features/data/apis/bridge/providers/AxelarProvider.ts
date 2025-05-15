import type BigNumber from 'bignumber.js';
import { fromWei } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenErc20, TokenNative } from '../../../entities/token.ts';
import { selectChainNativeToken } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getAxelarApi } from '../../axelar/api.ts';
import type { BeefyAxelarBridgeConfig } from '../../config-types.ts';
import type { InputTokenAmount, TokenAmount } from '../../transact/transact-types.ts';
import { estimateArbitrumSequencerGas } from '../helpers/arbitrum.ts';
import { CommonBridgeProvider } from './CommonBridgeProvider.ts';

export class AxelarProvider extends CommonBridgeProvider<BeefyAxelarBridgeConfig> {
  public readonly id = 'axelar';

  protected async fetchBridgeFee(
    config: BeefyAxelarBridgeConfig,
    from: ChainEntity,
    to: ChainEntity,
    _input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<TokenAmount<TokenNative>> {
    const fromChain = config.chains[from.id];
    const toChain = config.chains[to.id];
    if (!fromChain || !toChain) {
      throw new Error(`bridge '${this.id}' not available for ${from.id}->${to.id}.`);
    }
    const api = await getAxelarApi();
    const native = selectChainNativeToken(state, from.id);
    const incomingGasLimit = await this.fetchIncomingGasLimit(config, from, to);

    const feeEstimate = await api.estimateGasFee(
      from,
      to,
      incomingGasLimit,
      fromChain.bridge,
      toChain.bridge
    );

    return {
      token: native,
      amount: fromWei(feeEstimate, native.decimals),
    };
  }

  protected async fetchIncomingGasLimit(
    config: BeefyAxelarBridgeConfig,
    from: ChainEntity,
    to: ChainEntity
  ): Promise<BigNumber> {
    if (to.id === 'arbitrum') {
      return await this.fetchIncomingGasLimitForArbitrum(config, from, to);
    }

    const toChain = config.chains[to.id];
    if (!toChain) {
      throw new Error(`bridge '${this.id}' not available for ${from.id}->${to.id}.`);
    }
    return toChain.gasLimits.incoming;
  }

  protected async fetchIncomingGasLimitForArbitrum(
    config: BeefyAxelarBridgeConfig,
    from: ChainEntity,
    to: ChainEntity
  ): Promise<BigNumber> {
    /**
     * execute(bytes32 commandId,string sourceChain,string sourceAddress,bytes payload)
     * where payload is (address to,uint256 amount)
     *
     * function selector - 8 bytes
     * commandId - 32 bytes
     * sourceChain offset - 32 bytes
     * sourceAddress offset - 32 bytes
     * payload offset - 32 bytes
     * sourceChain length - 32 bytes
     * sourceChain - 32 bytes
     * sourceAddress length - 32 bytes
     * sourceAddress - 64 bytes
     * payload length - 32 bytes
     * payload address - 32 bytes
     * payload amount - 32 bytes
     *
     * total - 392 bytes
     */
    const sequencerGas = await estimateArbitrumSequencerGas(to, 392);
    const toChain = config.chains[to.id];
    if (!toChain) {
      throw new Error(`bridge '${this.id}' not available for ${from.id}->${to.id}.`);
    }
    return sequencerGas.plus(toChain.gasLimits.incoming);
  }
}
