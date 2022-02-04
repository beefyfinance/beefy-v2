import { Grid, Typography, Button, makeStyles } from '@material-ui/core';
import { useMemo, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ScrollContainer from 'react-indiana-drag-scroll';
import { CATEGORY_LABELS } from './CategoryLabels';
import { styles } from './styles';
import { selectVaultCategory } from '../../../data/selectors/filtered-vaults';
import { useDispatch, useSelector } from 'react-redux';
import { actions as filteredVaultActions } from '../../../data/reducers/filtered-vaults';

const useStyles = makeStyles(styles as any);
const _FilterCategories = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const cagegory = useSelector(selectVaultCategory);
  const setCategory = useCallback(
    category => dispatch(filteredVaultActions.setVaultCategory(category)),
    [dispatch]
  );

  const labels = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(CATEGORY_LABELS).map(([key, i18nKey]) => [key, t(i18nKey)])
      ),
    [t]
  );

  return (
    <Grid container spacing={2} className={classes.categories}>
      <Grid item xs={12} className={classes.filtersSlider}>
        <ScrollContainer
          className={classes.filtersSliderContainer}
          vertical={false}
          nativeMobileScroll={false}
        >
          {Object.entries(labels).map(([key, label]) => (
            <div key={key} className={classes.filterItem}>
              <Button
                className={cagegory === key ? classes.selected : classes.inactive}
                fullWidth={true}
                onClick={() => setCategory(key)}
              >
                <Typography variant="body1" className={classes.text}>
                  {label}
                </Typography>
              </Button>
            </div>
          ))}
        </ScrollContainer>
      </Grid>
    </Grid>
  );
};

export const FilterCategories = memo(_FilterCategories);
