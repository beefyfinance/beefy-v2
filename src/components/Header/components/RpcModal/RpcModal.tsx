import { memo, type RefObject, useCallback, useState } from 'react';
import { Edit, Menu } from './RpcSteps.tsx';
import { useTranslation } from 'react-i18next';
import { styles } from './styles.ts';
import CloseIcon from '../../../../images/icons/mui/Close.svg?react';
import SettingsIcon from '../../../../images/icons/settings.svg?react';
import BackArrow from '../../../../images/back-arrow.svg?react';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';
import { DropdownContent } from '../../../Dropdown/DropdownContent.tsx';

const useStyles = legacyMakeStyles(styles);

export const RpcModal = memo(function RpcModal({ handleClose }: { handleClose: () => void }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [editChainId, setEditChainId] = useState<ChainEntity['id'] | null>(null);
  const onBack = useCallback(() => {
    setEditChainId(null);
  }, [setEditChainId]);
  const showStepBack = editChainId !== null;

  return (
    <>
      <div className={classes.header}>
        <div className={classes.headerTitle}>
          {showStepBack && (
            <button type="button" onClick={onBack} className={classes.backButton}>
              <BackArrow className={classes.backIcon} />
            </button>
          )}
          {t('RpcModal-Menu-Edit')}
        </div>
        <CloseIcon onClick={handleClose} className={classes.cross} />
      </div>
      <div className={classes.content}>
        {editChainId ? (
          <Edit chainId={editChainId} onBack={onBack} />
        ) : (
          <Menu onSelect={setEditChainId} />
        )}
      </div>
    </>
  );
});

export const RpcModalTrigger = memo(function ModalTrigger({
  anchorEl,
  isOpen,
  onOpen,
  onClose,
}: {
  anchorEl: RefObject<HTMLElement>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const classes = useStyles();

  const handleChange = useCallback(
    (shouldOpen: boolean) => {
      if (shouldOpen) {
        onOpen();
      } else {
        onClose();
      }
    },
    [onOpen, onClose]
  );

  return (
    <DropdownProvider
      variant="dark"
      placement="bottom-end"
      autoWidth={false}
      open={isOpen}
      onChange={handleChange}
      reference={anchorEl}
    >
      <DropdownTrigger.button className={classes.container}>
        <SettingsIcon height={24} width={24} />
        <div className={classes.line} />
      </DropdownTrigger.button>
      <DropdownContent>
        <RpcModal handleClose={onClose} />
      </DropdownContent>
    </DropdownProvider>
  );
});
