import {config} from "../config/config";

let trimReg = /(^\s*)|(\s*$)/g;

export function isEmpty(key) {
  if (key === undefined || key === '' || key === null) {
    return true;
  }
  if (typeof key === 'string') {
    key = key.replace(trimReg, '');
    return key === '' || key === null || key === 'null' || key === undefined || key === 'undefined';
  } else if (typeof key === 'undefined') {
    return true;
  } else if (typeof key == 'object') {
    for (let i in key) {
      return false;
    }
    return true;
  } else if (typeof key == 'boolean') {
    return false;
  }
}

export const getAvailableNetworks = (abbrOnly = false) => {
  const networks = [];
  for(let key in config) {
    networks[key] = abbrOnly ? key.toUpperCase() : config[key].name;
  }

  return networks;
}

export const getStablesForNetwork = (net) => {
  return config[net].stableCoins;
}