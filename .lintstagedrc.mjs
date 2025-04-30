const ifStaged = fn => stagedFiles => stagedFiles.length === 0 ? [] : fn(stagedFiles);
const getMaxArgLength = () => {
  switch (process.platform) {
    case 'darwin':
      return 262144;
    case 'win32':
      return 8191;
    default:
      return 131072;
  }
};
const joinArgs = args => args.map(arg => arg.includes(' ') ? `"${arg}"` : arg).join(' ');
const makeCmd = (cmd, args) => `${cmd} ${joinArgs(args)}`;
const makeLongCmd = (cmd, args, argsIfLong) => {
  const maxArgLength = getMaxArgLength() / 2;
  const argsString = joinArgs(args);
  if (argsString.length <= maxArgLength) {
    return `${cmd} ${argsString}`;
  }
  return `${cmd} ${joinArgs(argsIfLong)}`;
};

export default {
  // tsc
  './(src|scripts|tools)/**/*.{ts,tsx,js}': ifStaged(stagedFiles => {
    const dirs = ['src', 'scripts', 'tools'];
    const changed = dirs.reduce((acc, dir) => {
      acc[dir] = stagedFiles.some(file => file.startsWith(`${dir}/`));
      return acc;
    }, {});
    if (!changed.src && !changed.scripts && !changed.tools) {
      return [];
    }

    if (changed.src && (changed.scripts || changed.tools)) {
      return [makeCmd('tsc', ['--project', 'tsconfig.json'])];
    } else {
      if (changed.src) {
        return [makeCmd('tsc', ['--project', 'tsconfig.app.json'])];
      }
      if (changed.scripts || changed.tools) {
        return [makeCmd('tsc', ['--project', 'tsconfig.scripts.json'])];
      }
    }

    return [];
  }),
  // eslint
  './(src|scripts|tools)/**/*.{tsx,ts,js}': ifStaged(stagedFiles => {
    const dirs = ['src', 'scripts', 'tools'];
    const changed = dirs.reduce((acc, dir) => {
      acc[dir] = stagedFiles.some(file => file.startsWith(`${dir}/`));
      return acc;
    }, {});
    const dirsToCheck = dirs.filter(dir => !!changed[dir]);
    if (dirsToCheck.length === 0) {
      return [];
    }
    return [makeCmd('eslint', ['-c', 'eslint.config.mjs', '--no-config-lookup', ...dirsToCheck])];
  }),
  // prettier
  './(src|scripts|tools)/**/*.{ts,tsx,js,json}': ifStaged(stagedFiles => {
    return [makeLongCmd('prettier', ['--write', ...stagedFiles], ['--write', 'src/**/*.{ts,tsx,json}'])];
  }),
};