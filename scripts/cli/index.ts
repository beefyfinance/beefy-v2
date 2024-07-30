import { ArgumentConfig, parse } from 'ts-command-line-args';
import fg from 'fast-glob';
import commandLineUsage from 'command-line-usage';
import path from 'node:path';
import { groupBy } from 'lodash';
import { loadCommand } from './commands';

type RunArgs = {
  command?: string;
};

async function start() {
  const allCommands = (
    await fg('*/*.ts', {
      cwd: path.join(__dirname, 'commands'),
      onlyFiles: true,
    })
  )
    .map(file => file.replace('.ts', '').replace('/', ':').replace(':index', ''))
    .sort();
  const groupedCommands = groupBy(allCommands, command => command.split(':')[0]);

  const runArgsConfig: ArgumentConfig<RunArgs> = {
    command: {
      type: String,
      description: 'The command to run',
      defaultOption: true,
      optional: true,
    },
  };

  const baseCommand = 'yarn cli';
  const args = parse<RunArgs>(runArgsConfig, { partial: true, baseCommand });
  if (!args.command || !allCommands.includes(args.command)) {
    console.log(
      commandLineUsage([
        {
          header: 'Beefy CLI',
          content: `To get help for a specific command, run \`${baseCommand} <command> --help\``,
        },
        ...(await Promise.all(
          Object.entries(groupedCommands).map(async ([group, commands]) => ({
            header: group,
            content: await Promise.all(
              commands.map(async command =>
                loadCommand(command).then(({ description }) => ({
                  command,
                  description,
                }))
              )
            ),
          }))
        )),
      ])
    );
    return;
  }

  const command = await loadCommand(args.command);
  const commandArgs = parse<{ help?: boolean }>(
    {
      ...command.args,
      help: {
        type: Boolean,
        optional: true,
      },
    },
    {
      headerContentSections: [{ header: args.command, content: command.description }],
      helpArg: 'help',
      argv: '_unknown' in args && Array.isArray(args._unknown) ? args._unknown : [],
      baseCommand: `${baseCommand} ${args.command}`,
    }
  );
  if (commandArgs.help) {
    return;
  }

  return await command.run(commandArgs);
}

start()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
