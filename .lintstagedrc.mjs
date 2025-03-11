const ifStaged = fn => stagedFiles => stagedFiles.length === 0 ? [] : fn(stagedFiles);

export default {
  // tsc + eslint
  './(src|scripts|tools)/**/*.{ts,tsx,js}': ifStaged(stagedFiles => {
    const dirs = ['src', 'scripts', 'tools'];
    const changed = dirs.reduce((acc, dir) => {
      acc[dir] = stagedFiles.some(file => file.startsWith(`${dir}/`));
      return acc;
    }, {});
    if (!changed.src && !changed.scripts && !changed.tools) {
      return [];
    }

    const cmds = [];

    // tsc
    if (changed.src && (changed.scripts || changed.tools)) {
      cmds.push(`tsc --project tsconfig.json`);
    } else {
      if (changed.src) {
        cmds.push(`tsc --project tsconfig.app.json`);
      }
      if (changed.scripts || changed.tools) {
        cmds.push(`tsc --project tsconfig.scripts.json`);
      }
    }

    // eslint
    cmds.push(`eslint -c eslint.config.mjs --no-config-lookup ${dirs.filter(dir => !!changed[dir]).join(' ')}`);

    return cmds;
  }),
  // prettier
  './(src|scripts|tools)/**/*.{ts,tsx,js,json}': ifStaged(stagedFiles => [`prettier --write ${stagedFiles.join(' ')}`]),
};