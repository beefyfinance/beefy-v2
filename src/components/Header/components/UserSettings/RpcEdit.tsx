import { type ChangeEvent, memo, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store.ts';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { updateActiveRpc } from '../../../../features/data/actions/chains.ts';
import { BaseInput } from '../../../Form/Input/BaseInput.tsx';
import { Button } from '../../../Button/Button.tsx';
import { ChainIcon } from '../../../ChainIcon/ChainIcon.tsx';
import { styled } from '@repo/styles/jsx';

const URL_REGX = /^https:\/\//;

export interface RpcEditProps {
  chainId: ChainEntity['id'];
  onBack: () => void;
}

export const RpcEdit = memo(function RpcEdit({ chainId, onBack }: RpcEditProps) {
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const [updatedRPC, setUpdatedRPC] = useState('');

  const isError = useMemo(() => {
    return updatedRPC.length > 7 && !URL_REGX.test(updatedRPC);
  }, [updatedRPC]);

  const isDisabled = useMemo(() => {
    return updatedRPC.length <= 7 || isError;
  }, [isError, updatedRPC.length]);

  const handleSearchText = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUpdatedRPC(e.target.value);
    },
    [setUpdatedRPC]
  );

  const dispatch = useAppDispatch();
  const onSave = useCallback(() => {
    dispatch(updateActiveRpc(chain, updatedRPC));
    onBack();
  }, [dispatch, onBack, chain, updatedRPC]);

  return (
    <>
      <Top>
        <ChainInfo>
          <ChainIcon chainId={chain.id} />
          {chain.name}
        </ChainInfo>
        <InputGroup>
          <BaseInput
            value={updatedRPC}
            onChange={handleSearchText}
            fullWidth={true}
            placeholder={t('RpcModal-InputPlaceholder')}
          />
          {isError && <InputError>{t('RpcModal-InvalidRpc')}</InputError>}
        </InputGroup>
        <Explainer>{t('RpcModal-EmptyList')}</Explainer>
      </Top>
      <Footer>
        <Button disabled={isDisabled} onClick={onSave} size="lg" fullWidth={true}>
          {t('RpcModal-Save')}
        </Button>
      </Footer>
    </>
  );
});

const Top = styled('div', {
  base: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: `${12 - 2}px`,
    rowGap: '16px',
    color: 'text.middle',
    flexGrow: '1',
  },
});

const ChainInfo = styled('div', {
  base: {
    textStyle: 'body.med',
    display: 'flex',
    columnGap: '8px',
    color: 'text.middle',
  },
});

const InputGroup = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
});

const InputError = styled('div', {
  base: {
    textStyle: 'body.sm',
    color: 'indicators.error',
    marginLeft: '16px',
    transition: 'ease-in-out 2s',
  },
});

const Explainer = styled('div', {
  base: {
    textStyle: 'body.sm.med',
    padding: '12px',
    backgroundColor: 'background.content.light',
    borderRadius: '8px',
    color: 'text.middle',
  },
});

const Footer = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
    padding: `${12 - 2}px`,
    borderRadius: '0 0 8px 8px',
  },
});
