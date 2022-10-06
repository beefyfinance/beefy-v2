import React, { memo } from 'react';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc';
import { ChainEntity } from '../../../../../data/entities/chain';

export type ChainIconProps = {
  chainId: ChainEntity['id'];

  className?: string;
};
export const ChainIcon = memo<ChainIconProps>(function ChainIcon({ chainId, className }) {
  const src = getNetworkSrc(chainId);

  return src ? <img src={src} width={24} height={24} alt={chainId} className={className} /> : null;
});
