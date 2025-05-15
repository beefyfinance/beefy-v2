import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { resolveAddressToDomain, resolveDomainToAddress } from '../actions/resolver.ts';
import { isIdleStatus } from '../reducers/wallet/resolver-types.ts';
import { selectAddressResolution, selectDomainResolution } from '../selectors/resolver.ts';

export function useResolveDomain(domain: string) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectDomainResolution(state, domain));

  useEffect(() => {
    if (domain && isIdleStatus(status)) {
      dispatch(resolveDomainToAddress({ domain }));
    }
  }, [dispatch, status, domain]);

  return status;
}

export function useResolveAddress(address: string | undefined) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectAddressResolution(state, address));

  useEffect(() => {
    if (address && isIdleStatus(status)) {
      dispatch(resolveAddressToDomain({ address }));
    }
  }, [dispatch, status, address]);

  return status;
}
