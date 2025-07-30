import { styled } from '@repo/styles/jsx';
import {
  type ChangeEvent,
  memo,
  type MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  restoreDefaultRpcsOnSingleChain,
  updateActiveRpc,
} from '../../../../features/data/actions/chains.ts';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import {
  selectActiveRpcUrlForChain,
  selectChainById,
} from '../../../../features/data/selectors/chains.ts';
import { useAppDispatch, useAppSelector } from '../../../../features/data/store/hooks.ts';
import { Button } from '../../../Button/Button.tsx';
import { ChainIcon } from '../../../ChainIcon/ChainIcon.tsx';
import { BaseInput } from '../../../Form/Input/BaseInput.tsx';
import type { ItemInnerProps } from '../../../SearchableList/Item.tsx';
import { useBreakpoint } from '../../../MediaQueries/useBreakpoint.ts';

const URL_REGX = /^https:\/\//;

export interface RpcEditProps {
  chainId: ChainEntity['id'];
  onBack: () => void;
}

export const RpcEdit = memo(function RpcEdit({ chainId, onBack }: RpcEditProps) {
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const [updatedRPC, setUpdatedRPC] = useState('');
  const activeChainRpc = useAppSelector(state => selectActiveRpcUrlForChain(state, chain.id));

  const isMobile = useBreakpoint({ to: 'xs' });

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

  const pasteFromClipboard = useCallback(() => {
    navigator.clipboard
      .readText()
      .then(clipboardText => {
        setUpdatedRPC(clipboardText);
      })
      .catch(error => {
        console.error('Failed to read from clipboard:', error);
        // Fallback for older browsers or when clipboard access is denied
        // You could show a toast notification here if needed
      });
  }, []);

  const dispatch = useAppDispatch();
  const onSave = useCallback(() => {
    dispatch(updateActiveRpc(chain, updatedRPC));
    onBack();
  }, [dispatch, onBack, chain, updatedRPC]);

  return (
    <>
      <Top>
        <ChainInfo>
          {`Modify ${chain.name} RPC`}
          <ChainIcon chainId={chain.id} />
        </ChainInfo>
        <InputGroup>
          <BaseInput
            value={updatedRPC}
            onChange={handleSearchText}
            fullWidth={true}
            placeholder={activeChainRpc[0]}
            endAdornment={
              <PasteButton variant="transparent" size="sm" onClick={pasteFromClipboard}>
                Paste
              </PasteButton>
            }
          />
          {isError && <InputError>{t('RpcModal-InvalidRpc')}</InputError>}
        </InputGroup>
      </Top>
      <Footer>
        <ActionButtons>
          {!isMobile && (
            <Button onClick={onBack} size="lg" fullWidth={true}>
              {t('RpcModal-Cancel')}
            </Button>
          )}
          <Button disabled={isDisabled} onClick={onSave} size="lg" fullWidth={true}>
            {t('RpcModal-Save')}
          </Button>
        </ActionButtons>
        {!isMobile && <ChainRpcReset value={chainId} />}
      </Footer>
    </>
  );
});

export const ChainRpcReset = memo(function ChainRpcReset({
  value: chain,
}: ItemInnerProps<ChainEntity['id']>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeChainRpc = useAppSelector(state => selectActiveRpcUrlForChain(state, chain));
  const defaultRPC = useAppSelector(state => selectChainById(state, chain)).rpc;
  const chainEntity = useAppSelector(state => selectChainById(state, chain));

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    e => {
      e.stopPropagation();
      dispatch(restoreDefaultRpcsOnSingleChain(chainEntity));
    },
    [dispatch, chainEntity]
  );

  const rpcsAreEqual = useMemo(
    () =>
      activeChainRpc.length === defaultRPC.length &&
      activeChainRpc.every((url, index) => url === defaultRPC[index]),
    [activeChainRpc, defaultRPC]
  );

  if (rpcsAreEqual) return <></>;

  return (
    <Button fullWidth={true} borderless={true} onClick={handleClick}>
      {t('RpcModal-Reset')}
    </Button>
  );
});

const PasteButton = styled(Button, {
  base: {
    color: 'green.40',
    paddingBlock: '0',
    paddingInline: '0',
  },
});

const Top = styled('div', {
  base: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: `${12 - 2}px`,
    rowGap: '8px',
    color: 'text.middle',
    flexGrow: '1',
  },
});

const ChainInfo = styled('div', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    columnGap: '8px',
    color: 'text.middle',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4px',
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

const Footer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: `0px 10px 12px 10px`,
    borderRadius: '0 0 8px 8px',
    gap: '8px',
  },
});

const ActionButtons = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
});
