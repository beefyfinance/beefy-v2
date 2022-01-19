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
} from '@material-ui/core';
import { styles } from './styles';
import { LabeledDropdown } from '../../../../components/LabeledDropdown';
import { MultipleLabeledDropdown } from '../../../../components/MultipleLabeledDropdown';
import { getAvailableNetworks } from '../../../../helpers/utils';
import { Search, Close } from '@material-ui/icons';
import { FILTER_DEFAULT } from '../../hooks/useFilteredVaults';
import { FilterProps } from './FilterProps';
import { FilterCategories } from './FilterCategories';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';

const FILTER_DEFAULT_LOCAL = {
  blockchain: ['all'],
  vault: 'all',
  platform: 'all',
  boost: false,
  retired: false,
  zero: false,
};

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
  const [config, setConfig] = React.useState({
    blockchain: sortConfig.blockchain,
    vault: sortConfig.vault,
    platform: sortConfig.platform,
    boost: sortConfig.boost,
    retired: sortConfig.retired,
    zero: sortConfig.zero,
  });

  const [filtersCount, setFiltersCount] = useLocalStorage(FILTER_COUNT_KEY, 0);
  const [blockchain, setBlockchain] = React.useState<string[]>(config.blockchain);

  const handleChangeBlockchain = event => {
    let {
      target: { value },
    } = event;

    if (value.length === 0) {
      if (filteredCount >= 1) {
        setFiltersCount(current => current - 1);
      }
      setBlockchain(['all']);
    } else {
      if (value.includes('all')) {
        value = value.filter(value => value !== 'all');
      }
      if (value.length >= blockchain.length && !value.includes('all')) {
        setFiltersCount(current => current + 1);
      }

      if (value !== blockchain && value.length < blockchain.length) {
        setFiltersCount(current => current - 1);
      }
      setBlockchain(value);
    }
  };

  const handleCheckbox = useCallback(
    event => {
      setConfig(current => ({
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
    [filtersCount, setFiltersCount]
  );

  const handleChangeLocal = useCallback(
    (name, value) => {
      setConfig(current => ({ ...current, [name]: value }));
      if (value !== 'all') {
        setFiltersCount(current => current + 1);
      }

      if (value === 'all' && filtersCount >= 1) {
        setFiltersCount(current => current - 1);
      }
    },
    [filtersCount, setFiltersCount]
  );

  const handleChange = useCallback(
    (name, value) => {
      setSortConfig(current => ({ ...current, [name]: value }));
    },
    [setSortConfig]
  );

  const handleReset = useCallback(() => {
    setBlockchain(['all']);
    setConfig(FILTER_DEFAULT_LOCAL);
    setSortConfig(FILTER_DEFAULT);
    setFiltersCount(0);
  }, [setFiltersCount, setSortConfig]);

  const applyFilters = useCallback(() => {
    setSortConfig(current => ({ ...current, ...config, blockchain }));
    setAnchorEl(null);
  }, [blockchain, config, setSortConfig]);

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
                        <Close />
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
        {/*All Filters Button*/}
        <Button aria-describedby={id} onClick={handleClick} className={classes.btnFilter}>
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
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        className={classes.filter}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
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
                    checked={config.retired}
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
                    checked={config.boost}
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
              <LabeledDropdown
                fullWidth={true}
                list={platformTypes}
                selected={config.platform}
                handler={e => handleChangeLocal('platform', e.target.value)}
                label={t('Filter-Platform')}
              />
            </Box>
            <Box className={classes.selector}>
              <LabeledDropdown
                fullWidth={true}
                list={vaultTypes}
                selected={config.vault}
                handler={e => handleChangeLocal('vault', e.target.value)}
                label={t('Filter-Type')}
              />
            </Box>
            <Box className={classes.selector}>
              <MultipleLabeledDropdown
                fullWidth={true}
                list={networkTypes}
                selected={blockchain}
                handler={handleChangeBlockchain}
                renderValue={selected => (
                  <Typography className={classes.value}>
                    <span className={`${classes.label} label`}>{t('Filter-Blockchn')}</span>{' '}
                    {blockchain.length > 1 ? t('Filter-BlockchnMultiple') : selected.join('')}
                  </Typography>
                )}
                label={t('Filter-Blockchn')}
                multiple={true}
              />
            </Box>
          </Box>
        </Box>
        <Box className={classes.filterFooter}>
          <Button onClick={applyFilters} className={classes.btnApplyFilters}>
            {t('Filter-Apply')}
          </Button>
          <Button className={classes.btnReset} onClick={handleReset}>
            {t('Filter-Reset')}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export const Filter = memo(_Filter);
