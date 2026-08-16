import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { ToggleButtons } from '../../../../components/ToggleButtons/ToggleButtons.tsx';
import { getIcon } from '../../../../helpers/iconSrc.ts';
import { replaceVaultIdInUrl } from '../../../../helpers/url.ts';
import { useBreakpoint } from '../../../../hooks/useBreakpoint.ts';
import AutocompoundIcon from '../../../../images/icons/autocompound.svg?react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { isVaultRetired, type VaultEntity } from '../../../data/entities/vault.ts';
import {
  selectClmFamilyForVaultPage,
  selectVaultByIdOrUndefined,
} from '../../../data/selectors/vaults.ts';

export type AutocompoundToggleProps = {
  vaultId: VaultEntity['id'];
};

export const AutocompoundToggle = memo(function AutocompoundToggle({
  vaultId,
}: AutocompoundToggleProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useBreakpoint({ to: 'xs' });
  const family = useAppSelector(state => selectClmFamilyForVaultPage(state, vaultId));
  const poolSide = useAppSelector(state =>
    family?.poolSideId ? selectVaultByIdOrUndefined(state, family.poolSideId) : undefined
  );
  const vaultSide = useAppSelector(state =>
    family?.vaultSideId ? selectVaultByIdOrUndefined(state, family.vaultSideId) : undefined
  );
  const value = family?.activeSide === 'vault' ? 'on' : 'off';

  const handleChange = useCallback(
    (next: string) => {
      if (!family || next === value) {
        return;
      }
      const targetId = next === 'on' ? family.vaultSideId : family.poolSideId;
      if (!targetId) {
        return;
      }
      navigate(replaceVaultIdInUrl(location, targetId), {
        replace: true,
        state: { preserveScroll: true },
      });
    },
    [family, value, navigate, location]
  );

  if (!family || !family.poolSideId || !family.vaultSideId) {
    return null;
  }

  const withRetiredHint = (label: string, side: VaultEntity | undefined) =>
    side && isVaultRetired(side) ? `${label} (${t('VaultTag-Retired')})` : label;

  return (
    <Holder>
      <ToggleButtons
        value={value}
        options={[
          {
            value: 'off',
            label: (
              <OptionLabel>
                <img src={getIcon('clm')} width={12} height={12} alt="" />
                {withRetiredHint(t('Vault-ClmToggle-Pool'), poolSide)}
              </OptionLabel>
            ),
          },
          {
            value: 'on',
            label: (
              <OptionLabel>
                <AutocompoundIcon width={12} height={12} />
                {withRetiredHint(t('Vault-ClmToggle-Vault'), vaultSide)}
              </OptionLabel>
            ),
          },
        ]}
        onChange={handleChange}
        variant="filter"
        fullWidth={isMobile}
      />
    </Holder>
  );
});

const OptionLabel = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
});

const Holder = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: '0',
    // last in the wrapping header row: takes its own full-width line on small screens
    width: '100%',
    order: 1,
    sm: {
      width: 'auto',
      order: 0,
    },
  },
});
