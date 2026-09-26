import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import WalletIcon from '../../../../../../images/icons/wallet2.svg?react';
import { transactSelectSelection } from '../../../../../data/actions/transact.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  depositFromVaultEntriesEqual,
  selectTransactDepositFromVaultEntries,
} from '../../../../../data/selectors/transact.ts';
import { selectUserVaultBalanceInShareTokenIncludingDisplaced } from '../../../../../data/selectors/balance.ts';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { BeefyState } from '../../../../../data/store/types.ts';
import { HeldAmount, ModeIcon } from '../../../ClmMode/ClmModeSelector.tsx';
import {
  OptionBody,
  OptionCard,
  OptionGlyph,
  OptionHeading,
  OptionNote,
  OptionSection,
  OptionTitle,
  OptionTitleRow,
} from '../../../ClmMode/OptionCard.tsx';
import {
  CLM_SIDE_NAME,
  type ClmSide,
  getClmSide,
  sortByClmSide,
} from '../DepositFromVaultSelectList/groups.ts';

type DepositFromClmPositionsProps = {
  clmId: VaultEntity['id'];
};

/** Second picker screen for a CLM held on several sides: which position to deposit from */
export const DepositFromClmPositions = memo(function DepositFromClmPositions({
  clmId,
}: DepositFromClmPositionsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entries = useAppSelector(
    selectTransactDepositFromVaultEntries,
    depositFromVaultEntriesEqual
  );
  const vaultById = useAppSelector((state: BeefyState) => state.entities.vaults.byId);
  const positions = useMemo(
    () =>
      sortByClmSide(
        entries.filter(entry => {
          const vault = vaultById[entry.vaultId];
          return !!vault && isCowcentratedLikeVault(vault) && vault.cowcentratedIds.clm === clmId;
        }),
        vaultById
      ),
    [entries, vaultById, clmId]
  );
  const handleSelect = useCallback(
    (selectionId: string) => {
      dispatch(transactSelectSelection({ selectionId, resetInput: true }));
    },
    [dispatch]
  );

  return (
    <Container>
      <OptionSection>
        <OptionHeading>{t('Transact-DepositFromVault-From')}</OptionHeading>
        {positions.map(entry => {
          const side = getClmSide(vaultById[entry.vaultId]!)!;
          return (
            <OptionCard key={entry.vaultId}>
              <PositionButton
                side={side}
                vaultId={entry.vaultId}
                selectionId={entry.id}
                valueUsd={formatLargeUsd(entry.balanceUsd)}
                onSelect={handleSelect}
              />
            </OptionCard>
          );
        })}
      </OptionSection>
    </Container>
  );
});

type PositionButtonProps = {
  side: ClmSide;
  vaultId: VaultEntity['id'];
  selectionId: string;
  valueUsd: string;
  onSelect: (selectionId: string) => void;
};

const PositionButton = memo(function PositionButton({
  side,
  vaultId,
  selectionId,
  valueUsd,
  onSelect,
}: PositionButtonProps) {
  const { t } = useTranslation();
  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);

  return (
    <Button type="button" onClick={handleClick}>
      <OptionGlyph aria-hidden={true}>
        {side === 'bare' ?
          <Wallet />
        : <ModeIcon mode={side} />}
      </OptionGlyph>
      <OptionBody>
        <OptionTitleRow>
          <OptionTitle>{t(CLM_SIDE_NAME[side])}</OptionTitle>
          <Value>{valueUsd}</Value>
          <Chevron />
        </OptionTitleRow>
        <OptionNote>
          {side === 'bare' ?
            <ClmTokenAmount clmId={vaultId} />
          : <HeldAmount sideId={vaultId} />}
        </OptionNote>
      </OptionBody>
    </Button>
  );
});

/** loose CLM tokens are the CLM's own share token, so there is nothing to convert */
const ClmTokenAmount = memo(function ClmTokenAmount({ clmId }: { clmId: VaultEntity['id'] }) {
  const clm = useAppSelector(state => selectVaultById(state, clmId));
  const token = useAppSelector(state =>
    selectTokenByAddress(state, clm.chainId, clm.contractAddress)
  );
  const amount = useAppSelector(state =>
    selectUserVaultBalanceInShareTokenIncludingDisplaced(state, clmId)
  );
  return (
    <>
      <TokenAmountFromEntity amount={amount} token={token} /> {token.symbol}
    </>
  );
});

const Container = styled('div', {
  base: {
    padding: '16px',
    sm: {
      padding: '24px',
    },
  },
});

const Button = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    textAlign: 'left',
    paddingBlock: '12px',
    paddingInlineEnd: '12px',
    cursor: 'pointer',
    borderRadius: '8px',
    _hover: {
      backgroundColor: 'background.content.light',
    },
    _focusVisible: {
      outline: 'solid 2px {colors.text.dark}',
      outlineOffset: '-2px',
    },
  },
});

const Value = styled('span', {
  base: {
    flexShrink: '0',
    marginLeft: 'auto',
    textStyle: 'body.medium',
    color: 'text.light',
  },
});

const Chevron = styled(ChevronRight, {
  base: {
    flex: 'none',
    width: '16px',
    height: '16px',
    color: 'text.dark',
  },
});

const Wallet = styled(WalletIcon, {
  base: {
    flex: 'none',
    width: '18px',
    height: '18px',
    color: 'text.light',
  },
});
