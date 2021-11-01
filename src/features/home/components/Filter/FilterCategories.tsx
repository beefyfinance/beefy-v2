import { Grid, Typography, Button, makeStyles } from "@material-ui/core";
import { useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import ScrollContainer from "react-indiana-drag-scroll";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { CATEGORY_LABELS } from "./categoryLabels";
import { styles } from './styles';

const useStyles = makeStyles(styles);

const _FilterCategories = ({ category, handleChange }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const labels = useMemo(
      () =>
        Object.fromEntries(
          Object.entries(CATEGORY_LABELS).map(([key, i18nKey]) => [key, t(i18nKey)])
        ),
      [t]
    );
  
    return (
      <Grid container spacing={2} className={classes.categories}>
        <Grid item xs={12}>
          <Typography variant={'h4'}>{t('Filter-Categories')}</Typography>
        </Grid>
        <Grid item xs={12} className={classes.filtersSlider}>
          <ScrollContainer
            className={classes.filtersSliderContainer}
            vertical={false}
            nativeMobileScroll={false}
          >
            {Object.entries(labels).map(([key, label]) => (
              <div key={key} className={classes.filterItem}>
                <Button
                  className={category === key ? classes.selected : classes[key]}
                  fullWidth={true}
                  disabled={category === key}
                  onClick={() => handleChange('category', key)}
                >
                  <Typography className={classes.text}>{label}</Typography>
                  {category === key ? <ArrowDropDownIcon /> : ''}
                </Button>
              </div>
            ))}
          </ScrollContainer>
        </Grid>
      </Grid>
    );
  }
  
export const FilterCategories = memo(_FilterCategories);