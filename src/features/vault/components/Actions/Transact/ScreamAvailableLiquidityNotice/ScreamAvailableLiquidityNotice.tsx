import { memo, useCallback, useEffect, useState } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { useAppSelector } from '../../../../../../store.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { StandardVaultAbi } from '../../../../../../config/abi/StandardVaultAbi.ts';
import { ERC20Abi } from '../../../../../../config/abi/ERC20Abi.ts';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { BigNumber } from 'bignumber.js';
import { useAsync } from '../../../../../../helpers/useAsync.ts';
import { fetchContract } from '../../../../../data/apis/rpc-contract/viem-contract.ts';

const strategyABI = [
  {
    inputs: [],
    name: 'iToken',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const enableForVaults: VaultEntity['id'][] = ['scream-tusd', 'scream-frax'];
type ScreamAvailableLiquidityProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};

async function getLiquidity(vault: VaultEntity, chain: ChainEntity, depositToken: TokenEntity) {
  const vaultContract = fetchContract(vault.contractAddress, StandardVaultAbi, chain.id);
  const strategyAddress = await vaultContract.read.strategy();

  const strategyContract = fetchContract(strategyAddress, strategyABI, chain.id);
  const iTokenAddress = await strategyContract.read.iToken();

  const wantTokenContract = fetchContract(vault.depositTokenAddress, ERC20Abi, chain.id);

  const [strategyBalance, iTokenBalance] = await Promise.all([
    wantTokenContract.read.balanceOf([strategyAddress]),
    wantTokenContract.read.balanceOf([iTokenAddress]),
  ]);

  const balanceOfStrategy = new BigNumber((strategyBalance || 0n).toString(10)).shiftedBy(
    -depositToken.decimals
  );
  const balanceOfiToken = new BigNumber((iTokenBalance || 0n).toString(10)).shiftedBy(
    -depositToken.decimals
  );
  const totalAvailable = balanceOfStrategy.plus(balanceOfiToken);

  return totalAvailable.toNumber();
}

// underlying.balanceOf(strategy) + underlying.balanceOf(scToken).
const ScreamAvailableLiquidityImpl = memo(function ScreamAvailableLiquidityImpl({
  vaultId,
  onChange,
}: ScreamAvailableLiquidityProps) {
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
    if (!haveUpdatedOnce && updateStatus === 'success') {
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
          {(liquidity || 0).toLocaleString('en-US', {
            maximumFractionDigits: depositToken.decimals,
          })}{' '}
          {depositToken.symbol}
        </p>
      ) : null}
    </AlertWarning>
  );
});

export const ScreamAvailableLiquidityNotice = memo(function ScreamAvailableLiquidity({
  vaultId,
  onChange,
}: ScreamAvailableLiquidityProps) {
  if (enableForVaults.includes(vaultId)) {
    return <ScreamAvailableLiquidityImpl vaultId={vaultId} onChange={onChange} />;
  }

  return null;
});
