import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
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
import { getAvailableNetworks } from '../../../../helpers/utils';
import { Search, Close } from '@material-ui/icons';
import { FILTER_DEFAULT } from '../../hooks/useFilteredVaults';
import { FilterProps } from './FilterProps';
import { FilterCategories } from './FilterCategories';

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
  const [config, setConfig] = React.useState(sortConfig);

  const handleCheckbox = useCallback(event => {
    setConfig(current => ({
      ...current,
      [event.target.name]: event.target.checked,
    }));
  }, []);

  const handleChange = useCallback((name, value) => {
    console.log(value);
    setConfig(current => ({ ...current, [name]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(FILTER_DEFAULT);
    setSortConfig(FILTER_DEFAULT);
  }, [setSortConfig]);

  const applyFilters = useCallback(() => {
    setSortConfig(config);
  }, [config, setSortConfig]);

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
                    {sortConfig.keyword.length > 3 ? (
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
        <Button onClick={handleClick} className={classes.btnFilter}>
          <img
            src={require(`../../../../images/filter.svg`).default}
            alt=""
            className={classes.filterIcon}
          />
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
      >
        <Box className={classes.filterContent}>
          <Typography variant="body1">
            {t('Filter-Showing', {
              number: filteredCount,
              count: allCount,
            })}
          </Typography>

          <Box className={classes.checkboxes}>
            <FormGroup>
              <FormControlLabel
                className={classes.checkboxContainer}
                label={t('Filter-HideZero')}
                control={
                  <Checkbox
                    checked={config.zero}
                    onChange={handleCheckbox}
                    name="zero"
                    color="primary"
                  />
                }
              />
              <FormControlLabel
                className={classes.checkboxContainer}
                label={t('Filter-Retired')}
                control={
                  <Checkbox
                    checked={config.retired}
                    onChange={handleCheckbox}
                    name="retired"
                    color="primary"
                  />
                }
              />
              <FormControlLabel
                className={classes.checkboxContainer}
                label={
                  <span className={classes.boostFilterLabel}>
                    <Avatar
                      alt="Fire"
                      src={require('../../../../images/fire.png').default}
                      imgProps={{
                        style: { objectFit: 'contain' },
                      }}
                    />
                    <Typography style={{ margin: 'auto' }}>{t('Filter-Boost')}</Typography>
                  </span>
                }
                control={
                  <Checkbox
                    checked={config.boost}
                    onChange={handleCheckbox}
                    name="boost"
                    color="primary"
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
                handler={e => handleChange('platform', e.target.value)}
                label={t('Filter-Platform')}
              />
            </Box>
            <Box className={classes.selector}>
              <LabeledDropdown
                fullWidth={true}
                list={vaultTypes}
                selected={config.vault}
                handler={e => handleChange('vault', e.target.value)}
                label={t('Filter-Type')}
              />
            </Box>
            <Box className={classes.selector}>
              <LabeledDropdown
                fullWidth={true}
                list={networkTypes}
                selected={config.blockchain}
                handler={e => handleChange('blockchain', e.target.value)}
                label={t('Filter-Blockchn')}
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
