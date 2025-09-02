import { memo, useCallback, useState, useEffect } from 'react';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import ClearIcon from '../../../../../../images/icons/clear.svg?react';
import { styled } from '@repo/styles/jsx';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import {
  selectFilterChainIds,
  selectFilterContent,
  selectFilteredVaultCount,
  selectFilterPlatformIds,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainId } from '../../../../../data/entities/chain.ts';
import { isEqual } from 'lodash-es';
import { ScrollableDrawer } from '../../../../../../components/ScrollableDrawer/ScrollableDrawer.tsx';

export type MobileFiltersProps = {
  open: boolean;
  onClose: () => void;
};

export const MobileFilters = memo<MobileFiltersProps>(function MobileFilters({ open, onClose }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filteredVaultCount = useAppSelector(selectFilteredVaultCount);
  const content = useAppSelector(selectFilterContent);
  const platforms = useAppSelector(selectFilterPlatformIds);
  const chains = useAppSelector(selectFilterChainIds);
  const [platformsCopy, setPlatformsCopy] = useState<string[]>(platforms);
  const [chainsCopy, setChainsCopy] = useState<ChainId[]>(chains);

  const handleReset = useCallback(() => {
    if (content === FilterContent.Filter) {
      dispatch(filteredVaultsActions.reset());
      onClose();
    }

    if (content === FilterContent.Platform) {
      if (!isEqual(platforms, platformsCopy)) {
        dispatch(filteredVaultsActions.setPlatformIds(platformsCopy));
      }
    }

    if (content === FilterContent.Chains) {
      if (!isEqual(chains, chainsCopy)) {
        dispatch(filteredVaultsActions.setChainIds(chainsCopy));
      }
    }

    dispatch(filteredVaultsActions.setFilterContent(FilterContent.Filter));
  }, [content, dispatch, onClose, platforms, platformsCopy, chains, chainsCopy]);

  const handleShow = useCallback(() => {
    if (content !== FilterContent.Filter) {
      dispatch(filteredVaultsActions.setFilterContent(FilterContent.Filter));
    } else {
      onClose();
    }
  }, [content, dispatch, onClose]);

  useEffect(() => {
    if (content === FilterContent.Platform) {
      setPlatformsCopy(platforms);
    }

    if (content === FilterContent.Chains) {
      setChainsCopy(chains);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dispatch]);

  return (
    <ScrollableDrawer
      open={open}
      onClose={onClose}
      mainChildren={
        <>
          <ExtendedFilters />
        </>
      }
      footerChildren={
        <>
          <ClearButton borderless={true} onClick={handleReset}>
            {content !== FilterContent.Filter ?
              <>{t('Filter-Cancel')}</>
            : <>
                {t('Filter-Clear')}
                <CloseContainer>
                  <ClearIcon />
                </CloseContainer>
              </>
            }
          </ClearButton>
          <Button style={{ width: '70%' }} variant="cta" borderless={true} onClick={handleShow}>
            {t('Filter-ShownVaults', { number: filteredVaultCount })}
          </Button>
        </>
      }
    />
  );
});

const ClearButton = styled(Button, {
  base: {
    gap: '4px',
    width: '30%',
  },
});

const CloseContainer = styled('div', {
  base: {
    height: '20px',
    width: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& svg': {
      height: '15px',
      width: '15px',
    },
  },
});
