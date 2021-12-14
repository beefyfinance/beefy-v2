import React, { memo, useCallback, useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import { styles } from './styles';
import { LabeledDropdown } from '../../../../components/LabeledDropdown';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { getAvailableNetworks } from '../../../../helpers/utils';
import { ToggleButton } from '@material-ui/lab';
import { Search } from '@material-ui/icons';
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
      console.log(value);
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
            <img
              src={require(`../../../../images/filter.svg`).default}
              alt=""
              className={classes.filterIcon}
            />
            {t('Filter-Btn')}
            {filterOpen ? <ArrowDropDownIcon /> : ''}
          </ToggleButton>
        </Box>
      </Box>
      <AnimateHeight duration={500} height={filterOpen ? 'auto' : 0}>
        <Box className={classes.filters}>
          <Box className={classes.filtersInner}>
            <Box className={classes.checkboxes}>
              <FormGroup row>
                <FormControlLabel
                  className={classes.checkboxContainer}
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
                  className={classes.checkboxContainer}
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
                {/* <FormControlLabel
                  className={classes.checkboxContainer}
                  label={t('Filter-Deposited')}
                  control={
                    <Checkbox
                      checked={sortConfig.deposited}
                      onChange={handleCheckbox}
                      name="deposited"
                      color="primary"
                    />
                  }
                /> */}
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
              <Box className={classes.selector}>
                <Button className={classes.btnReset} variant={'contained'} onClick={handleReset}>
                  {t('Filter-Reset')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </AnimateHeight>
    </>
  );
};

export const Filter = memo(_Filter);
