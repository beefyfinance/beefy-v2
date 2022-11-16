import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'moonbeam-beamswap',
    name: 'Beamswap',
    type: 'uniswapv2',
    routerAddress: '0x96b244391D98B62D19aE89b1A4dCcf0fc56970C7',
    factoryAddress: '0x985BcA32293A7A496300a48081947321177a86FD',
    pairInitHash: '0xe31da4209ffcce713230a74b5287fa8ec84797c9e77e1f7cfeccea015cdc97ea',
    swapFee: 0.003,
    getAmountOutMode: 'getAmountOut',
  },
  {
    id: 'moonbeam-stella',
    name: 'Stella',
    type: 'uniswapv2',
    routerAddress: '0xd0A01ec574D1fC6652eDF79cb2F880fd47D34Ab1',
    factoryAddress: '0x68A384D826D3678f78BB9FB1533c7E9577dACc0E',
    pairInitHash: '0x48a6ca3d52d0d0a6c53a83cc3c8688dd46ea4cb786b169ee959b95ad30f61643',
    swapFee: 0.0025,
    getAmountOutMode: 'getAmountOut',
  },
];
