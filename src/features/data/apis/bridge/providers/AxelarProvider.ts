import type { BeefyAxelarBridgeConfig } from '../../config-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';
import type { ChainEntity } from '../../../entities/chain';
import type { InputTokenAmount, TokenAmount } from '../../transact/transact-types';
import type { TokenErc20, TokenNative } from '../../../entities/token';
import type { BeefyState } from '../../../../../redux-types';
import { getAxelarApi } from '../../instances';
import { selectChainNativeToken } from '../../../selectors/tokens';
import { fromWei } from '../../../../../helpers/big-number';
import type BigNumber from 'bignumber.js';
import { estimateArbitrumSequencerGas } from '../helpers/arbitrum';

export class AxelarProvider extends CommonBridgeProvider<BeefyAxelarBridgeConfig> {
  public readonly id = 'axelar' as const;

  protected async fetchBridgeFee(
    config: BeefyAxelarBridgeConfig,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<TokenAmount<TokenNative>> {
    const api = await getAxelarApi();
    const native = selectChainNativeToken(state, from.id);
    const incomingGasLimit = await this.fetchIncomingGasLimit(config, from, to);

    const feeEstimate = await api.estimateGasFee(
      from,
      to,
      incomingGasLimit,
      config.chains[from.id].bridge,
      config.chains[to.id].bridge
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

    return config.chains[to.id].gasLimits.incoming;
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
    return sequencerGas.plus(config.chains[to.id].gasLimits.incoming);
  }
}
