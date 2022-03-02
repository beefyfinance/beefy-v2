import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Popover,
  Checkbox,
  FormControlLabel,
  FormGroup,
  makeStyles,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Hidden,
} from '@material-ui/core';
import { styles } from './styles';
import { LabeledDropdown } from '../../../../components/LabeledDropdown';
import { MultipleLabeledDropdown } from '../../../../components/MultipleLabeledDropdown';
import { Search, CloseRounded } from '@material-ui/icons';
import { FilterCategories } from './FilterCategories';
import { filteredVaultsActions, FilteredVaultsState } from '../../../data/reducers/filtered-vaults';
import { selectAllPlatform } from '../../../data/selectors/platforms';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllChains } from '../../../data/selectors/chains';
import { debounce } from 'lodash';
import {
  selectFilteredVaultCount,
  selectFilterOptions,
  selectFilterPopinFilterCount,
  selectHasActiveFilter,
  selectTotalVaultCount,
} from '../../../data/selectors/filtered-vaults';

const useStyles = makeStyles(styles as any);
const _Filter = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { t } = useTranslation();
  const filterOptions = useSelector(selectFilterOptions);
  const hasActiveFilter = useSelector(selectHasActiveFilter);
  const popinFilterCount = useSelector(selectFilterPopinFilterCount);
  const filteredVaultCount = useSelector(selectFilteredVaultCount);
  const totalVaultCount = useSelector(selectTotalVaultCount);
  const [localSearchText, setLocalSearchText] = useState(filterOptions.searchText);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleChangeBlockchain = useCallback(
    ({ target: { value } }) => {
      // last element is "all" so we filter by all
      if (value.length && value[value.length - 1] === 'all') {
        value = [];
      } else {
        value = value.filter(v => v !== 'all');
      }
      dispatch(filteredVaultsActions.setChainIds(value));
    },
    [dispatch]
  );

  const handleCheckbox = useCallback(
    ({ target: { name, checked } }) => {
      if (name === 'boost') {
        dispatch(filteredVaultsActions.setOnlyBoosted(checked));
      } else if (name === 'retired') {
        dispatch(filteredVaultsActions.setOnlyRetired(checked));
      } else if (name === 'moonpot') {
        dispatch(filteredVaultsActions.setOnlyMoonpot(checked));
      }
    },
    [dispatch]
  );

  const handlePlatformChange = useCallback(
    ({ target: { value } }) =>
      dispatch(filteredVaultsActions.setPlatformId(value === 'all' ? null : value)),
    [dispatch]
  );

  const handleUserCategoryChange = useCallback(
    (userCategory: FilteredVaultsState['userCategory']) =>
      dispatch(filteredVaultsActions.setUserCategory(userCategory)),
    [dispatch]
  );

  const handleVaultTypeChange = useCallback(
    ({ target: { value } }) => dispatch(filteredVaultsActions.setVaultType(value)),
    [dispatch]
  );

  const handleSortChange = useCallback(
    ({ target: { value } }) => dispatch(filteredVaultsActions.setSort(value)),
    [dispatch]
  );

  const syncSearchText = useMemo(
    () => debounce(value => dispatch(filteredVaultsActions.setSearchText(value)), 200),
    [dispatch]
  );
  const handleSearchTextChange = useCallback(
    ({ target: { value } }) => {
      setLocalSearchText(value);
      syncSearchText(value);
    },
    [setLocalSearchText, syncSearchText]
  );
  const clearSearchText = useCallback(() => {
    setLocalSearchText('');
    dispatch(filteredVaultsActions.setSearchText(''));
  }, [dispatch, setLocalSearchText]);

  const handleReset = useCallback(() => {
    setLocalSearchText('');
    dispatch(filteredVaultsActions.reset());
  }, [dispatch]);

  React.useEffect(() => {
    if (filterOptions.reseted) {
      setLocalSearchText('');
    }
  }, [filterOptions.reseted, setLocalSearchText]);

  const platforms = useSelector(selectAllPlatform);
  const platformTypes = useMemo(() => {
    const list = {
      all: t('Filter-DropdwnDflt'),
    };
    for (const platform of platforms) {
      list[platform.id] = platform.name;
    }
    return list;
  }, [platforms, t]);

  const vaultTypes = useMemo(() => {
    return {
      all: t('Filter-DropdwnDflt'),
      single: t('Filter-AsstSingle'),
      lps: t('Filter-LPS'),
    };
  }, [t]);

  const chains = useSelector(selectAllChains);
  const chainTypes = useMemo(() => {
    const list = {
      all: t('Filter-DropdwnDflt'),
    };
    for (const chain of chains) {
      list[chain.id] = chain.name;
    }
    return list;
  }, [chains, t]);

  const sortList = useMemo(() => {
    return {
      default: t('Filter-SortDflt'),
      apy: t('APY'),
      tvl: t('TVL'),
      safetyScore: t('Filter-SortSafety'),
    };
  }, [t]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <FilterCategories />
      <Box className={classes.filtersContainer}>
        {/*Search*/}
        <Box className={classes.searchContainer}>
          <TextField
            className={classes.searchInput}
            size="small"
            variant="outlined"
            label={t('Filter-Search')}
            value={localSearchText}
            onChange={handleSearchTextChange}
            InputProps={{
              className: classes.input,
              endAdornment: (
                <>
                  <InputAdornment position="end">
                    {filterOptions.searchText.length >= 1 ? (
                      <IconButton
                        className={classes.iconSearch}
                        size="small"
                        onClick={clearSearchText}
                      >
                        <CloseRounded />
                      </IconButton>
                    ) : (
                      <IconButton className={classes.iconSearch} size="small">
                        <Search />
                      </IconButton>
                    )}
                  </InputAdornment>
                </>
              ),
            }}
          />
        </Box>
        <Hidden lgUp={true}>
          {/*All Filters Button*/}
          <Button
            aria-describedby={id}
            onClick={handleClick}
            className={clsx({
              [classes.btnFilter]: true,
              [classes.btnFilterActive]: open || popinFilterCount >= 1,
            })}
          >
            {popinFilterCount >= 1 ? (
              <Box className={classes.badge}>{popinFilterCount}</Box>
            ) : (
              <img
                src={require(`../../../../images/filter.svg`).default}
                alt=""
                className={classes.filterIcon}
              />
            )}
            {t('Filter-Btn')}
          </Button>
        </Hidden>
        {/*All/Eligible/My Switch*/}
        <Box className={classes.toggleSwitchContainer}>
          <Button
            className={
              filterOptions.userCategory === 'all'
                ? classes.toggleSwitchButtonActive
                : classes.toggleSwitchButton
            }
            onClick={() => handleUserCategoryChange('all')}
          >
            {t('Filter-AllVaults')}
          </Button>
          <Button
            className={
              filterOptions.userCategory === 'eligible'
                ? classes.toggleSwitchButtonActive
                : classes.toggleSwitchButton
            }
            onClick={() => handleUserCategoryChange('eligible')}
          >
            {t('Filter-Eligible')}
          </Button>
          <Button
            className={
              filterOptions.userCategory === 'deposited'
                ? classes.toggleSwitchButtonActive
                : classes.toggleSwitchButton
            }
            onClick={() => handleUserCategoryChange('deposited')}
          >
            {t('Filter-MyVaults')}
          </Button>
        </Box>
        {/*Dropdown*/}
        <Box className={classes.sortByContainer}>
          <LabeledDropdown
            list={sortList}
            selected={filterOptions.sort}
            handler={handleSortChange}
            label={t('Filter-Sort')}
            selectStyle={{ width: '100%', minWidth: 'auto' }}
          />
        </Box>
        <Hidden mdDown>
          {/*All Filters Button*/}
          <Button
            aria-describedby={id}
            onClick={handleClick}
            className={clsx({
              [classes.btnFilter]: true,
              [classes.btnFilterActive]: open || popinFilterCount >= 1,
            })}
          >
            {popinFilterCount >= 1 ? (
              <Box className={classes.badge}>{popinFilterCount}</Box>
            ) : (
              <img
                src={require(`../../../../images/filter.svg`).default}
                alt=""
                className={classes.filterIcon}
              />
            )}
            {t('Filter-Btn')}
          </Button>
        </Hidden>
        {/* Clear Filter Button */}
        <Button className={classes.btnReset} disabled={!hasActiveFilter} onClick={handleReset}>
          <CloseRounded />
          {t('Filter-Reset')}
        </Button>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        className={classes.filter}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box className={classes.filterContent}>
          <Typography variant="body1">
            {t('Filter-Showing', {
              number: filteredVaultCount,
              count: totalVaultCount,
            })}
          </Typography>

          <Box>
            <FormGroup>
              <FormControlLabel
                className={classes.checkboxContainer}
                label={
                  <Typography className={classes.label} variant="body1">
                    {t('Filter-Retired')}
                  </Typography>
                }
                control={
                  <Checkbox
                    checked={filterOptions.onlyRetired}
                    onChange={handleCheckbox}
                    name="retired"
                    className={classes.checkbox}
                  />
                }
              />
              <FormControlLabel
                className={classes.checkboxContainer}
                label={
                  <Typography className={classes.label} variant="body1">
                    {t('Filter-Boost')}
                  </Typography>
                }
                control={
                  <Checkbox
                    checked={filterOptions.onlyBoosted}
                    onChange={handleCheckbox}
                    name="boost"
                    className={classes.checkbox}
                  />
                }
              />
              <FormControlLabel
                className={classes.checkboxContainer}
                label={
                  <Typography className={classes.labelMoonpot} variant="body1">
                    <img src={require('../../../../images/pots.svg').default} alt="pots" />{' '}
                    {t('Filter-Moonpot')}
                  </Typography>
                }
                control={
                  <Checkbox
                    checked={filterOptions.onlyMoonpot}
                    onChange={handleCheckbox}
                    name="moonpot"
                    className={classes.checkbox}
                  />
                }
              />
            </FormGroup>
          </Box>
          <Box className={classes.selectors}>
            <Box className={classes.selector}>
              <MultipleLabeledDropdown
                fullWidth={true}
                noBorder={true}
                list={chainTypes}
                selected={filterOptions.chainIds.length === 0 ? ['all'] : filterOptions.chainIds}
                handler={handleChangeBlockchain}
                renderValue={selected => (
                  <Typography className={classes.value}>
                    <span className={`${classes.label} label`}>{t('Filter-Blockchn')}</span>{' '}
                    {filterOptions.chainIds.length > 1
                      ? t('Filter-BlockchnMultiple')
                      : selected.join('')}
                  </Typography>
                )}
                label={t('Filter-Blockchn')}
                multiple={true}
              />
            </Box>
            <Box className={classes.selector}>
              <LabeledDropdown
                fullWidth={true}
                noBorder={true}
                list={platformTypes}
                selected={filterOptions.platformId === null ? 'all' : filterOptions.platformId}
                handler={handlePlatformChange}
                label={t('Filter-Platform')}
              />
            </Box>
            <Box className={classes.selector}>
              <LabeledDropdown
                noBorder={true}
                fullWidth={true}
                list={vaultTypes}
                selected={filterOptions.vaultType}
                handler={handleVaultTypeChange}
                label={t('Filter-Type')}
              />
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export const Filter = memo(_Filter);
