import { memo, useCallback } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { useAppDispatch, useAppSelector } from '../../../../store.ts';
import BookmarkBorder from '../../../../images/icons/mui/BookmarkBorder.svg?react';
import Bookmark from '../../../../images/icons/mui/Bookmark.svg?react';
import { savedVaultsActions } from '../../../data/reducers/saved-vaults.ts';
import { selectIsVaultIdSaved } from '../../../data/selectors/saved-vaults.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { Button } from '../../../../components/Button/Button.tsx';

const useStyles = legacyMakeStyles(styles);

interface SaveButtonProps {
  vaultId: VaultEntity['id'];
  css?: CssStyles;
}

export const SaveButton = memo(function SaveButton({ vaultId, css: cssProp }: SaveButtonProps) {
  const classes = useStyles();

  const dispatch = useAppDispatch();

  const isSaved = useAppSelector(state => selectIsVaultIdSaved(state, vaultId));

  const handleSave = useCallback(() => {
    dispatch(savedVaultsActions.setSavedVaultIds(vaultId));
  }, [dispatch, vaultId]);

  return (
    <Button borderless={true} css={css.raw(styles.shareButton, cssProp)} onClick={handleSave}>
      {isSaved ? (
        <Bookmark className={classes.icon} />
      ) : (
        <BookmarkBorder className={classes.icon} />
      )}
    </Button>
  );
});
