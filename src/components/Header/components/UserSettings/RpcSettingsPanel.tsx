import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import BackArrow from '../../../../images/back-arrow.svg?react';
import CloseIcon from '../../../../images/icons/mui/Close.svg?react';
import { RpcEdit } from './RpcEdit.tsx';
import { styled } from '@repo/styles/jsx';
import { RpcMenu } from './RpcMenu.tsx';

export const RpcSettingsPanel = memo(function RpcSettingsModal({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const { t } = useTranslation();
  const [editChainId, setEditChainId] = useState<ChainEntity['id'] | null>(null);
  const onBack = useCallback(() => {
    setEditChainId(null);
  }, [setEditChainId]);
  const showStepBack = editChainId !== null;

  return (
    <Panel>
      <PanelHeader>
        {showStepBack && (
          <BackButton onClick={onBack}>
            <BackArrow width={12} height={9} />
          </BackButton>
        )}
        <Title>{t('RpcModal-Menu-Edit')}</Title>
        <CloseButton onClick={handleClose}>
          <CloseIcon />
        </CloseButton>
      </PanelHeader>
      <PanelContent>
        {editChainId ? (
          <RpcEdit chainId={editChainId} onBack={onBack} />
        ) : (
          <RpcMenu onSelect={setEditChainId} />
        )}
      </PanelContent>
    </Panel>
  );
});

const Panel = styled('div', {
  base: {
    width: '276px',
  },
});

const PanelHeader = styled('div', {
  base: {
    textStyle: 'body.med',
    color: 'text.light',
    display: 'flex',
    alignItems: 'center',
    padding: `${12 - 2}px`,
    backgroundColor: 'background.content.dark',
    borderRadius: '8px 8px 0px 0px',
    gap: '8px',
  },
});

const Title = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
  },
});

const BackButton = styled(
  'button',
  {
    base: {
      color: 'text.light',
      background: 'bayOfMany',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      flexShrink: 0,
      flexGrow: 0,
      _hover: {
        color: 'text.light',
        cursor: 'pointer',
      },
    },
  },
  {
    defaultProps: {
      type: 'button',
    },
  }
);

const CloseButton = styled(
  'button',
  {
    base: {
      color: 'text.dark',
      marginLeft: 'auto',
      _hover: {
        color: 'text.light',
        cursor: 'pointer',
      },
    },
  },
  {
    defaultProps: {
      type: 'button',
    },
  }
);

const PanelContent = styled('div', {
  base: {
    height: '356px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
});
