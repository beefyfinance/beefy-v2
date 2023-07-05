import { useEffect, useState } from 'react';
import { ConicLpTokenStakerAbi } from '../../../../config/abi';
import { useAppSelector } from '../../../../store';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectChainById } from '../../../data/selectors/chains';
import { selectWalletAddressIfKnown } from '../../../data/selectors/wallet';
import { getWeb3Instance } from '../../../data/apis/instances';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../helpers/big-number';

interface useReadConicLiquidityStakedProps {
  vaultId: VaultEntity['id'];
}

export const useReadConicLiquidityStaked = ({ vaultId }: useReadConicLiquidityStakedProps) => {
  const [userBalance, setUserBalance] = useState<BigNumber>(BIG_ZERO);
  const walletAddress = useAppSelector(state => selectWalletAddressIfKnown(state));
  const ethChain = useAppSelector(state => selectChainById(state, 'ethereum'));
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  useEffect(() => {
    async function fetchData() {
      const web3 = await getWeb3Instance(ethChain);
      const lpTokenStaker = new web3.eth.Contract(ConicLpTokenStakerAbi, CONIC_LP_TOKEN_STAKER);
      const userBalance = await lpTokenStaker.methods
        .getUserBalanceForPool(CONIC_POOL_ADRRESSES[vaultId], walletAddress)
        .call();

      setUserBalance(new BigNumber(userBalance).shiftedBy(-vaultWant.decimals));
    }

    fetchData();
  }, [ethChain, vaultId, vaultWant.decimals, walletAddress]);

  return userBalance;
};
