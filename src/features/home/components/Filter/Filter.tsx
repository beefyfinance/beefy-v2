import React, { memo, useCallback, useMemo } from 'react';
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
import { getAvailableNetworks } from '../../../../helpers/utils';
import { Search, CloseRounded } from '@material-ui/icons';
import { FILTER_DEFAULT } from '../../hooks/useFilteredVaults';
import { FilterProps } from './FilterProps';
import { FilterCategories } from './FilterCategories';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';

import clsx from 'clsx';

const FILTER_COUNT_KEY = 'filteresCount';

const useStyles = makeStyles(styles as any);
const _Filter: React.FC<FilterProps> = ({
  sortConfig,
  setSortConfig,
  platforms,
  filteredCount,
  allCount,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [filtersCount, setFiltersCount] = useLocalStorage(FILTER_COUNT_KEY, 0);

  const handleChangeBlockchain = event => {
    let {
      target: { value },
    } = event;

    if (value.length === 0) {
      if (filteredCount >= 1) {
        setFiltersCount(current => current - 1);
      }
      setSortConfig(current => ({ ...current, blockchain: ['all'] }));
    } else {
      if (value.includes('all')) {
        value = value.filter(value => value !== 'all');
      }
      if (value.length >= sortConfig.blockchain.length && !value.includes('all')) {
        setFiltersCount(current => current + 1);
      }
      if (value !== sortConfig.blockchain && value.length < sortConfig.blockchain.length) {
        setFiltersCount(current => current - 1);
      }
      setSortConfig(current => ({ ...current, blockchain: value }));
    }
  };

  const handleCheckbox = useCallback(
    event => {
      setSortConfig(current => ({
        ...current,
        [event.target.name]: event.target.checked,
      }));
      if (event.target.checked !== false) {
        setFiltersCount(current => current + 1);
      }

      if (event.target.checked === false && filtersCount >= 1) {
        setFiltersCount(current => current - 1);
      }
    },
    [filtersCount, setFiltersCount, setSortConfig]
  );

  const handleChange = useCallback(
    (name, value) => {
      setSortConfig(current => ({ ...current, [name]: value }));
    },
    [setSortConfig]
  );

  const handleInputChange = useCallback(
    (name, value) => {
      setSortConfig(current => ({ ...current, [name]: value }));
      if (value !== 'all') {
        setFiltersCount(current => current + 1);
      }

      if (value === 'all' && filtersCount >= 1) {
        setFiltersCount(current => current - 1);
      }
    },
    [filtersCount, setFiltersCount, setSortConfig]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReset = useCallback(() => {
    setSortConfig(FILTER_DEFAULT);
    setFiltersCount(0);
  }, [setFiltersCount, setSortConfig]);

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
      lps: t('Filter-LPS'),
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleSortChange = useCallback(e => handleChange('key', e.target.value), [handleChange]);

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
            InputProps={{
              className: classes.input,
              endAdornment: (
                <>
                  <InputAdornment position="end">
                    {sortConfig.keyword.length >= 1 ? (
                      <IconButton
                        className={classes.iconSearch}
                        size="small"
                        onClick={() => handleChange('keyword', '')}
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
              [classes.btnFilterActive]: filtersCount >= 1,
            })}
          >
            {filtersCount >= 1 ? (
              <Box className={classes.badge}>{filtersCount}</Box>
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
        {/*All/My Switch*/}
        <Box className={classes.toggleSwitchContainer}>
          <Button
            className={
              sortConfig.deposited === false && sortConfig.zero === false
                ? classes.toggleSwitchButtonActive
                : classes.toggleSwitchButton
            }
            onClick={() => {
              handleChange('zero', false);
              handleChange('deposited', false);
            }}
          >
            {t('Filter-AllVaults')}
          </Button>
          <Button
            className={
              sortConfig.zero === true
                ? classes.toggleSwitchButtonActive
                : classes.toggleSwitchButton
            }
            onClick={() => {
              handleChange('deposited', false);
              handleChange('zero', true);
            }}
          >
            {t('Filter-Eligible')}
          </Button>
          <Button
            className={
              sortConfig.deposited === true
                ? classes.toggleSwitchButtonActive
                : classes.toggleSwitchButton
            }
            onClick={() => {
              handleChange('zero', false);
              handleChange('deposited', true);
            }}
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
        <Hidden mdDown>
          {/*All Filters Button*/}
          <Button
            aria-describedby={id}
            onClick={handleClick}
            className={clsx({
              [classes.btnFilter]: true,
              [classes.btnFilterActive]: filtersCount >= 1,
            })}
          >
            {filtersCount >= 1 ? (
              <Box className={classes.badge}>{filtersCount}</Box>
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
        <Button className={classes.btnReset} disabled={filtersCount < 1} onClick={handleReset}>
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
              number: filteredCount,
              count: allCount,
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
                    checked={sortConfig.retired}
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
                    checked={sortConfig.boost}
                    onChange={handleCheckbox}
                    name="boost"
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
                list={networkTypes}
                selected={sortConfig.blockchain}
                handler={handleChangeBlockchain}
                renderValue={selected => (
                  <Typography className={classes.value}>
                    <span className={`${classes.label} label`}>{t('Filter-Blockchn')}</span>{' '}
                    {sortConfig.blockchain.length > 1
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
                selected={sortConfig.platform}
                handler={e => handleInputChange('platform', e.target.value)}
                label={t('Filter-Platform')}
              />
            </Box>
            <Box className={classes.selector}>
              <LabeledDropdown
                noBorder={true}
                fullWidth={true}
                list={vaultTypes}
                selected={sortConfig.vault}
                handler={e => handleInputChange('vault', e.target.value)}
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
