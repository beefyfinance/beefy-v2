import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import AnimateHeight from 'react-animate-height';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import styles from './styles';
import LabeledDropdown from 'components/LabeledDropdown';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { getAvailableNetworks } from 'helpers/utils';
import { ToggleButton } from '@material-ui/lab';
import { Search } from '@material-ui/icons';
import { FILTER_DEFAULT } from '../../hooks/useFilteredVaults';
import ReactSiema from 'react-siema';

const useStyles = makeStyles(styles);

const CATEGORY_LABELS = {
  all: 'Filter-CatgryAll',
  stable: 'Filter-CatgryStabl',
  beefy: 'Filter-CatgryBeefy',
  bluechip: 'Filter-CatgryBlue',
  low: 'Filter-CatgryLowRsk',
};

const FilterCategories = memo(function FilterCategories({ category, handleChange }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const labels = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(CATEGORY_LABELS).map(([key, i18nKey]) => [key, t(i18nKey)])
      ),
    [t]
  );

  const [options, setOptions] = useState(() => {
    if (window.innerWidth < 760) {
      return { perPage: 2.5 };
    } else {
      return { perPage: 5 };
    }
  });

  const handleResize = () => {
    if (window.innerWidth < 760) {
      console.log('resized: small');
      setOptions({ perPage: 2.5 });
    } else {
      console.log('resized: large');
      setOptions({ perPage: 5 });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <Grid container spacing={2} className={classes.categories}>
      <Grid item xs={12}>
        <Typography variant={'h4'}>{t('Filter-Categories')}</Typography>
      </Grid>
      <Grid item xs={12} className={classes.filtersSlider}>
        <ReactSiema {...options}>
          {Object.entries(labels).map(([key, label]) => (
            <Grid item xs key={key} className={classes.filterItem}>
              <Button
                className={category === key ? classes.selected : classes[key]}
                fullWidth={true}
                disabled={category === key}
                onClick={() => handleChange('category', key)}
              >
                <Typography className={classes.text}>{label}</Typography>
                {category === key ? <ArrowDropDownIcon /> : ''}
              </Button>
            </Grid>
          ))}
        </ReactSiema>
      </Grid>
    </Grid>
  );
});

function Filter({ sortConfig, setSortConfig, platforms, filteredCount, allCount }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);

  const handleCheckbox = useCallback(
    event => {
      setSortConfig(current => ({
        ...current,
        [event.target.name]: event.target.checked,
      }));
    },
    [setSortConfig]
  );

  const handleChange = useCallback(
    (name, value) => {
      setSortConfig(current => ({ ...current, [name]: value }));
    },
    [setSortConfig]
  );

  const handleReset = useCallback(() => {
    setSortConfig(FILTER_DEFAULT);
  }, [setSortConfig]);

  const platformTypes = useMemo(() => {
    return {
      all: t('Filter-DropdwnDflt'),
      ...platforms,
    };
  }, [platforms, t]);

  const vaultTypes = useMemo(() => {
    return {
      all: t('Filter-DropdwnDflt'),
      single: t('Filter-AsstSingle'),
      stable: t('Filter-AsstStableLP'),
      stables: t('Filter-AsstStables'),
    };
  }, [t]);

  const networkTypes = useMemo(() => {
    return {
      all: t('Filter-DropdwnDflt'),
      ...getAvailableNetworks(),
    };
  }, [t]);

  const sortList = useMemo(() => {
    return {
      default: t('Filter-SortDflt'),
      apy: t('APY'),
      tvl: t('TVL'),
      safetyScore: t('Filter-SortSafety'),
    };
  }, [t]);

  const handleSortChange = useCallback(e => handleChange('key', e.target.value), [handleChange]);

  console.log(sortConfig);

  return (
    <>
      <FilterCategories category={sortConfig.category} handleChange={handleChange} />
      <Box className={classes.filtersContainer}>
        {/*Search*/}
        <Box className={classes.searchContainer}>
          <TextField
            className={classes.searchInput}
            size="small"
            variant="outlined"
            label={t('Filter-Search')}
            value={sortConfig.keyword}
            onChange={e => handleChange('keyword', e.target.value)}
            InputProps={{ className: classes.input }}
          />
          <Search className={classes.iconSearch} />
          {sortConfig.keyword.length > 3 && (
            <Button
              onClick={() => handleChange('keyword', '')}
              size="small"
              className={classes.btnClearSearch}
            >
              X
            </Button>
          )}
        </Box>
        {/*All/My Switch*/}
        <Box className={classes.toggleSwitchContainer}>
          <Button
            className={
              sortConfig.deposited === false
                ? classes.toggleSwitchButtonActive
                : classes.toggleSwitchButton
            }
            onClick={() => handleChange('deposited', false)}
          >
            {t('Filter-AllVaults')}
          </Button>
          <Button
            className={
              sortConfig.deposited === true
                ? classes.toggleSwitchButtonActive
                : classes.toggleSwitchButton
            }
            onClick={() => handleChange('deposited', true)}
          >
            {t('Filter-MyVaults')}
          </Button>
        </Box>
        {/*Dropdown*/}
        <Box className={classes.sortByContainer}>
          <LabeledDropdown
            list={sortList}
            selected={sortConfig.key}
            handler={handleSortChange}
            label={t('Filter-Sort')}
            selectStyle={{ width: '100%', minWidth: 'auto' }}
          />
        </Box>
        {/*All Filters Button*/}
        <Box className={classes.btnFilter}>
          <ToggleButton
            className={classes.blockBtn}
            value={filterOpen}
            selected={filterOpen}
            onChange={() => {
              setFilterOpen(!filterOpen);
            }}
          >
            <img src={require('images/filter.svg').default} alt="" className={classes.filterIcon} />
            {t('Filter-Btn')}
            {filterOpen ? <ArrowDropDownIcon /> : ''}
          </ToggleButton>
        </Box>
      </Box>
      <AnimateHeight duration={500} height={filterOpen ? 'auto' : 0}>
        <Box className={classes.filters}>
          <Box display="flex">
            <Box className={classes.checkboxes}>
              <FormGroup row>
                <FormControlLabel
                  label={t('Filter-HideZero')}
                  control={
                    <Checkbox
                      checked={sortConfig.zero}
                      onChange={handleCheckbox}
                      name="zero"
                      color="primary"
                    />
                  }
                />
                <FormControlLabel
                  label={t('Filter-Retired')}
                  control={
                    <Checkbox
                      checked={sortConfig.retired}
                      onChange={handleCheckbox}
                      name="retired"
                      color="primary"
                    />
                  }
                />
                <FormControlLabel
                  label={t('Filter-Deposited')}
                  control={
                    <Checkbox
                      checked={sortConfig.deposited}
                      onChange={handleCheckbox}
                      name="deposited"
                      color="primary"
                    />
                  }
                />
                <FormControlLabel
                  label={t('Filter-Boost')}
                  control={
                    <Checkbox
                      checked={sortConfig.boost}
                      onChange={handleCheckbox}
                      name="boost"
                      color="primary"
                    />
                  }
                />
              </FormGroup>
            </Box>
            <Box className={classes.lblShowing}>
              {t('Filter-Showing', {
                number: filteredCount,
                count: allCount,
              })}
            </Box>
          </Box>

          <Box className={classes.filtersContainer}>
            <Box className={classes.selectors}>
              <Box className={classes.selector}>
                <LabeledDropdown
                  list={platformTypes}
                  selected={sortConfig.platform}
                  handler={e => handleChange('platform', e.target.value)}
                  label={t('Filter-Platform')}
                />
              </Box>
              <Box className={classes.selector}>
                <LabeledDropdown
                  list={vaultTypes}
                  selected={sortConfig.vault}
                  handler={e => handleChange('vault', e.target.value)}
                  label={t('Filter-Type')}
                />
              </Box>
              <Box className={classes.selector}>
                <LabeledDropdown
                  list={networkTypes}
                  selected={sortConfig.blockchain}
                  handler={e => handleChange('blockchain', e.target.value)}
                  label={t('Filter-Blockchn')}
                />
              </Box>
            </Box>
            <Box className={classes.btnFilter}>
              <Button className={classes.btnReset} variant={'contained'} onClick={handleReset}>
                {t('Filter-Reset')}
              </Button>
            </Box>
          </Box>
        </Box>
      </AnimateHeight>
    </>
  );
}

export default memo(Filter);
