import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { transactSwitchDepositSource } from '../../../../../data/actions/transact.ts';
import { DepositSource } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactDepositSource,
  selectTransactUserHasOtherDepositedVaults,
} from '../../../../../data/selectors/transact.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';

export const DepositSourceToggle = memo(function DepositSourceToggle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const source = useAppSelector(selectTransactDepositSource);
  const hasOtherDeposits = useAppSelector(selectTransactUserHasOtherDepositedVaults);

  const handleSelect = useCallback(
    (next: DepositSource) => {
      if (next !== source) {
        dispatch(transactSwitchDepositSource(next));
      }
    },
    [dispatch, source]
  );

  if (!hasOtherDeposits) {
    return null;
  }

  return (
    <Row>
      <SourceOption
        selected={source === DepositSource.Wallet}
        title={t('Transact-DepositSource-Wallet-Title')}
        subtitle={t('Transact-DepositSource-Wallet-Subtitle')}
        onClick={() => handleSelect(DepositSource.Wallet)}
      />
      <SourceOption
        selected={source === DepositSource.Vault}
        title={t('Transact-DepositSource-Vault-Title')}
        subtitle={t('Transact-DepositSource-Vault-Subtitle')}
        onClick={() => handleSelect(DepositSource.Vault)}
      />
    </Row>
  );
});

type SourceOptionProps = {
  selected: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
};

const SourceOption = memo(function SourceOption({
  selected,
  title,
  subtitle,
  onClick,
}: SourceOptionProps) {
  return (
    <OptionButton type="button" selected={selected} onClick={onClick}>
      <OptionHeader>
        <Radio selected={selected}>
          {selected ?
            <RadioDot />
          : null}
        </Radio>
        <OptionTitle>{title}</OptionTitle>
      </OptionHeader>
      <OptionSubtitle>{subtitle}</OptionSubtitle>
    </OptionButton>
  );
});

const Row = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
});

const OptionButton = styled('button', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0',
    paddingBlock: '8px',
    paddingInline: '10px',
    margin: '0',
    minWidth: 0,
    width: '100%',
    borderRadius: '8px',
    border: 'solid 1px',
    borderColor: 'background.border',
    background: 'background.content.dark',
    textAlign: 'left',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'none',
    color: 'text.light',
    '&:hover, &:focus-visible': {
      borderColor: 'text.dark',
    },
  },
  variants: {
    selected: {
      true: {
        borderColor: 'text.dark',
      },
    },
  },
});

const OptionHeader = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const Radio = styled('span', {
  base: {
    flexShrink: 0,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: 'solid 1.6px',
    borderColor: 'text.dark',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  variants: {
    selected: {
      true: {},
    },
  },
});

const RadioDot = styled('span', {
  base: {
    width: '6.4px',
    height: '6.4px',
    borderRadius: '50%',
    background: 'text.lightest',
  },
});

const OptionTitle = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.lightest',
  },
});

const OptionSubtitle = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    paddingLeft: '24px',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
  },
});
