import { memo, type ReactNode, useMemo } from 'react';
import type { ChainId } from '../../../features/data/entities/chain';
import { useAppSelector } from '../../../store';
import { selectChainById } from '../../../features/data/selectors/chains';
import { ExternalLink } from './ExternalLink';
import { explorerAddressUrl } from '../../../helpers/url';
import { formatAddressShort } from '../../../helpers/format';

export type ExplorerAddressLinkProps = {
  chainId: ChainId;
  address: string;
  children?: ReactNode;
};

export const ExplorerAddressLink = memo<ExplorerAddressLinkProps>(function ExplorerAddressLink({
  chainId,
  address,
  children,
}) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const href = useMemo(() => explorerAddressUrl(chain, address), [chain, address]);
  return <ExternalLink href={href} children={children || formatAddressShort(address)} />;
});
