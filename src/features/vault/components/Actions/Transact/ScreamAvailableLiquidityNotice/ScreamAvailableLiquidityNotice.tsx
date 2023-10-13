import { memo, useCallback, useEffect, useState } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { AlertWarning } from '../../../../../../components/Alerts';
import { getWeb3Instance } from '../../../../../data/apis/instances';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectChainById } from '../../../../../data/selectors/chains';
import type { ChainEntity } from '../../../../../data/entities/chain';
import vaultABI from '../../../../../../config/abi/vault.json';
import erc20ABI from '../../../../../../config/abi/erc20.json';
import type { AbiItem } from 'web3-utils';
import { MultiCall } from 'eth-multicall';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import type { TokenEntity } from '../../../../../data/entities/token';
import { BigNumber } from 'bignumber.js';
import { useAsync } from '../../../../../../helpers/useAsync';

const strategyABI: AbiItem[] = [
  {
    inputs: [],
    name: 'iToken',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const enableForVaults: VaultEntity['id'][] = ['scream-tusd', 'scream-frax'];
type ScreamAvailableLiquidityProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};

async function getLiquidity(vault: VaultEntity, chain: ChainEntity, depositToken: TokenEntity) {
  const web3 = await getWeb3Instance(chain);
  const vaultContract = new web3.eth.Contract(vaultABI as AbiItem[], vault.earnContractAddress);
  const strategyAddress = await vaultContract.methods.strategy().call();
  const strategyContract = new web3.eth.Contract(strategyABI as AbiItem[], strategyAddress);
  const iTokenAddress = await strategyContract.methods.iToken().call();
  const wantContract = new web3.eth.Contract(erc20ABI as AbiItem[], vault.depositTokenAddress);
  const multicall = new MultiCall(web3, chain.multicallAddress);
  const [[balances]] = await multicall.all([
    [
      {
        strategy: wantContract.methods.balanceOf(strategyAddress),
        iToken: wantContract.methods.balanceOf(iTokenAddress),
      },
    ],
  ]);

  const balanceOfStrategy = new BigNumber(balances.strategy || '0').shiftedBy(
    -depositToken.decimals
  );
  const balanceOfiToken = new BigNumber(balances.iToken || '0').shiftedBy(-depositToken.decimals);
  const totalAvailable = balanceOfStrategy.plus(balanceOfiToken);

  return totalAvailable.toNumber();
}

// underlying.balanceOf(strategy) + underlying.balanceOf(scToken).
const ScreamAvailableLiquidityImpl = memo<ScreamAvailableLiquidityProps>(
  function ScreamAvailableLiquidityImpl({ vaultId, onChange }) {
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const chain = useAppSelector(state => selectChainById(state, vault.chainId));
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
    );
    const fetchLiquidity = useCallback(() => {
      return getLiquidity(vault, chain, depositToken);
    }, [vault, chain, depositToken]);
    const {
      execute: updateLiquidity,
      status: updateStatus,
      value: liquidity,
    } = useAsync(fetchLiquidity, 0);
    const [haveUpdatedOnce, setHaveUpdatedOnce] = useState(false);

    useEffect(() => {
      const handle = setInterval(updateLiquidity, 30000);
      return () => clearInterval(handle);
    }, [updateLiquidity]);

    useEffect(() => {
      if (haveUpdatedOnce === false && updateStatus === 'success') {
        setHaveUpdatedOnce(true);
      }
    }, [updateStatus, haveUpdatedOnce, setHaveUpdatedOnce]);

    useEffect(() => {
      onChange(haveUpdatedOnce && liquidity === 0);
    }, [liquidity, haveUpdatedOnce, onChange]);

    return (
      <AlertWarning>
        <p>There is limited liquidity in the underlying protocol to withdraw.</p>
        {haveUpdatedOnce ? (
          <p>
            <strong>Available liquidity:</strong>{' '}
            {liquidity.toLocaleString(navigator.language, {
              maximumFractionDigits: depositToken.decimals,
            })}{' '}
            {depositToken.symbol}
          </p>
        ) : null}
      </AlertWarning>
    );
  }
);

export const ScreamAvailableLiquidityNotice = memo<ScreamAvailableLiquidityProps>(
  function ScreamAvailableLiquidity({ vaultId, onChange }) {
    if (enableForVaults.includes(vaultId)) {
      return <ScreamAvailableLiquidityImpl vaultId={vaultId} onChange={onChange} />;
    }

    return null;
  }
);
