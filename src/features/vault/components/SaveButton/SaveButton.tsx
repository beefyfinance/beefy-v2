import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { BookmarkBorder, Bookmark } from '@material-ui/icons';
import { savedVaultsActions } from '../../../data/reducers/saved-vaults';
import { selectIsVaultIdSaved } from '../../../data/selectors/saved-vaults';
import { styles } from './styles';
import clsx from 'clsx';
import { Button } from '../../../../components/Button';

const useStyles = makeStyles(styles);

interface SaveButtonProps {
  vaultId: VaultEntity['id'];
  className?: string;
}

export const SaveButton = memo<SaveButtonProps>(function SaveButton({ vaultId, className }) {
  const classes = useStyles();

  const dispatch = useAppDispatch();

  const isSaved = useAppSelector(state => selectIsVaultIdSaved(state, vaultId));

  const handleSave = useCallback(() => {
    dispatch(savedVaultsActions.setSavedVaultIds(vaultId));
  }, [dispatch, isSaved]);

  return (
    <Button
      borderless={true}
      className={clsx(classes.shareButton, className)}
      onClick={handleSave}
      variant="middle"
    >
      {isSaved ? (
        <Bookmark className={classes.icon} />
      ) : (
        <BookmarkBorder className={classes.icon} />
      )}
    </Button>
  );
});
