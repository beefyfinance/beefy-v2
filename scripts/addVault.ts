// To run: yarn vault ethereum <0x12312312>
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import { promises as fs } from 'fs';

import { chainRpcs } from './config';
import vaultABI from '../src/config/abi/vault.json';
import stratABI from '../src/config/abi/strategy.json';
import erc20ABI from '../src/config/abi/erc20.json';
import { AbiItem } from 'web3-utils';

let vaultsFile = './src/config/vault/$chain.json';

async function vaultData(chain, vaultAddress) {
  const web3 = new Web3(chainRpcs[chain]);
  const abi = [...vaultABI, ...stratABI];
  const vaultContract = new web3.eth.Contract(abi as AbiItem[], vaultAddress);
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);
  let calls: ShapeWithLabel[] = [
    {
      want: vaultContract.methods.want(),
      mooToken: vaultContract.methods.symbol(),
    },
  ];
  let [results] = await multicall.all([calls]);
  const params = results[0];

  const tokenContract = new web3.eth.Contract(erc20ABI as AbiItem[], params.want);
  calls = [
    {
      token: tokenContract.methods.symbol(),
      tokenDecimals: tokenContract.methods.decimals(),
    },
  ];
  [results] = await multicall.all([calls]);
  const token = results[0];

  const provider =
    params.mooToken.startsWith('mooCurve') || params.mooToken.startsWith('mooConvex')
      ? 'curve'
      : params.mooToken.startsWith('mooCake')
      ? 'pancakeswap'
      : 'XXX';
  const platform = params.mooToken.startsWith('mooCurve')
    ? 'curve'
    : params.mooToken.startsWith('mooConvex')
    ? 'convex'
    : params.mooToken.startsWith('mooCake')
    ? 'pancakeswap'
    : 'XXX';

  return { ...params, ...token, ...{ provider, platform } };
}

async function generateVault() {
  const chain = process.argv[2];
  const vaultAddress = process.argv[3];
  const id = process.argv[4];
  vaultsFile = vaultsFile.replace('$chain', chain);

  const vault = await vaultData(chain, vaultAddress);

  const newVault = {
    id: id,
    name: vault.token,
    token: vault.token,
    tokenAddress: vault.want,
    tokenDecimals: Number(vault.tokenDecimals),
    tokenProviderId: vault.provider,
    earnedToken: vault.mooToken,
    earnedTokenAddress: vaultAddress,
    earnContractAddress: vaultAddress,
    oracle: 'lps',
    oracleId: id,
    status: 'active',
    platformId: vault.platform,
    assets: [vault.token],
    strategyTypeId: 'multi-lp',
    risks: ['COMPLEXITY_LOW', 'IL_NONE', 'MCAP_MEDIUM', 'AUDIT', 'CONTRACTS_VERIFIED'],
    addLiquidityUrl: 'XXX',
    network: chain,
    createdAt: Math.floor(Date.now() / 1000),
  };

  const vaults = JSON.parse(await fs.readFile(vaultsFile, 'utf8'));
  const newBoosts = [newVault, ...vaults];
  await fs.writeFile(vaultsFile, JSON.stringify(newBoosts, null, 2));
}

generateVault().catch(err => {
  console.error(err);
  process.exit(-1);
});
