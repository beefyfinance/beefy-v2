import React, { memo, useCallback, useMemo } from 'react';

import { Checkbox, Theme, makeStyles } from '@material-ui/core';
import { VaultEntity } from '../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { BookmarkBorder, Bookmark } from '@material-ui/icons';
import { savedVaultsActions } from '../../../data/reducers/saved-vaults';
import { selectSavedVaultIds } from '../../../data/selectors/saved-vaults';
import { styles } from './styles';
import clsx from 'clsx';
import { Button } from '../../../../components/Button';

const useStyles = makeStyles(styles);

interface SaveButtonProps {
  vaultId: VaultEntity['id'];
  className?: string;
  text?: string;
}

const SaveButton = memo<SaveButtonProps>(function SaveButton({ vaultId, className, text }) {
  const classes = useStyles();

  const savedVaultIds = useAppSelector(selectSavedVaultIds);
  const dispatch = useAppDispatch();

  const isSaved = useMemo(() => {
    return savedVaultIds.includes(vaultId);
  }, [savedVaultIds]);

  const handleSave = useCallback(() => {
    if (isSaved) {
      const newSavedVaults = savedVaultIds.filter(id => id !== vaultId);
      dispatch(savedVaultsActions.setSavedVaultIds(newSavedVaults));
    } else {
      const savedVaults = [...savedVaultIds, vaultId];
      dispatch(savedVaultsActions.setSavedVaultIds(savedVaults));
    }
  }, [dispatch, isSaved, savedVaultIds]);

  return (
    <Button className={clsx(classes.shareButton, className)} onClick={handleSave} variant="middle">
      <div className={classes.iconHolder}>
        {isSaved ? (
          <Bookmark className={classes.shareIcon} />
        ) : (
          <BookmarkBorder className={classes.shareIcon} />
        )}
      </div>
      {text}
    </Button>
  );
});

export default SaveButton;
