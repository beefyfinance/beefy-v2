import { memo, type ReactNode, useMemo } from 'react';
import type { ChainId } from '../../../features/data/entities/chain.ts';
import { selectChainById } from '../../../features/data/selectors/chains.ts';
import { formatAddressShort } from '../../../helpers/format.ts';
import { explorerAddressUrl } from '../../../helpers/url.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { ExternalLink } from './ExternalLink.tsx';

export type ExplorerAddressLinkProps = {
  chainId: ChainId;
  address: string;
  children?: ReactNode;
};

export const ExplorerAddressLink = memo(function ExplorerAddressLink({
  chainId,
  address,
  children,
}: ExplorerAddressLinkProps) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const href = useMemo(() => explorerAddressUrl(chain, address), [chain, address]);
  return <ExternalLink href={href} children={children || formatAddressShort(address)} />;
});
